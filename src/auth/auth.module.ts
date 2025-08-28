import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SessionService } from './session.service';
import { SessionAuthGuard } from './session-auth.guard';
import { PrismaUserRepository } from '../repositories/prisma/prisma-user.repository';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    SessionService,
    SessionAuthGuard,
    {
      provide: 'UserRepository',
      useClass: PrismaUserRepository,
    }
  ],
  exports: [AuthService, SessionService, SessionAuthGuard],
})
export class AuthModule {} 