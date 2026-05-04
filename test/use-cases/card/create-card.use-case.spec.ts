import { Test, TestingModule } from '@nestjs/testing';
import { CreateCardUseCase } from '../../../src/use-cases/card/create-card.use-case';
import { CardNumberGenerator } from '../../../src/utils/card-number-generator';
import { CardStatus } from '../../../src/entities/card';

jest.mock('../../../src/utils/date.utils', () => ({
  nowBrasilia: jest.fn(() => new Date('2026-05-04T12:00:00Z')),
}));

describe('CreateCardUseCase', () => {
  let useCase: CreateCardUseCase;
  let cardRepository: any;
  let serviceRepository: any;
  let cardNumberGenerator: any;

  beforeEach(async () => {
    cardRepository = {
      create: jest.fn(),
    };
    serviceRepository = {
      findById: jest.fn(),
    };
    cardNumberGenerator = {
      generateCardNumber: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCardUseCase,
        {
          provide: 'CardRepository',
          useValue: cardRepository,
        },
        {
          provide: 'ServiceRepository',
          useValue: serviceRepository,
        },
        {
          provide: CardNumberGenerator,
          useValue: cardNumberGenerator,
        },
      ],
    }).compile();

    useCase = module.get<CreateCardUseCase>(CreateCardUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw error if service is not found', async () => {
    serviceRepository.findById.mockResolvedValue(null);

    const dto = { serviceId: '1', priority: 'NORMAL', organizationCnpj: 'org1', userCpf: '123' };

    await expect(useCase.execute(dto as any)).rejects.toThrow('Serviço não encontrado');
  });

  it('should throw error if service does not allow card creation', async () => {
    serviceRepository.findById.mockResolvedValue({ canCreateCards: false });

    const dto = { serviceId: '1', priority: 'NORMAL', organizationCnpj: 'org1', userCpf: '123' };

    await expect(useCase.execute(dto as any)).rejects.toThrow('Este serviço não permite criação de fichas');
  });

  it('should create a normal card successfully', async () => {
    serviceRepository.findById.mockResolvedValue({ canCreateCards: true, prefix: 'N', cardLimit: 100 });
    cardNumberGenerator.generateCardNumber.mockResolvedValue('N001');
    cardRepository.create.mockImplementation(card => Promise.resolve(card));

    const dto = { serviceId: '1', priority: 'NORMAL', organizationCnpj: 'org1', userCpf: '123' };

    const result = await useCase.execute(dto as any);

    expect(cardNumberGenerator.generateCardNumber).toHaveBeenCalledWith(1, 'N', 100);
    expect(cardRepository.create).toHaveBeenCalled();
    expect(result.card).toBe('N001');
    expect(result.status).toBe(CardStatus.WAITING);
    expect(result.priority).toBe('NORMAL');
  });

  it('should prepend P to preferential cards', async () => {
    serviceRepository.findById.mockResolvedValue({ canCreateCards: true, prefix: 'N', cardLimit: 100 });
    cardNumberGenerator.generateCardNumber.mockResolvedValue('N001');
    cardRepository.create.mockImplementation(card => Promise.resolve(card));

    const dto = { serviceId: '1', priority: 'PREFERENTIAL', organizationCnpj: 'org1', userCpf: '123' };

    const result = await useCase.execute(dto as any);

    expect(result.card).toBe('PN001');
    expect(result.priority).toBe('PREFERENTIAL');
  });
});
