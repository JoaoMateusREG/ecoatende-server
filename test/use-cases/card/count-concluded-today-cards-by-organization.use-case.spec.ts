import { Test, TestingModule } from '@nestjs/testing';
import { CountConcludedTodayCardsByOrganizationUseCase } from '../../../src/use-cases/card/count-concluded-today-cards-by-organization.use-case';

describe('CountConcludedTodayCardsByOrganizationUseCase', () => {
  let useCase: CountConcludedTodayCardsByOrganizationUseCase;
  let cardRepository: any;

  beforeEach(async () => {
    cardRepository = {
      countConcludedTodayByOrganization: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountConcludedTodayCardsByOrganizationUseCase,
        {
          provide: 'CardRepository',
          useValue: cardRepository,
        },
      ],
    }).compile();

    useCase = module.get<CountConcludedTodayCardsByOrganizationUseCase>(CountConcludedTodayCardsByOrganizationUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the count of concluded today cards by organization', async () => {
    const mockCount = 10;
    cardRepository.countConcludedTodayByOrganization.mockResolvedValue(mockCount);

    const result = await useCase.execute('org1');

    expect(result).toBe(mockCount);
    expect(cardRepository.countConcludedTodayByOrganization).toHaveBeenCalledWith('org1');
  });
});
