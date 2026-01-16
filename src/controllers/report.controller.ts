import {
  Controller,
  Get,
  Query,
  Param,
  HttpStatus,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { CurrentSession } from '../decorators/current-session.decorator';
import { GetAverageWaitTimeUseCase } from '../use-cases/card/get-average-wait-time.use-case';
import { GetAverageServiceTimeUseCase } from '../use-cases/card/get-average-service-time.use-case';
import { GetCompletedCardsCountUseCase } from '../use-cases/card/get-completed-cards-count.use-case';
import { AverageWaitTimeReportDto } from '../dto/report.dto';
import { AverageServiceTimeReportDto } from '../dto/report.dto';
import { CompletedCardsReportDto } from '../dto/report.dto';
import type { SessionData } from '../auth/session.service';

@ApiTags('Relatórios')
@Controller('reports')
@UseGuards(SessionAuthGuard)
export class ReportController {
  constructor(
    private readonly getAverageWaitTimeUseCase: GetAverageWaitTimeUseCase,
    private readonly getAverageServiceTimeUseCase: GetAverageServiceTimeUseCase,
    private readonly getCompletedCardsCountUseCase: GetCompletedCardsCountUseCase,
  ) {}

  @Get('average-wait-time/organization/:organizationCnpj')
  @ApiOperation({ summary: 'Obter tempo médio de espera das fichas' })
  @ApiParam({
    name: 'organizationCnpj',
    description: 'CNPJ da organização',
    example: '60301979000160',
  })
  @ApiResponse({
    status: 200,
    description: 'Tempo médio de espera em minutos',
    schema: {
      type: 'object',
      properties: {
        averageWaitTimeMinutes: { type: 'number', example: 15 },
        organizationCnpj: { type: 'string', example: '60301979000160' },
        startDate: { type: 'string', example: '2025-01-01' },
        endDate: { type: 'string', example: '2025-01-31' },
        serviceId: { type: 'number', example: 1, nullable: true },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - organização não autorizada',
  })
  async getAverageWaitTime(
    @Param('organizationCnpj') organizationCnpj: string,
    @Query() query: AverageWaitTimeReportDto,
    @CurrentSession() session: SessionData,
  ) {
    try {
      // Valida se o usuário está acessando dados da sua própria organização
      if (organizationCnpj !== session.organizationCnpj) {
        throw new HttpException(
          {
            error:
              'Acesso negado - você só pode acessar dados da sua organização',
          },
          HttpStatus.FORBIDDEN,
        );
      }

      // Configura startDate para início do dia (00:00:00)
      const startDate = new Date(query.startDate + 'T00:00:00');

      // Configura endDate para fim do dia (23:59:59.999)
      const endDate = new Date(query.endDate + 'T23:59:59.999');

      const averageWaitTimeMinutes =
        await this.getAverageWaitTimeUseCase.execute(
          organizationCnpj,
          startDate,
          endDate,
          query.serviceId,
        );

      return {
        averageWaitTimeMinutes,
        organizationCnpj,
        startDate: query.startDate,
        endDate: query.endDate,
        serviceId: query.serviceId || null,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('average-service-time/organization/:organizationCnpj')
  @ApiOperation({ summary: 'Obter tempo médio de atendimento das fichas' })
  @ApiParam({
    name: 'organizationCnpj',
    description: 'CNPJ da organização',
    example: '60301979000160',
  })
  @ApiResponse({
    status: 200,
    description: 'Tempo médio de atendimento em minutos',
    schema: {
      type: 'object',
      properties: {
        averageServiceTimeMinutes: { type: 'number', example: 25 },
        organizationCnpj: { type: 'string', example: '60301979000160' },
        startDate: { type: 'string', example: '2025-01-01' },
        endDate: { type: 'string', example: '2025-01-31' },
        serviceId: { type: 'number', example: 1, nullable: true },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - organização não autorizada',
  })
  async getAverageServiceTime(
    @Param('organizationCnpj') organizationCnpj: string,
    @Query() query: AverageServiceTimeReportDto,
    @CurrentSession() session: SessionData,
  ) {
    try {
      // Valida se o usuário está acessando dados da sua própria organização
      if (organizationCnpj !== session.organizationCnpj) {
        throw new HttpException(
          {
            error:
              'Acesso negado - você só pode acessar dados da sua organização',
          },
          HttpStatus.FORBIDDEN,
        );
      }

      // Configura startDate para início do dia (00:00:00)
      const startDate = new Date(query.startDate + 'T00:00:00');

      // Configura endDate para fim do dia (23:59:59.999)
      const endDate = new Date(query.endDate + 'T23:59:59.999');

      const averageServiceTimeMinutes =
        await this.getAverageServiceTimeUseCase.execute(
          organizationCnpj,
          startDate,
          endDate,
          query.serviceId,
        );

      return {
        averageServiceTimeMinutes,
        organizationCnpj,
        startDate: query.startDate,
        endDate: query.endDate,
        serviceId: query.serviceId || null,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('completed-cards-count/organization/:organizationCnpj')
  @ApiOperation({ summary: 'Obter quantidade de fichas concluídas' })
  @ApiParam({
    name: 'organizationCnpj',
    description: 'CNPJ da organização',
    example: '60301979000160',
  })
  @ApiResponse({
    status: 200,
    description: 'Quantidade de fichas concluídas',
    schema: {
      type: 'object',
      properties: {
        completedCardsCount: { type: 'number', example: 150 },
        organizationCnpj: { type: 'string', example: '60301979000160' },
        startDate: { type: 'string', example: '2025-01-01' },
        endDate: { type: 'string', example: '2025-01-31' },
        serviceId: { type: 'number', example: 1, nullable: true },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - organização não autorizada',
  })
  async getCompletedCardsCount(
    @Param('organizationCnpj') organizationCnpj: string,
    @Query() query: CompletedCardsReportDto,
    @CurrentSession() session: SessionData,
  ) {
    try {
      // Valida se o usuário está acessando dados da sua própria organização
      if (organizationCnpj !== session.organizationCnpj) {
        throw new HttpException(
          {
            error:
              'Acesso negado - você só pode acessar dados da sua organização',
          },
          HttpStatus.FORBIDDEN,
        );
      }

      // Configura startDate para início do dia (00:00:00)
      const startDate = new Date(query.startDate + 'T00:00:00');

      // Configura endDate para fim do dia (23:59:59.999)
      const endDate = new Date(query.endDate + 'T23:59:59.999');

      const completedCardsCount =
        await this.getCompletedCardsCountUseCase.execute(
          organizationCnpj,
          startDate,
          endDate,
          query.serviceId,
        );

      return {
        completedCardsCount,
        organizationCnpj,
        startDate: query.startDate,
        endDate: query.endDate,
        serviceId: query.serviceId || null,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('summary/organization/:organizationCnpj')
  @ApiOperation({ summary: 'Obter resumo completo de relatórios' })
  @ApiParam({
    name: 'organizationCnpj',
    description: 'CNPJ da organização',
    example: '60301979000160',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumo completo dos relatórios',
    schema: {
      type: 'object',
      properties: {
        organizationCnpj: { type: 'string', example: '60301979000160' },
        startDate: { type: 'string', example: '2025-01-01' },
        endDate: { type: 'string', example: '2025-01-31' },
        serviceId: { type: 'number', example: 1, nullable: true },
        averageWaitTimeMinutes: { type: 'number', example: 15 },
        averageServiceTimeMinutes: { type: 'number', example: 25 },
        completedCardsCount: { type: 'number', example: 150 },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - organização não autorizada',
  })
  async getReportSummary(
    @Param('organizationCnpj') organizationCnpj: string,
    @Query() query: AverageWaitTimeReportDto,
    @CurrentSession() session: SessionData,
  ) {
    try {
      // Valida se o usuário está acessando dados da sua própria organização
      if (organizationCnpj !== session.organizationCnpj) {
        throw new HttpException(
          {
            error:
              'Acesso negado - você só pode acessar dados da sua organização',
          },
          HttpStatus.FORBIDDEN,
        );
      }

      // Configura startDate para início do dia (00:00:00)
      const startDate = new Date(query.startDate + 'T00:00:00');

      // Configura endDate para fim do dia (23:59:59.999)
      const endDate = new Date(query.endDate + 'T23:59:59.999');

      const [
        averageWaitTimeMinutes,
        averageServiceTimeMinutes,
        completedCardsCount,
      ] = await Promise.all([
        this.getAverageWaitTimeUseCase.execute(
          organizationCnpj,
          startDate,
          endDate,
          query.serviceId,
        ),
        this.getAverageServiceTimeUseCase.execute(
          organizationCnpj,
          startDate,
          endDate,
          query.serviceId,
        ),
        this.getCompletedCardsCountUseCase.execute(
          organizationCnpj,
          startDate,
          endDate,
          query.serviceId,
        ),
      ]);

      return {
        organizationCnpj,
        startDate: query.startDate,
        endDate: query.endDate,
        serviceId: query.serviceId || null,
        averageWaitTimeMinutes,
        averageServiceTimeMinutes,
        completedCardsCount,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }
}
