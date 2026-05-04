import { Test, TestingModule } from '@nestjs/testing';
import { FindActiveUsersUseCase } from '../../../src/use-cases/user/find-active-users.use-case';

describe('FindActiveUsersUseCase', () => {
  let useCase: FindActiveUsersUseCase;
  let userRepository: any;

  beforeEach(async () => {
    userRepository = {
      findActive: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindActiveUsersUseCase,
        {
          provide: 'UserRepository',
          useValue: userRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindActiveUsersUseCase>(FindActiveUsersUseCase);
  });

  it('should return active users', async () => {
    const mockUsers = [{ cpf: '1' }, { cpf: '2' }];
    userRepository.findActive.mockResolvedValue(mockUsers);

    const result = await useCase.execute();

    expect(result).toEqual(mockUsers);
    expect(userRepository.findActive).toHaveBeenCalled();
  });
});
