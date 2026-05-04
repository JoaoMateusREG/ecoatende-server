import { Test, TestingModule } from '@nestjs/testing';
import { CountCardsByOrganizationUseCase } from '../../../src/use-cases/card/count-cards-by-organization.use-case';

describe('CountCardsByOrganizationUseCase', () => {
  let useCase: CountCardsByOrganizationUseCase;
  let cardRepository: any;

  beforeEach(async () => {
    cardRepository = {
      countPendingByOrganization: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountCardsByOrganizationUseCase,
        {
          provide: 'CardRepository',
          useValue: cardRepository,
        },
      ],
    }).compile();

    useCase = module.get<CountCardsByOrganizationUseCase>(CountCardsByOrganizationUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the count of pending cards by organization', async () => {
    const mockCount = 5;
    cardRepository.countPendingByOrganization.mockResolvedValue(mockCount);

    const result = await useCase.execute('org1');

    expect(result).toBe(mockCount);
    expect(cardRepository.countPendingByOrganization).toHaveBeenCalledWith('org1');
  });
});
