import { Module } from '@nestjs/common';
import { SiteOrganizationAdmController } from 'src/controllers/site.controller';
import { CreateOrganizationUseCase } from '../use-cases/organization/create-organization.use-case';
import { CreateUserUseCase } from '../use-cases/user/create-user.use-case';
import { FindOrganizationByCnpjUseCase } from '../use-cases/organization/find-organization-by-cnpj.use-case';
import { CreatedOrganizationGatewayUseCase } from '../use-cases/organization/created-organization-gateway.use-case';
import { AuthModule } from '../auth/auth.module';
import { PrismaOrganizationRepository } from '../repositories/prisma/prisma-organization.repository';
import { PrismaUserRepository } from '../repositories/prisma/prisma-user.repository';

@Module({
  imports: [AuthModule],
  controllers: [SiteOrganizationAdmController],
  providers: [
    CreateOrganizationUseCase,
    CreateUserUseCase,
    CreatedOrganizationGatewayUseCase,
    FindOrganizationByCnpjUseCase,
    {
      provide: 'OrganizationRepository',
      useClass: PrismaOrganizationRepository,
    },
    { provide: 'UserRepository', 
      useClass: PrismaUserRepository
 },
  ],
})
export class SiteOrganizationAdmModule {}
