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
  UseGuards
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam
} from '@nestjs/swagger';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { CreateServiceUseCase } from '../use-cases/service/create-service.use-case';
import { UpdateServiceUseCase } from '../use-cases/service/update-service.use-case';
import { DeleteServiceUseCase } from '../use-cases/service/delete-service.use-case';
import { FindServiceByIdUseCase } from '../use-cases/service/find-service-by-id.use-case';
import { FindServicesByOrganizationUseCase } from '../use-cases/service/find-services-by-organization.use-case';
import { FindServicesByUserUseCase } from '../use-cases/service/find-services-by-user.use-case';
import { FindServiceByNameUseCase } from '../use-cases/service/find-service-by-name.use-case';
import { FindActiveServicesUseCase } from '../use-cases/service/find-active-services.use-case';
import { CreateServiceDto } from '../dto/create-service.dto';
import { UpdateServiceDto } from '../dto/update-service.dto';

@ApiTags('Serviços')
@Controller('services')
@UseGuards(SessionAuthGuard)
export class ServiceController {
  constructor(
    private readonly createServiceUseCase: CreateServiceUseCase,
    private readonly updateServiceUseCase: UpdateServiceUseCase,
    private readonly deleteServiceUseCase: DeleteServiceUseCase,
    private readonly findServiceByIdUseCase: FindServiceByIdUseCase,
    private readonly findServicesByOrganizationUseCase: FindServicesByOrganizationUseCase,
    private readonly findServicesByUserUseCase: FindServicesByUserUseCase,
    private readonly findServiceByNameUseCase: FindServiceByNameUseCase,
    private readonly findActiveServicesUseCase: FindActiveServicesUseCase
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo serviço' })
  @ApiResponse({ status: 201, description: 'Serviço criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(@Body() createServiceDto: CreateServiceDto) {
    try {
      const service = await this.createServiceUseCase.execute(createServiceDto);
      return service;
    } catch (error: any) {
      throw new HttpException(
        { error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Atualizar serviço',
    description: 'Atualiza um serviço existente. Pode incluir CPFs de usuários para associá-los ao serviço. Os usuários devem pertencer à mesma organização do serviço. Exemplo: {"name": "Atendimento Atualizado", "prefix": "AC", "userCpfs": ["123.456.789-01"]}'
  })
  @ApiParam({ name: 'id', description: 'ID do serviço', example: '1' })
  @ApiResponse({ status: 200, description: 'Serviço atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Serviço não encontrado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou usuários não pertencem à organização' })
  async update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    try {
      const service = await this.findServiceByIdUseCase.execute(parseInt(id));
      if (!service) {
        throw new HttpException(
          { error: 'Serviço não encontrado' },
          HttpStatus.NOT_FOUND
        );
      }

      const updatedService = await this.updateServiceUseCase.execute({
        ...updateServiceDto,
        id: parseInt(id)
      });

      return updatedService;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar serviço' })
  @ApiParam({ name: 'id', description: 'ID do serviço', example: '1' })
  @ApiResponse({ status: 204, description: 'Serviço deletado com sucesso' })
  async remove(@Param('id') id: string) {
    try {
      await this.deleteServiceUseCase.execute(parseInt(id));
    } catch (error: any) {
      throw new HttpException(
        { error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os serviços ativos' })
  @ApiResponse({ status: 200, description: 'Lista de serviços ativos' })
  async findAll() {
    try {
      const services = await this.findActiveServicesUseCase.execute();
      return services;
    } catch (error: any) {
      throw new HttpException(
        { error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('organization/:organizationCnpj')
  @ApiOperation({ summary: 'Buscar serviços por organização' })
  @ApiParam({ name: 'organizationCnpj', description: 'CNPJ da organização', example: '12.345.678/0001-90' })
  @ApiResponse({ status: 200, description: 'Lista de serviços da organização' })
  async findByOrganization(@Param('organizationCnpj') organizationCnpj: string) {
    try {
      const services = await this.findServicesByOrganizationUseCase.execute(organizationCnpj);
      return services;
    } catch (error: any) {
      throw new HttpException(
        { error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('user/:userCpf')
  @ApiOperation({ summary: 'Buscar serviços por usuário' })
  @ApiParam({ name: 'userCpf', description: 'CPF do usuário', example: '123.456.789-01' })
  @ApiResponse({ status: 200, description: 'Lista de serviços do usuário' })
  async findByUser(@Param('userCpf') userCpf: string) {
    try {
      const services = await this.findServicesByUserUseCase.execute(userCpf);
      return services;
    } catch (error: any) {
      throw new HttpException(
        { error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('name/:name')
  @ApiOperation({ summary: 'Buscar serviço por nome' })
  @ApiParam({ name: 'name', description: 'Nome do serviço', example: 'Atendimento ao Cliente' })
  @ApiResponse({ status: 200, description: 'Serviço encontrado' })
  @ApiResponse({ status: 404, description: 'Serviço não encontrado' })
  async findByName(@Param('name') name: string) {
    try {
      const service = await this.findServiceByNameUseCase.execute(name);
      if (!service) {
        throw new HttpException(
          { error: 'Serviço não encontrado' },
          HttpStatus.NOT_FOUND
        );
      }
      return service;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('active')
  @ApiOperation({ summary: 'Listar serviços ativos' })
  @ApiResponse({ status: 200, description: 'Lista de serviços ativos' })
  async findActive() {
    try {
      const services = await this.findActiveServicesUseCase.execute();
      return services;
    } catch (error: any) {
      throw new HttpException(
        { error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar serviço por ID' })
  @ApiParam({ name: 'id', description: 'ID do serviço', example: '1' })
  @ApiResponse({ status: 200, description: 'Serviço encontrado' })
  @ApiResponse({ status: 404, description: 'Serviço não encontrado' })
  async findOne(@Param('id') id: string) {
    try {
      const service = await this.findServiceByIdUseCase.execute(parseInt(id));
      if (!service) {
        throw new HttpException(
          { error: 'Serviço não encontrado' },
          HttpStatus.NOT_FOUND
        );
      }
      return service;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { error: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }
} 