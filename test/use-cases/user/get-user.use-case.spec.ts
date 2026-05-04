import { Test, TestingModule } from '@nestjs/testing';
import { GetUserUseCase } from '../../../src/use-cases/user/get-user.use-case';
import { UserRole } from '../../../src/utils/user-role';

describe('GetUserUseCase', () => {
  let useCase: GetUserUseCase;
  let userRepository: any;

  beforeEach(async () => {
    userRepository = {
      findByCpf: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserUseCase,
        {
          provide: 'UserRepository',
          useValue: userRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetUserUseCase>(GetUserUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return null if user is not found', async () => {
    userRepository.findByCpf.mockResolvedValue(null);

    const result = await useCase.execute('123');

    expect(result).toBeNull();
  });

  it('should return user without requestingUser context', async () => {
    const mockUser = { cpf: '123' };
    userRepository.findByCpf.mockResolvedValue(mockUser);

    const result = await useCase.execute('123');

    expect(result).toEqual(mockUser);
  });

  it('should throw error if requesting user is not found', async () => {
    userRepository.findByCpf
      .mockResolvedValueOnce({ cpf: '123' })
      .mockResolvedValueOnce(null);

    await expect(useCase.execute('123', 'req_cpf')).rejects.toThrow('Usuário solicitante não encontrado');
  });

  it('should throw error if USER tries to view another user', async () => {
    userRepository.findByCpf
      .mockResolvedValueOnce({ cpf: '123' })
      .mockResolvedValueOnce({ cpf: 'req_cpf', role: UserRole.USER });

    await expect(useCase.execute('123', 'req_cpf')).rejects.toThrow('Você não tem permissão para visualizar outros usuários');
  });

  it('should allow USER to view themselves', async () => {
    const mockUser = { cpf: '123', role: UserRole.USER };
    userRepository.findByCpf
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(mockUser);

    const result = await useCase.execute('123', '123');
    expect(result).toEqual(mockUser);
  });

  it('should throw error if ORGANIZATION_ADMIN tries to view user from another org', async () => {
    userRepository.findByCpf
      .mockResolvedValueOnce({ cpf: '123', organizationCnpj: 'org1' })
      .mockResolvedValueOnce({ cpf: 'req_cpf', role: UserRole.ORGANIZATION_ADMIN, organizationCnpj: 'org2' });

    await expect(useCase.execute('123', 'req_cpf')).rejects.toThrow('Você só pode visualizar usuários da sua própria organização');
  });

  it('should allow ORGANIZATION_ADMIN to view user from same org', async () => {
    const mockUser = { cpf: '123', organizationCnpj: 'org1' };
    userRepository.findByCpf
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce({ cpf: 'req_cpf', role: UserRole.ORGANIZATION_ADMIN, organizationCnpj: 'org1' });

    const result = await useCase.execute('123', 'req_cpf');
    expect(result).toEqual(mockUser);
  });

  it('should allow ADMIN to view any user', async () => {
    const mockUser = { cpf: '123', organizationCnpj: 'org1' };
    userRepository.findByCpf
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce({ cpf: 'req_cpf', role: UserRole.ADMIN, organizationCnpj: 'org_admin' });

    const result = await useCase.execute('123', 'req_cpf');
    expect(result).toEqual(mockUser);
  });
});
