import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { CreateUserUseCase } from '../use-cases/user/create-user.use-case';
import { UpdateUserUseCase } from '../use-cases/user/update-user.use-case';
import { DeleteUserUseCase } from '../use-cases/user/delete-user.use-case';
import { GetUserUseCase } from '../use-cases/user/get-user.use-case';
import { ListUsersUseCase } from '../use-cases/user/list-users.use-case';
import { FindUsersByOrganizationUseCase } from '../use-cases/user/find-users-by-organization.use-case';
import { ChangePasswordUseCase } from '../use-cases/user/change-password.use-case';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import {
  CurrentUser,
  CurrentUser as CurrentUserType,
} from '../decorators/current-user.decorator';

@ApiTags('Usuários')
@Controller('users')
@UseGuards(SessionAuthGuard)
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly findUsersByOrganizationUseCase: FindUsersByOrganizationUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo usuário' })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    schema: {
      type: 'object',
      properties: {
        cpf: { type: 'string', example: '123.456.789-01' },
        name: { type: 'string', example: 'João Silva' },
        organizationCnpj: { type: 'string', example: '12.345.678/0001-90' },
        isActive: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.createUserUseCase.execute(createUserDto);
      return {
        cpf: user.cpf,
        name: user.name,
        organizationCnpj: user.organizationCnpj,
        isActive: user.isActive,
      };
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('change-password')
  @ApiOperation({ summary: 'Alterar senha do usuário' })
  @ApiResponse({ status: 200, description: 'Senha alterada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    try {
      await this.changePasswordUseCase.execute({
        ...changePasswordDto,
        cpf: currentUser.cpf,
      });

      return { message: 'Senha alterada com sucesso' };
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':cpf')
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiParam({
    name: 'cpf',
    description: 'CPF do usuário',
    example: '123.456.789-01',
  })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async update(
    @Param('cpf') cpf: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      const user = await this.getUserUseCase.execute(cpf);
      if (!user) {
        throw new HttpException(
          { error: 'Usuário não encontrado' },
          HttpStatus.NOT_FOUND,
        );
      }

      const updatedUser = await this.updateUserUseCase.execute({
        ...user,
        ...updateUserDto,
        cpf,
      });

      return updatedUser;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':cpf')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar usuário' })
  @ApiParam({
    name: 'cpf',
    description: 'CPF do usuário',
    example: '123.456.789-01',
  })
  @ApiResponse({ status: 204, description: 'Usuário deletado com sucesso' })
  async remove(@Param('cpf') cpf: string) {
    try {
      await this.deleteUserUseCase.execute(cpf);
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({ status: 200, description: 'Lista de usuários' })
  async findAll() {
    try {
      const users = await this.listUsersUseCase.execute();
      return users;
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('organization/:organizationCnpj')
  @ApiOperation({ summary: 'Buscar usuários por organização' })
  @ApiParam({
    name: 'organizationCnpj',
    description: 'CNPJ da organização',
    example: '12.345.678/0001-90',
  })
  @ApiResponse({ status: 200, description: 'Lista de usuários da organização' })
  async findByOrganization(
    @Param('organizationCnpj') organizationCnpj: string,
  ) {
    try {
      const users =
        await this.findUsersByOrganizationUseCase.execute(organizationCnpj);
      return users;
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':cpf')
  @ApiOperation({ summary: 'Buscar usuário por CPF' })
  @ApiParam({
    name: 'cpf',
    description: 'CPF do usuário',
    example: '123.456.789-01',
  })
  @ApiResponse({ status: 200, description: 'Usuário encontrado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findOne(@Param('cpf') cpf: string) {
    try {
      const user = await this.getUserUseCase.execute(cpf);
      if (!user) {
        throw new HttpException(
          { error: 'Usuário não encontrado' },
          HttpStatus.NOT_FOUND,
        );
      }
      return user;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }
}
