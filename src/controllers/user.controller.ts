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
  @ApiOperation({
    summary: 'Criar novo usuário',
    description: `
      Permissões:
      - ADMIN: pode criar usuários em qualquer organização
      - ORGANIZATION_ADMIN: pode criar usuários apenas na própria organização
      - USER: não pode criar usuários
    `,
  })
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
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    try {
      const user = await this.createUserUseCase.execute(
        createUserDto,
        currentUser.cpf,
      );
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
  @ApiOperation({
    summary: 'Atualizar usuário',
    description: `
      Permissões:
      - ADMIN: pode atualizar qualquer usuário
      - ORGANIZATION_ADMIN: pode atualizar apenas usuários da própria organização
      - USER: pode atualizar apenas a si mesmo
    `,
  })
  @ApiParam({
    name: 'cpf',
    description: 'CPF do usuário',
    example: '123.456.789-01',
  })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async update(
    @Param('cpf') cpf: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    try {
      const user = await this.getUserUseCase.execute(cpf, currentUser.cpf);
      if (!user) {
        throw new HttpException(
          { error: 'Usuário não encontrado' },
          HttpStatus.NOT_FOUND,
        );
      }

      const updatedUser = await this.updateUserUseCase.execute(
        {
          ...user,
          ...updateUserDto,
          cpf,
        },
        currentUser.cpf,
      );

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
  @ApiOperation({
    summary: 'Deletar usuário',
    description: `
      Permissões:
      - ADMIN: pode deletar qualquer usuário
      - ORGANIZATION_ADMIN: pode deletar apenas usuários da própria organização
      - USER: não pode deletar usuários
    `,
  })
  @ApiParam({
    name: 'cpf',
    description: 'CPF do usuário',
    example: '123.456.789-01',
  })
  @ApiResponse({ status: 204, description: 'Usuário deletado com sucesso' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async remove(
    @Param('cpf') cpf: string,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    try {
      await this.deleteUserUseCase.execute(cpf, currentUser.cpf);
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Listar usuários',
    description: `
      Permissões:
      - ADMIN: retorna todos os usuários
      - ORGANIZATION_ADMIN: retorna apenas usuários da própria organização
      - USER: retorna apenas o próprio usuário
    `,
  })
  @ApiResponse({ status: 200, description: 'Lista de usuários' })
  async findAll(@CurrentUser() currentUser: CurrentUserType) {
    try {
      const users = await this.listUsersUseCase.execute(currentUser.cpf);
      return users;
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('organization/:organizationCnpj')
  @ApiOperation({
    summary: 'Buscar usuários por organização',
    description: `
      Permissões:
      - ADMIN: pode buscar usuários de qualquer organização
      - ORGANIZATION_ADMIN: pode buscar apenas usuários da própria organização
      - USER: não pode usar esta rota
    `,
  })
  @ApiParam({
    name: 'organizationCnpj',
    description: 'CNPJ da organização',
    example: '12.345.678/0001-90',
  })
  @ApiResponse({ status: 200, description: 'Lista de usuários da organização' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async findByOrganization(
    @Param('organizationCnpj') organizationCnpj: string,
    @CurrentUser() currentUser: CurrentUserType,
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
  @ApiOperation({
    summary: 'Buscar usuário por CPF',
    description: `
      Permissões:
      - ADMIN: pode buscar qualquer usuário
      - ORGANIZATION_ADMIN: pode buscar apenas usuários da própria organização
      - USER: pode buscar apenas a si mesmo
    `,
  })
  @ApiParam({
    name: 'cpf',
    description: 'CPF do usuário',
    example: '123.456.789-01',
  })
  @ApiResponse({ status: 200, description: 'Usuário encontrado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async findOne(
    @Param('cpf') cpf: string,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    try {
      const user = await this.getUserUseCase.execute(cpf, currentUser.cpf);
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
