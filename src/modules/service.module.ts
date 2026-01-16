import { Module } from '@nestjs/common';
import { ServiceController } from '../controllers/service.controller';
import { CreateServiceUseCase } from '../use-cases/service/create-service.use-case';
import { UpdateServiceUseCase } from '../use-cases/service/update-service.use-case';
import { DeleteServiceUseCase } from '../use-cases/service/delete-service.use-case';
import { FindServiceByIdUseCase } from '../use-cases/service/find-service-by-id.use-case';
import { FindServicesByOrganizationUseCase } from '../use-cases/service/find-services-by-organization.use-case';
import { FindServicesByUserUseCase } from '../use-cases/service/find-services-by-user.use-case';
import { FindServiceByNameUseCase } from '../use-cases/service/find-service-by-name.use-case';
import { FindActiveServicesUseCase } from '../use-cases/service/find-active-services.use-case';
import { PrismaServiceRepository } from '../repositories/prisma/prisma-service.repository';
import { PrismaUserRepository } from '../repositories/prisma/prisma-user.repository';
import { PrismaCardRepository } from '../repositories/prisma/prisma-card.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ServiceController],
  providers: [
    CreateServiceUseCase,
    UpdateServiceUseCase,
    DeleteServiceUseCase,
    FindServiceByIdUseCase,
    FindServicesByOrganizationUseCase,
    FindServicesByUserUseCase,
    FindServiceByNameUseCase,
    FindActiveServicesUseCase,
    {
      provide: 'ServiceRepository',
      useClass: PrismaServiceRepository,
    },
    {
      provide: 'UserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'CardRepository',
      useClass: PrismaCardRepository,
    },
  ],
})
export class ServiceModule {}
