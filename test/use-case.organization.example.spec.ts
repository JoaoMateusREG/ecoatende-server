import { Test, TestingModule } from '@nestjs/testing';
import { CreateOrganizationUseCase } from '../src/use-cases/organization/create-organization.use-case';
import { PrismaOrganizationRepository } from '../src/repositories/prisma/prisma-organization.repository';
import { PrismaUserRepository } from '../src/repositories/prisma/prisma-user.repository';

describe('CreateOrganizationUseCase', () => {
  let createOrganizationUseCase: CreateOrganizationUseCase;
  let organizationRepository: PrismaOrganizationRepository;
  let userRepository: PrismaUserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateOrganizationUseCase,
        {
          provide: 'OrganizationRepository',
          useClass: PrismaOrganizationRepository,
        },
        {
          provide: 'UserRepository',
          useClass: PrismaUserRepository,
        },
      ],
    }).compile();

    createOrganizationUseCase = module.get<CreateOrganizationUseCase>(
      CreateOrganizationUseCase,
    );
    organizationRepository = module.get('OrganizationRepository');
    userRepository = module.get('UserRepository');
  });

  describe('execute', () => {
    it('should create organization without permission check when no CPF is provided', async () => {
      const organizationDto = {
        cnpj: '12345678000199',
        name: 'Test Organization',
        email: 'test@example.com',
        phone: '1234567890',
        customerId: 'cust_123',
        active: true,
      };

      // Chama o use case SEM passar o CPF do usuário (sem verificação de permissão)
      const result = await createOrganizationUseCase.execute(organizationDto);

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Organization');
      expect(result.cnpj).toBe('12345678000199');
    });

    it('should create organization when user is ADMIN', async () => {
      // Mock do usuário ADMIN
      jest.spyOn(userRepository, 'findByCpf').mockResolvedValue({
        cpf: '00000000000',
        name: 'Admin User',
        password: 'hashed_password',
        role: 'ADMIN',
        organizationCnpj: '99999999000199',
        isActive: true,
      } as any);

      const organizationDto = {
        cnpj: '12345678000199',
        name: 'Test Organization',
        email: 'test@example.com',
        phone: '1234567890',
        customerId: 'cust_123',
        active: true,
      };

      // Chama o use case PASSANDO o CPF do usuário ADMIN
      const result = await createOrganizationUseCase.execute(
        organizationDto,
        '00000000000',
      );

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Organization');
    });

    it('should throw error when user is not ADMIN', async () => {
      // Mock do usuário não-ADMIN
      jest.spyOn(userRepository, 'findByCpf').mockResolvedValue({
        cpf: '11111111111',
        name: 'Regular User',
        password: 'hashed_password',
        role: 'USER',
        organizationCnpj: '99999999000199',
        isActive: true,
      } as any);

      const organizationDto = {
        cnpj: '12345678000199',
        name: 'Test Organization',
        email: 'test@example.com',
        phone: '1234567890',
        customerId: 'cust_123',
        active: true,
      };

      // Deve lançar erro porque o usuário não é ADMIN
      await expect(
        createOrganizationUseCase.execute(organizationDto, '11111111111'),
      ).rejects.toThrow('Você não tem permissão para criar organizações');
    });

    it('should throw error when user is ORGANIZATION_ADMIN', async () => {
      // Mock do usuário ORGANIZATION_ADMIN
      jest.spyOn(userRepository, 'findByCpf').mockResolvedValue({
        cpf: '22222222222',
        name: 'Org Admin User',
        password: 'hashed_password',
        role: 'ORGANIZATION_ADMIN',
        organizationCnpj: '99999999000199',
        isActive: true,
      } as any);

      const organizationDto = {
        cnpj: '12345678000199',
        name: 'Test Organization',
        email: 'test@example.com',
        phone: '1234567890',
        customerId: 'cust_123',
        active: true,
      };

      // Deve lançar erro porque ORGANIZATION_ADMIN não pode criar organizações
      await expect(
        createOrganizationUseCase.execute(organizationDto, '22222222222'),
      ).rejects.toThrow('Você não tem permissão para criar organizações');
    });
  });
});
