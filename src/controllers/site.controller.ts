import { 
  Controller, 
  Post, 
  Body, 
  HttpStatus,
  HttpCode,
  HttpException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody
} from '@nestjs/swagger';
import { CreateOrganizationUseCase } from '../use-cases/organization/create-organization.use-case';
import { CreateUserUseCase } from '../use-cases/user/create-user.use-case';
import { CreatedOrganizationGatewayUseCase } from '../use-cases/organization/created-organization-gateway.use-case';
import { CreateUserDto } from '../dto/create-user.dto';
import { CreateOrganizationDto } from '../dto/create-organization.dto';

class OrganizationAndAdmDto {
  organization: CreateOrganizationDto;
  adm: CreateUserDto;
}

interface CreateOrganizationResponse {
  organization: {
    cnpj: string;
    name: string;
    customerId: string;
  };
  adm: {
    cpf: string;
    name: string;
  };
  message: string;
}

@ApiTags('Site Organization e ADM')
@Controller('site/organization/adm')
export class SiteOrganizationAdmController {
  constructor(
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly createdOrganizationGatewayUseCase: CreatedOrganizationGatewayUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar nova organização e ADM pelo site (com registro no Gateway)' })
  @ApiBody({ type: OrganizationAndAdmDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Organização e ADM criados com sucesso',
    type: Object 
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 500, description: 'Erro interno no servidor ou Gateway' })
  async create(
    @Body() organizationAndAdm: OrganizationAndAdmDto
  ): Promise<CreateOrganizationResponse> {
    try {
      // 1. Registrar organização no Gateway
      const gatewayResponse = await this.createdOrganizationGatewayUseCase.execute(
        organizationAndAdm.organization,
      );

      if (!gatewayResponse?.id) {
        throw new InternalServerErrorException('Gateway não retornou um customerId válido');
      }

      const customerId = gatewayResponse.id;

      // 2. Criar organização no banco de dados
      const organizationWithCustomerId = {
        ...organizationAndAdm.organization,
        customerId,
      };

      const organization = await this.createOrganizationUseCase.execute(
        organizationWithCustomerId,
      );

      if (!organization?.cnpj) {
        throw new InternalServerErrorException('Falha ao criar organização no banco de dados');
      }

      const adm = await this.createUserUseCase.execute(organizationAndAdm.adm);

      return {
        organization: {
          cnpj: organization.cnpj,
          name: organization.name,
          customerId: organization.customerId? organization.customerId : '',
        },
        adm: {
          cpf: adm.cpf,
          name: adm.name,
        },
        message: 'Organização e ADM criados com sucesso',
      };
      
    } catch (error: any) {
      console.error('Erro no fluxo de criação da organização e do ADM:', error.message);
      
      // Re-lançar exceções do NestJS sem modificar
      if (error instanceof HttpException) {
        throw error;
      }

      // Tratar erros de validação
      if (error.message?.includes('validation') || error.message?.includes('invalid')) {
        throw new BadRequestException({
          error: 'Dados inválidos',
          details: error.message,
        });
      }

      // Tratar todos os outros erros como erros internos do servidor
      throw new InternalServerErrorException({
        error: 'Erro ao criar organização e ADM',
        details: error.message,
      });
    }
  }
}