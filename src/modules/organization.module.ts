import { Module } from '@nestjs/common';
import { OrganizationController } from '../controllers/organization.controller';
import { CreateOrganizationUseCase } from '../use-cases/organization/create-organization.use-case';
import { UpdateOrganizationUseCase } from '../use-cases/organization/update-organization.use-case';
import { DeleteOrganizationUseCase } from '../use-cases/organization/delete-organization.use-case';
import { FindOrganizationByCnpjUseCase } from '../use-cases/organization/find-organization-by-cnpj.use-case';
import { FindOrganizationByNameUseCase } from '../use-cases/organization/find-organization-by-name.use-case';
import { FindAllOrganizationsUseCase } from '../use-cases/organization/find-all-organizations.use-case';
import { FindOrganizationWithUsersUseCase } from '../use-cases/organization/find-organization-with-users.use-case';
import { FindOrganizationWithServicesUseCase } from '../use-cases/organization/find-organization-with-services.use-case';
import { FindOrganizationWithCardsUseCase } from '../use-cases/organization/find-organization-with-cards.use-case';
import { PrismaOrganizationRepository } from '../repositories/prisma/prisma-organization.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [OrganizationController],
  providers: [
    CreateOrganizationUseCase,
    UpdateOrganizationUseCase,
    DeleteOrganizationUseCase,
    FindOrganizationByCnpjUseCase,
    FindOrganizationByNameUseCase,
    FindAllOrganizationsUseCase,
    FindOrganizationWithUsersUseCase,
    FindOrganizationWithServicesUseCase,
    FindOrganizationWithCardsUseCase,
    {
      provide: 'OrganizationRepository',
      useClass: PrismaOrganizationRepository,
    }
  ]
})
export class OrganizationModule {} 