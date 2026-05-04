import { Test, TestingModule } from '@nestjs/testing';
import { FindUsersByOrganizationUseCase } from '../../../src/use-cases/user/find-users-by-organization.use-case';

describe('FindUsersByOrganizationUseCase', () => {
  let useCase: FindUsersByOrganizationUseCase;
  let userRepository: any;

  beforeEach(async () => {
    userRepository = {
      findByOrganization: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindUsersByOrganizationUseCase,
        {
          provide: 'UserRepository',
          useValue: userRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindUsersByOrganizationUseCase>(FindUsersByOrganizationUseCase);
  });

  it('should return users by organization', async () => {
    const mockUsers = [{ cpf: '1', organizationCnpj: 'org1' }];
    userRepository.findByOrganization.mockResolvedValue(mockUsers);

    const result = await useCase.execute('org1');

    expect(result).toEqual(mockUsers);
    expect(userRepository.findByOrganization).toHaveBeenCalledWith('org1');
  });
});
