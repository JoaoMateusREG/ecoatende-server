import { Module } from '@nestjs/common';
import { SetupController } from '../controllers/setup.controller';
import { SetupService } from '../services/setup.service';
import { PrismaUserRepository } from '../repositories/prisma/prisma-user.repository';
import { PrismaOrganizationRepository } from '../repositories/prisma/prisma-organization.repository';

@Module({
  controllers: [SetupController],
  providers: [
    SetupService,
    {
      provide: 'UserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'OrganizationRepository',
      useClass: PrismaOrganizationRepository,
    },
  ],
})
export class SetupModule {}
