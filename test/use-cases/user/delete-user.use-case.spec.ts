import { Test, TestingModule } from '@nestjs/testing';
import { DeleteUserUseCase } from '../../../src/use-cases/user/delete-user.use-case';
import { UserRole } from '../../../src/utils/user-role';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let userRepository: any;

  beforeEach(async () => {
    userRepository = {
      findByCpf: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserUseCase,
        {
          provide: 'UserRepository',
          useValue: userRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delete user when no requesting user is provided', async () => {
    userRepository.findByCpf.mockResolvedValue({ cpf: '123', organizationCnpj: 'org1' });

    await useCase.execute('123');

    expect(userRepository.delete).toHaveBeenCalledWith('123');
  });

  it('should throw error when user to delete is not found', async () => {
    userRepository.findByCpf.mockResolvedValue(null);

    await expect(useCase.execute('123')).rejects.toThrow('Usuário não encontrado');
  });

  it('should throw error when requesting user is not found', async () => {
    userRepository.findByCpf
      .mockResolvedValueOnce({ cpf: '123' }) // userToDelete
      .mockResolvedValueOnce(null); // requestingUser

    await expect(useCase.execute('123', 'req_cpf')).rejects.toThrow('Usuário solicitante não encontrado');
  });

  it('should throw error if requesting user has role USER', async () => {
    userRepository.findByCpf
      .mockResolvedValueOnce({ cpf: '123' })
      .mockResolvedValueOnce({ role: UserRole.USER });

    await expect(useCase.execute('123', 'req_cpf')).rejects.toThrow('Você não tem permissão para deletar usuários');
  });

  it('should throw error if ORGANIZATION_ADMIN deletes user from another organization', async () => {
    userRepository.findByCpf
      .mockResolvedValueOnce({ cpf: '123', organizationCnpj: 'org1' })
      .mockResolvedValueOnce({ role: UserRole.ORGANIZATION_ADMIN, organizationCnpj: 'org2' });

    await expect(useCase.execute('123', 'req_cpf')).rejects.toThrow('Você só pode deletar usuários da sua própria organização');
  });

  it('should allow ORGANIZATION_ADMIN to delete user from same organization', async () => {
    userRepository.findByCpf
      .mockResolvedValueOnce({ cpf: '123', organizationCnpj: 'org1' })
      .mockResolvedValueOnce({ role: UserRole.ORGANIZATION_ADMIN, organizationCnpj: 'org1' });

    await useCase.execute('123', 'req_cpf');

    expect(userRepository.delete).toHaveBeenCalledWith('123');
  });

  it('should allow ADMIN to delete any user', async () => {
    userRepository.findByCpf
      .mockResolvedValueOnce({ cpf: '123', organizationCnpj: 'org1' })
      .mockResolvedValueOnce({ role: UserRole.ADMIN, organizationCnpj: 'org_admin' });

    await useCase.execute('123', 'req_cpf');

    expect(userRepository.delete).toHaveBeenCalledWith('123');
  });
});
