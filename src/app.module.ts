import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user.module';
import { CardModule } from './modules/card.module';
import { ServiceModule } from './modules/service.module';
import { OrganizationModule } from './modules/organization.module';
import { AuthModule } from './auth/auth.module';
import { SetupModule } from './modules/setup.module';
import { WebsocketModule } from './websocket/websocket.module';
import { ReportModule } from './modules/report.module';

@Module({
  imports: [AuthModule, UserModule, CardModule, ServiceModule, OrganizationModule, SetupModule, WebsocketModule, ReportModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
