import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
import { PanelModule } from './modules/panel.module';
import { AppController } from './app.controller';
import { CloudflareModule } from './modules/cloudflare.module';
import { WebhookModule } from './modules/webhook.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100, // Limite de 100 requisições por minuto por IP
    }]),
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
    PanelModule,
    CloudflareModule,
    WebhookModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
