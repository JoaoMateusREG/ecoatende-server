import { Test, TestingModule } from '@nestjs/testing';
import { ChangePasswordUseCase } from '../../../src/use-cases/user/change-password.use-case';
import { User } from '../../../src/entities/user';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');
jest.mock('../../../src/utils/cpf-validator', () => ({
  isValidCPF: jest.fn().mockReturnValue(true),
}));

describe('ChangePasswordUseCase', () => {
  let useCase: ChangePasswordUseCase;
  let userRepository: any;

  beforeEach(async () => {
    userRepository = {
      findByCpf: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangePasswordUseCase,
        {
          provide: 'UserRepository',
          useValue: userRepository,
        },
      ],
    }).compile();

    useCase = module.get<ChangePasswordUseCase>(ChangePasswordUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should change password successfully', async () => {
    const mockUser = { cpf: '12345678909', password: 'old_hashed_password' };
    userRepository.findByCpf.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');

    await useCase.execute({
      cpf: '12345678909',
      currentPassword: 'old_password',
      newPassword: 'new_password',
    });

    expect(userRepository.update).toHaveBeenCalled();
    const updatedUserArgs = userRepository.update.mock.calls[0][0];
    expect(updatedUserArgs.password).toBe('new_hashed_password');
  });

  it('should throw error if user not found', async () => {
    userRepository.findByCpf.mockResolvedValue(null);

    await expect(
      useCase.execute({
        cpf: '12345678909',
        currentPassword: 'old_password',
        newPassword: 'new_password',
      }),
    ).rejects.toThrow('Usuário não encontrado');
  });

  it('should throw error if current password is wrong', async () => {
    const mockUser = { cpf: '12345678909', password: 'old_hashed_password' };
    userRepository.findByCpf.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      useCase.execute({
        cpf: '12345678909',
        currentPassword: 'wrong_password',
        newPassword: 'new_password',
      }),
    ).rejects.toThrow('Senha atual incorreta');
  });
});
