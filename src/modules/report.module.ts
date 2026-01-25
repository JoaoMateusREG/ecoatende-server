import { Module } from '@nestjs/common';
import { ReportController } from '../controllers/report.controller';
import { GetAverageWaitTimeUseCase } from '../use-cases/card/get-average-wait-time.use-case';
import { GetAverageServiceTimeUseCase } from '../use-cases/card/get-average-service-time.use-case';
import { GetCompletedCardsCountUseCase } from '../use-cases/card/get-completed-cards-count.use-case';
import { PrismaCardRepository } from '../repositories/prisma/prisma-card.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ReportController],
  providers: [
    GetAverageWaitTimeUseCase,
    GetAverageServiceTimeUseCase,
    GetCompletedCardsCountUseCase,
    {
      provide: 'CardRepository',
      useClass: PrismaCardRepository,
    },
  ],
})
export class ReportModule {}
