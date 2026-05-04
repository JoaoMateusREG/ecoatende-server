import { Test, TestingModule } from '@nestjs/testing';
import { CountCardsByServiceAndDateUseCase } from '../../../src/use-cases/card/count-cards-by-service-and-date.use-case';

describe('CountCardsByServiceAndDateUseCase', () => {
  let useCase: CountCardsByServiceAndDateUseCase;
  let cardRepository: any;

  beforeEach(async () => {
    cardRepository = {
      countByServiceAndDate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountCardsByServiceAndDateUseCase,
        {
          provide: 'CardRepository',
          useValue: cardRepository,
        },
      ],
    }).compile();

    useCase = module.get<CountCardsByServiceAndDateUseCase>(CountCardsByServiceAndDateUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the count of cards by service and date', async () => {
    const mockCount = 3;
    const testDate = new Date('2026-05-04');
    cardRepository.countByServiceAndDate.mockResolvedValue(mockCount);

    const result = await useCase.execute(1, testDate);

    expect(result).toBe(mockCount);
    expect(cardRepository.countByServiceAndDate).toHaveBeenCalledWith(1, testDate);
  });
});
