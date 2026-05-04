import { Test, TestingModule } from '@nestjs/testing';
import { FindUserByCpfUseCase } from '../../../src/use-cases/user/find-user-by-cpf.use-case';

describe('FindUserByCpfUseCase', () => {
  let useCase: FindUserByCpfUseCase;
  let userRepository: any;

  beforeEach(async () => {
    userRepository = {
      findByCpf: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindUserByCpfUseCase,
        {
          provide: 'UserRepository',
          useValue: userRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindUserByCpfUseCase>(FindUserByCpfUseCase);
  });

  it('should return a user by CPF', async () => {
    const mockUser = { cpf: '123' };
    userRepository.findByCpf.mockResolvedValue(mockUser);

    const result = await useCase.execute('123');

    expect(result).toEqual(mockUser);
    expect(userRepository.findByCpf).toHaveBeenCalledWith('123');
  });

  it('should return null if user not found', async () => {
    userRepository.findByCpf.mockResolvedValue(null);

    const result = await useCase.execute('123');

    expect(result).toBeNull();
  });
});
