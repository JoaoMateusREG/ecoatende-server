import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticateUserUseCase } from '../../../src/use-cases/user/authenticate-user.use-case';

describe('AuthenticateUserUseCase', () => {
  let useCase: AuthenticateUserUseCase;
  let userRepository: any;

  beforeEach(async () => {
    userRepository = {
      findByCpfAndPassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticateUserUseCase,
        {
          provide: 'UserRepository',
          useValue: userRepository,
        },
      ],
    }).compile();

    useCase = module.get<AuthenticateUserUseCase>(AuthenticateUserUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return a user when credentials are valid', async () => {
    const mockUser = { cpf: '12345678901', name: 'Test User' };
    userRepository.findByCpfAndPassword.mockResolvedValue(mockUser);

    const result = await useCase.execute('12345678901', 'password123');

    expect(result).toEqual(mockUser);
    expect(userRepository.findByCpfAndPassword).toHaveBeenCalledWith(
      '12345678901',
      'password123',
    );
  });

  it('should return null when credentials are invalid', async () => {
    userRepository.findByCpfAndPassword.mockResolvedValue(null);

    const result = await useCase.execute('12345678901', 'wrongpassword');

    expect(result).toBeNull();
    expect(userRepository.findByCpfAndPassword).toHaveBeenCalledWith(
      '12345678901',
      'wrongpassword',
    );
  });
});
