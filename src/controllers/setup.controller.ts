import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SetupService } from '../services/setup.service';
import { CreateFirstOrganizationDto } from '../dto/create-first-organization.dto';
import { CreateFirstAdminDto } from '../dto/create-first-admin.dto';

@ApiTags('Setup')
@Controller('setup')
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @Post('first-organization')
  @ApiOperation({ summary: 'Criar primeira organização' })
  @ApiResponse({ 
    status: 200, 
    description: 'Primeira organização criada com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Primeira organização criada com sucesso' },
        organization: {
          type: 'object',
          properties: {
            cnpj: { type: 'string', example: '12.345.678/0001-90' },
            name: { type: 'string', example: 'Empresa XYZ Ltda' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async createFirstOrganization(@Body() createFirstOrganizationDto: CreateFirstOrganizationDto) {
    try {
      const organization = await this.setupService.createFirstOrganization(createFirstOrganizationDto);
      return {
        message: 'Primeira organização criada com sucesso',
        organization,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('first-admin')
  @ApiOperation({ summary: 'Criar primeiro administrador' })
  @ApiResponse({ 
    status: 200, 
    description: 'Primeiro administrador criado com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Primeiro administrador criado com sucesso' },
        admin: {
          type: 'object',
          properties: {
            cpf: { type: 'string', example: '123.456.789-01' },
            name: { type: 'string', example: 'João Silva' },
            password: { type: 'string', example: '123456' },
            role: { type: 'string', example: 'ADMIN' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async createFirstAdmin(@Body() createFirstAdminDto: CreateFirstAdminDto) {
    try {
      const admin = await this.setupService.createFirstAdmin(createFirstAdminDto);
      return {
        message: 'Primeiro administrador criado com sucesso',
        admin: {
          cpf: admin.cpf,
          name: admin.name,
          role: admin.role,
        },
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
} 