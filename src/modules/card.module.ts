import { Module } from '@nestjs/common';
import { CardController } from '../controllers/card.controller';
import { CreateCardUseCase } from '../use-cases/card/create-card.use-case';
import { UpdateCardUseCase } from '../use-cases/card/update-card.use-case';
import { DeleteCardUseCase } from '../use-cases/card/delete-card.use-case';
import { FindCardByIdUseCase } from '../use-cases/card/find-card-by-id.use-case';
import { FindCardsByServiceUseCase } from '../use-cases/card/find-cards-by-service.use-case';
import { FindPendingCardsUseCase } from '../use-cases/card/find-pending-cards.use-case';
import { FindTodayCalledCardsUseCase } from '../use-cases/card/find-today-called-cards.use-case';
import { FindCardByNumberAndDateUseCase } from '../use-cases/card/find-card-by-number-and-date.use-case';
import { FindTodayConcludedCardsUseCase } from '../use-cases/card/find-concluded-cards.use-case';
import { FindTodayCreatedByOrganizationAndServiceUseCase } from '../use-cases/card/find-today-created-by-organization-and-service.use-case';
import { CountCardsByServiceAndDateUseCase } from '../use-cases/card/count-cards-by-service-and-date.use-case';
import { CountCardsByOrganizationUseCase } from '../use-cases/card/count-cards-by-organization.use-case';
import { CountConcludedTodayCardsByOrganizationUseCase } from '../use-cases/card/count-concluded-today-cards-by-organization.use-case';
import { CountInAttendanceCardsByOrganizationUseCase } from '../use-cases/card/count-in-attendance-cards-by-organization.use-case';
import { GetCardsSummaryByOrganizationUseCase } from '../use-cases/card/get-cards-summary-by-organization.use-case';
import { FindInAttendanceCardsUseCase } from '../use-cases/card/find-in-attendance-cards.use-case';
import { GetAverageWaitTimeUseCase } from '../use-cases/card/get-average-wait-time.use-case';
import { GetAverageServiceTimeUseCase } from '../use-cases/card/get-average-service-time.use-case';
import { GetCompletedCardsCountUseCase } from '../use-cases/card/get-completed-cards-count.use-case';
import { PrismaCardRepository } from '../repositories/prisma/prisma-card.repository';
import { PrismaServiceRepository } from '../repositories/prisma/prisma-service.repository';
import { WebsocketModule } from '../websocket/websocket.module';
import { AuthModule } from '../auth/auth.module';
import { CardNumberGenerator } from 'src/utils/card-number-generator';

@Module({
  imports: [WebsocketModule, AuthModule],
  controllers: [CardController],
  providers: [
    CreateCardUseCase,
    UpdateCardUseCase,
    DeleteCardUseCase,
    FindCardByIdUseCase,
    FindCardsByServiceUseCase,
    FindPendingCardsUseCase,
    FindTodayCalledCardsUseCase,
    FindCardByNumberAndDateUseCase,
    FindTodayConcludedCardsUseCase,
    CountCardsByServiceAndDateUseCase,
    FindInAttendanceCardsUseCase,
    CountCardsByOrganizationUseCase,
    CountConcludedTodayCardsByOrganizationUseCase,
    CountInAttendanceCardsByOrganizationUseCase,
    GetCardsSummaryByOrganizationUseCase,
    GetAverageWaitTimeUseCase,
    GetAverageServiceTimeUseCase,
    GetCompletedCardsCountUseCase,
    FindTodayCreatedByOrganizationAndServiceUseCase,
    CardNumberGenerator,
    {
      provide: 'CardRepository',
      useClass: PrismaCardRepository,
    },
    {
      provide: 'ServiceRepository',
      useClass: PrismaServiceRepository,
    },
    {
      provide: 'CreateCardUseCase',
      useClass: PrismaServiceRepository,
    }
  ]
})
export class CardModule {} 