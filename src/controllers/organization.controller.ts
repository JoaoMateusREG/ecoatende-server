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
import {
  CurrentUser,
  CurrentUser as CurrentUserType,
} from '../decorators/current-user.decorator';
import { CreateOrganizationUseCase } from '../use-cases/organization/create-organization.use-case';
import { CreatedOrganizationGatewayUseCase } from '../use-cases/organization/created-organization-gateway.use-case';
import { UpdateOrganizationUseCase } from '../use-cases/organization/update-organization.use-case';
import { DeleteOrganizationUseCase } from '../use-cases/organization/delete-organization.use-case';
import { FindOrganizationByCnpjUseCase } from '../use-cases/organization/find-organization-by-cnpj.use-case';
import { FindOrganizationByNameUseCase } from '../use-cases/organization/find-organization-by-name.use-case';
import { FindAllOrganizationsUseCase } from '../use-cases/organization/find-all-organizations.use-case';
import { FindOrganizationWithUsersUseCase } from '../use-cases/organization/find-organization-with-users.use-case';
import { FindOrganizationWithServicesUseCase } from '../use-cases/organization/find-organization-with-services.use-case';
import { FindOrganizationWithCardsUseCase } from '../use-cases/organization/find-organization-with-cards.use-case';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';

@ApiTags('Organizações')
@Controller('organizations')
@UseGuards(SessionAuthGuard)
export class OrganizationController {
  constructor(
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
    private readonly createdOrganizationGatewayUseCase: CreatedOrganizationGatewayUseCase,
    private readonly updateOrganizationUseCase: UpdateOrganizationUseCase,
    private readonly deleteOrganizationUseCase: DeleteOrganizationUseCase,
    private readonly findOrganizationByCnpjUseCase: FindOrganizationByCnpjUseCase,
    private readonly findOrganizationByNameUseCase: FindOrganizationByNameUseCase,
    private readonly findAllOrganizationsUseCase: FindAllOrganizationsUseCase,
    private readonly findOrganizationWithUsersUseCase: FindOrganizationWithUsersUseCase,
    private readonly findOrganizationWithServicesUseCase: FindOrganizationWithServicesUseCase,
    private readonly findOrganizationWithCardsUseCase: FindOrganizationWithCardsUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar nova organização (com registro no Gateway)',
    description: `
      Permissões:
      - ADMIN: pode criar organizações
      - ORGANIZATION_ADMIN: não pode criar organizações
      - USER: não pode criar organizações
    `,
  })
  @ApiResponse({ status: 201, description: 'Organização criada com sucesso' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou falha no Gateway',
  })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async create(
    @Body() createOrganizationDto: CreateOrganizationDto,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    try {
      const gatewayResponse =
        await this.createdOrganizationGatewayUseCase.execute(
          createOrganizationDto,
        );
      const customerId = gatewayResponse.id;
      const organizationWithCustomerId = {
        ...createOrganizationDto,
        customerId: customerId,
      };

      const organization = await this.createOrganizationUseCase.execute(
        organizationWithCustomerId,
        currentUser.cpf,
      );
      return organization;
    } catch (error: any) {
      console.error('Erro no fluxo de criação da organização:', error.message);
      throw new HttpException(
        {
          error: error.message,
          details: error.response || error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':cnpj')
  @ApiOperation({
    summary: 'Buscar organização por CNPJ',
    description: `
      Permissões:
      - ADMIN: pode buscar qualquer organização
      - ORGANIZATION_ADMIN: pode buscar apenas a própria organização
      - USER: pode buscar apenas a própria organização
    `,
  })
  @ApiParam({
    name: 'cnpj',
    description: 'CNPJ da organização',
    example: '12.345.678/0001-90',
  })
  @ApiResponse({ status: 200, description: 'Organização encontrada' })
  @ApiResponse({ status: 404, description: 'Organização não encontrada' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async findOne(
    @Param('cnpj') cnpj: string,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    try {
      const organization = await this.findOrganizationByCnpjUseCase.execute(
        cnpj,
        currentUser.cpf,
      );
      if (!organization) {
        throw new HttpException(
          { error: 'Organização não encontrada' },
          HttpStatus.NOT_FOUND,
        );
      }
      return organization;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':cnpj')
  @ApiOperation({
    summary: 'Atualizar organização',
    description: `
      Permissões:
      - ADMIN: pode atualizar qualquer organização
      - ORGANIZATION_ADMIN: pode atualizar apenas a própria organização
      - USER: não pode atualizar organizações
    `,
  })
  @ApiParam({
    name: 'cnpj',
    description: 'CNPJ da organização',
    example: '12.345.678/0001-90',
  })
  @ApiResponse({
    status: 200,
    description: 'Organização atualizada com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Organização não encontrada' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async update(
    @Param('cnpj') cnpj: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    try {
      const organization = await this.findOrganizationByCnpjUseCase.execute(
        cnpj,
        currentUser.cpf,
      );
      if (!organization) {
        throw new HttpException(
          { error: 'Organização não encontrada' },
          HttpStatus.NOT_FOUND,
        );
      }

      const updatedOrganization = await this.updateOrganizationUseCase.execute(
        {
          ...organization,
          ...updateOrganizationDto,
          cnpj,
        },
        currentUser.cpf,
      );

      return updatedOrganization;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':cnpj')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deletar organização',
    description: `
      Permissões:
      - ADMIN: pode deletar qualquer organização
      - ORGANIZATION_ADMIN: não pode deletar organizações
      - USER: não pode deletar organizações
    `,
  })
  @ApiParam({
    name: 'cnpj',
    description: 'CNPJ da organização',
    example: '12.345.678/0001-90',
  })
  @ApiResponse({ status: 204, description: 'Organização deletada com sucesso' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async remove(
    @Param('cnpj') cnpj: string,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    try {
      await this.deleteOrganizationUseCase.execute(cnpj, currentUser.cpf);
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Listar organizações',
    description: `
      Permissões:
      - ADMIN: retorna todas as organizações
      - ORGANIZATION_ADMIN: retorna apenas a própria organização
      - USER: retorna apenas a própria organização
    `,
  })
  @ApiResponse({ status: 200, description: 'Lista de organizações' })
  async findAll(@CurrentUser() currentUser: CurrentUserType) {
    try {
      const organizations = await this.findAllOrganizationsUseCase.execute(
        currentUser.cpf,
      );
      return organizations;
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('name/:name')
  @ApiOperation({ summary: 'Buscar organização por nome' })
  @ApiParam({
    name: 'name',
    description: 'Nome da organização',
    example: 'Empresa XYZ',
  })
  @ApiResponse({ status: 200, description: 'Organização encontrada' })
  @ApiResponse({ status: 404, description: 'Organização não encontrada' })
  async findByName(@Param('name') name: string) {
    try {
      const organization =
        await this.findOrganizationByNameUseCase.execute(name);
      if (!organization) {
        throw new HttpException(
          { error: 'Organização não encontrada' },
          HttpStatus.NOT_FOUND,
        );
      }
      return organization;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':cnpj/users')
  @ApiOperation({ summary: 'Buscar organização com usuários' })
  @ApiParam({
    name: 'cnpj',
    description: 'CNPJ da organização',
    example: '12.345.678/0001-90',
  })
  @ApiResponse({ status: 200, description: 'Organização com usuários' })
  @ApiResponse({ status: 404, description: 'Organização não encontrada' })
  async findWithUsers(@Param('cnpj') cnpj: string) {
    try {
      const organization =
        await this.findOrganizationWithUsersUseCase.execute(cnpj);
      if (!organization) {
        throw new HttpException(
          { error: 'Organização não encontrada' },
          HttpStatus.NOT_FOUND,
        );
      }
      return organization;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':cnpj/services')
  @ApiOperation({ summary: 'Buscar organização com serviços' })
  @ApiParam({
    name: 'cnpj',
    description: 'CNPJ da organização',
    example: '12.345.678/0001-90',
  })
  @ApiResponse({ status: 200, description: 'Organização com serviços' })
  @ApiResponse({ status: 404, description: 'Organização não encontrada' })
  async findWithServices(@Param('cnpj') cnpj: string) {
    try {
      const organization =
        await this.findOrganizationWithServicesUseCase.execute(cnpj);
      if (!organization) {
        throw new HttpException(
          { error: 'Organização não encontrada' },
          HttpStatus.NOT_FOUND,
        );
      }
      return organization;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':cnpj/cards')
  @ApiOperation({ summary: 'Buscar organização com cards' })
  @ApiParam({
    name: 'cnpj',
    description: 'CNPJ da organização',
    example: '12.345.678/0001-90',
  })
  @ApiResponse({ status: 200, description: 'Organização com cards' })
  @ApiResponse({ status: 404, description: 'Organização não encontrada' })
  async findWithCards(@Param('cnpj') cnpj: string) {
    try {
      const organization =
        await this.findOrganizationWithCardsUseCase.execute(cnpj);
      if (!organization) {
        throw new HttpException(
          { error: 'Organização não encontrada' },
          HttpStatus.NOT_FOUND,
        );
      }
      return organization;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }
}
