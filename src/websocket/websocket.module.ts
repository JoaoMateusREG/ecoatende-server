import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { WebsocketController } from '../controllers/websocket.controller';
import { SessionService } from '../auth/session.service';

@Module({
  controllers: [WebsocketController],
  providers: [WebsocketGateway, SessionService],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
