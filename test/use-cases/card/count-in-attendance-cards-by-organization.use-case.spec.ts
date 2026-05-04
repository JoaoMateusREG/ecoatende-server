import { Test, TestingModule } from '@nestjs/testing';
import { CountInAttendanceCardsByOrganizationUseCase } from '../../../src/use-cases/card/count-in-attendance-cards-by-organization.use-case';

describe('CountInAttendanceCardsByOrganizationUseCase', () => {
  let useCase: CountInAttendanceCardsByOrganizationUseCase;
  let cardRepository: any;

  beforeEach(async () => {
    cardRepository = {
      countInAttendanceByOrganization: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountInAttendanceCardsByOrganizationUseCase,
        {
          provide: 'CardRepository',
          useValue: cardRepository,
        },
      ],
    }).compile();

    useCase = module.get<CountInAttendanceCardsByOrganizationUseCase>(CountInAttendanceCardsByOrganizationUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the count of in attendance cards by organization', async () => {
    const mockCount = 2;
    cardRepository.countInAttendanceByOrganization.mockResolvedValue(mockCount);

    const result = await useCase.execute('org1');

    expect(result).toBe(mockCount);
    expect(cardRepository.countInAttendanceByOrganization).toHaveBeenCalledWith('org1');
  });
});
