import { Module } from '@nestjs/common';
import { UserController } from '../controllers/user.controller';
import { CreateUserUseCase } from '../use-cases/user/create-user.use-case';
import { UpdateUserUseCase } from '../use-cases/user/update-user.use-case';
import { DeleteUserUseCase } from '../use-cases/user/delete-user.use-case';
import { GetUserUseCase } from '../use-cases/user/get-user.use-case';
import { ListUsersUseCase } from '../use-cases/user/list-users.use-case';
import { FindUsersByOrganizationUseCase } from '../use-cases/user/find-users-by-organization.use-case';
import { ChangePasswordUseCase } from '../use-cases/user/change-password.use-case';
import { PrismaUserRepository } from '../repositories/prisma/prisma-user.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    GetUserUseCase,
    ListUsersUseCase,
    FindUsersByOrganizationUseCase,
    ChangePasswordUseCase,
    {
      provide: 'UserRepository',
      useClass: PrismaUserRepository,
    }
  ]
})
export class UserModule {} 