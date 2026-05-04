import { Test, TestingModule } from '@nestjs/testing';
import { FindUsersByServiceUseCase } from '../../../src/use-cases/user/find-users-by-service.use-case';

describe('FindUsersByServiceUseCase', () => {
  let useCase: FindUsersByServiceUseCase;
  let userRepository: any;

  beforeEach(async () => {
    userRepository = {
      findByService: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindUsersByServiceUseCase,
        {
          provide: 'UserRepository',
          useValue: userRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindUsersByServiceUseCase>(FindUsersByServiceUseCase);
  });

  it('should return users by service id', async () => {
    const mockUsers = [{ cpf: '1' }];
    userRepository.findByService.mockResolvedValue(mockUsers);

    const result = await useCase.execute(1);

    expect(result).toEqual(mockUsers);
    expect(userRepository.findByService).toHaveBeenCalledWith(1);
  });
});
