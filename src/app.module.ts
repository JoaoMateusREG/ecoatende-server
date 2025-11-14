import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { UserModule } from './modules/user.module';
import { CardModule } from './modules/card.module';
import { ServiceModule } from './modules/service.module';
import { OrganizationModule } from './modules/organization.module';
import { AuthModule } from './auth/auth.module';
import { SetupModule } from './modules/setup.module';
import { WebsocketModule } from './websocket/websocket.module';
import { ReportModule } from './modules/report.module';
import { PaymentModule } from './modules/payment.module';
import { SubscriptionModule } from './modules/subscription.module';
import { SiteOrganizationAdmModule } from './modules/site.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    AuthModule,
    UserModule,
    CardModule,
    ServiceModule,
    OrganizationModule,
    SetupModule,
    WebsocketModule,
    ReportModule,
    PaymentModule,
    SubscriptionModule,
    SiteOrganizationAdmModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
