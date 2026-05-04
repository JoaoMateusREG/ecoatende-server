import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from '../../../src/use-cases/user/create-user.use-case';
import { UserRole } from '../../../src/utils/user-role';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');
jest.mock('../../../src/utils/cpf-validator', () => ({
  isValidCPF: jest.fn().mockImplementation((cpf) => cpf === 'valid_cpf'),
}));

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: any;

  beforeEach(async () => {
    userRepository = {
      findByCpf: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        {
          provide: 'UserRepository',
          useValue: userRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a user when valid data is provided (no requesting user)', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
    userRepository.create.mockImplementation((user) => Promise.resolve(user));

    const dto = {
      cpf: 'valid_cpf',
      name: 'Test',
      password: 'pass',
      organizationCnpj: '123',
      role: UserRole.USER,
    };

    const result = await useCase.execute(dto);

    expect(result).toBeDefined();
    expect(result.password).toBe('hashed_password');
    expect(userRepository.create).toHaveBeenCalled();
  });

  it('should throw error when CPF is invalid', async () => {
    const dto = {
      cpf: 'invalid_cpf',
      name: 'Test',
      password: 'pass',
      organizationCnpj: '123',
      role: UserRole.USER,
    };

    await expect(useCase.execute(dto)).rejects.toThrow('CPF inválido');
  });

  it('should throw error if requesting user has role USER', async () => {
    userRepository.findByCpf.mockResolvedValue({ role: UserRole.USER });

    const dto = {
      cpf: 'valid_cpf',
      name: 'Test',
      password: 'pass',
      organizationCnpj: '123',
      role: UserRole.USER,
    };

    await expect(useCase.execute(dto, 'req_cpf')).rejects.toThrow(
      'Você não tem permissão para criar usuários',
    );
  });

  it('should throw error if ORGANIZATION_ADMIN tries to create user in another organization', async () => {
    userRepository.findByCpf.mockResolvedValue({
      role: UserRole.ORGANIZATION_ADMIN,
      organizationCnpj: '999',
    });

    const dto = {
      cpf: 'valid_cpf',
      name: 'Test',
      password: 'pass',
      organizationCnpj: '123', // Different CNPJ
      role: UserRole.USER,
    };

    await expect(useCase.execute(dto, 'req_cpf')).rejects.toThrow(
      'Você só pode criar usuários da sua própria organização',
    );
  });

  it('should throw error if ORGANIZATION_ADMIN tries to create an ADMIN', async () => {
    userRepository.findByCpf.mockResolvedValue({
      role: UserRole.ORGANIZATION_ADMIN,
      organizationCnpj: '123',
    });

    const dto = {
      cpf: 'valid_cpf',
      name: 'Test',
      password: 'pass',
      organizationCnpj: '123', // Same CNPJ
      role: UserRole.ADMIN,
    };

    await expect(useCase.execute(dto, 'req_cpf')).rejects.toThrow(
      'Você não tem permissão para criar administradores',
    );
  });
});
