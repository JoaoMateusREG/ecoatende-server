import { Test, TestingModule } from '@nestjs/testing';
import { ListUsersUseCase } from '../../../src/use-cases/user/list-users.use-case';
import { UserRole } from '../../../src/utils/user-role';

describe('ListUsersUseCase', () => {
  let useCase: ListUsersUseCase;
  let userRepository: any;

  beforeEach(async () => {
    userRepository = {
      findActive: jest.fn(),
      findByCpf: jest.fn(),
      findByOrganization: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListUsersUseCase,
        {
          provide: 'UserRepository',
          useValue: userRepository,
        },
      ],
    }).compile();

    useCase = module.get<ListUsersUseCase>(ListUsersUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all active users when no requestingUserCpf is provided', async () => {
    const mockUsers = [{ cpf: '1' }];
    userRepository.findActive.mockResolvedValue(mockUsers);

    const result = await useCase.execute();

    expect(result).toEqual(mockUsers);
    expect(userRepository.findActive).toHaveBeenCalled();
  });

  it('should throw error if requesting user is not found', async () => {
    userRepository.findByCpf.mockResolvedValue(null);

    await expect(useCase.execute('req_cpf')).rejects.toThrow('Usuário solicitante não encontrado');
  });

  it('should return only the requesting user if role is USER', async () => {
    const mockUser = { cpf: 'req_cpf', role: UserRole.USER };
    userRepository.findByCpf.mockResolvedValue(mockUser);

    const result = await useCase.execute('req_cpf');

    expect(result).toEqual([mockUser]);
  });

  it('should return users from same organization if role is ORGANIZATION_ADMIN', async () => {
    const mockUser = { cpf: 'req_cpf', role: UserRole.ORGANIZATION_ADMIN, organizationCnpj: 'org1' };
    const mockOrgUsers = [{ cpf: '2', organizationCnpj: 'org1' }];
    userRepository.findByCpf.mockResolvedValue(mockUser);
    userRepository.findByOrganization.mockResolvedValue(mockOrgUsers);

    const result = await useCase.execute('req_cpf');

    expect(result).toEqual(mockOrgUsers);
    expect(userRepository.findByOrganization).toHaveBeenCalledWith('org1');
  });

  it('should return all active users if role is ADMIN', async () => {
    const mockUser = { cpf: 'req_cpf', role: UserRole.ADMIN };
    const mockUsers = [{ cpf: '2' }];
    userRepository.findByCpf.mockResolvedValue(mockUser);
    userRepository.findActive.mockResolvedValue(mockUsers);

    const result = await useCase.execute('req_cpf');

    expect(result).toEqual(mockUsers);
    expect(userRepository.findActive).toHaveBeenCalled();
  });
});
