import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { CurrentSession } from '../decorators/current-session.decorator';
import { CreateCardUseCase } from '../use-cases/card/create-card.use-case';
import { UpdateCardUseCase } from '../use-cases/card/update-card.use-case';
import { DeleteCardUseCase } from '../use-cases/card/delete-card.use-case';
import { FindCardByIdUseCase } from '../use-cases/card/find-card-by-id.use-case';
import { FindCardsByServiceUseCase } from '../use-cases/card/find-cards-by-service.use-case';
import { CountCardsByOrganizationUseCase } from '../use-cases/card/count-cards-by-organization.use-case';
import { CountConcludedTodayCardsByOrganizationUseCase } from '../use-cases/card/count-concluded-today-cards-by-organization.use-case';
import { CountInAttendanceCardsByOrganizationUseCase } from '../use-cases/card/count-in-attendance-cards-by-organization.use-case';
import { GetCardsSummaryByOrganizationUseCase } from '../use-cases/card/get-cards-summary-by-organization.use-case';
import { FindPendingCardsUseCase } from '../use-cases/card/find-pending-cards.use-case';
import { FindTodayCalledCardsUseCase } from '../use-cases/card/find-today-called-cards.use-case';
import { FindCardByNumberAndDateUseCase } from '../use-cases/card/find-card-by-number-and-date.use-case';
import { FindTodayConcludedCardsUseCase } from '../use-cases/card/find-concluded-cards.use-case';
import { FindTodayCreatedByOrganizationAndServiceUseCase } from '../use-cases/card/find-today-created-by-organization-and-service.use-case';
import { CountCardsByServiceAndDateUseCase } from '../use-cases/card/count-cards-by-service-and-date.use-case';
import { FindInAttendanceCardsUseCase } from '../use-cases/card/find-in-attendance-cards.use-case';
import { ForwardCardUseCase } from '../use-cases/card/forward-card.use-case';
import { CreateCardDto } from '../dto/create-card.dto';
import { UpdateCardDto } from '../dto/update-card.dto';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import type { SessionData } from '../auth/session.service';
import { nowBrasilia } from '../utils/date.utils';

@ApiTags('Cards/Fichas')
@Controller('cards')
export class CardController {
  constructor(
    private readonly createCardUseCase: CreateCardUseCase,
    private readonly updateCardUseCase: UpdateCardUseCase,
    private readonly deleteCardUseCase: DeleteCardUseCase,
    private readonly findCardByIdUseCase: FindCardByIdUseCase,
    private readonly findCardsByServiceUseCase: FindCardsByServiceUseCase,
    private readonly findPendingCardsUseCase: FindPendingCardsUseCase,
    private readonly countCardsByOrganizationUseCase: CountCardsByOrganizationUseCase,
    private readonly countConcludedTodayCardsByOrganizationUseCase: CountConcludedTodayCardsByOrganizationUseCase,
    private readonly countInAttendanceCardsByOrganizationUseCase: CountInAttendanceCardsByOrganizationUseCase,
    private readonly getCardsSummaryByOrganizationUseCase: GetCardsSummaryByOrganizationUseCase,
    private readonly findTodayCreatedByOrganizationAndServiceUseCase: FindTodayCreatedByOrganizationAndServiceUseCase,
    private readonly findTodayCalledCardsUseCase: FindTodayCalledCardsUseCase,
    private readonly findCardByNumberAndDateUseCase: FindCardByNumberAndDateUseCase,
    private readonly findTodayConcludedCardsUseCase: FindTodayConcludedCardsUseCase,
    private readonly countCardsByServiceAndDateUseCase: CountCardsByServiceAndDateUseCase,
    private readonly findInAttendanceCardsUseCase: FindInAttendanceCardsUseCase,
    private readonly forwardCardUseCase: ForwardCardUseCase,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo card' })
  @ApiResponse({ status: 201, description: 'Card criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(@Body() createCardDto: CreateCardDto) {
    try {
      const card = await this.createCardUseCase.execute(createCardDto);

      // Envia mensagem WebSocket para notificar sobre o novo card
      this.websocketGateway.sendToOrganization(card.organizationCnpj, {
        tipo: 'card_update',
        organizationCnpj: card.organizationCnpj,
        dados: {
          id: card.id,
          card: card.card,
          priority: card.priority,
          status: 'pending',
          datehour: card.datehour.toISOString(),
          serviceId: card.serviceId,
          serviceName: card.service?.name,
          eventType: 'new_card_created',
        },
      });

      return card;
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id')
  @UseGuards(SessionAuthGuard)
  @ApiOperation({ summary: 'Atualizar card' })
  @ApiParam({ name: 'id', description: 'ID do card', example: '1' })
  @ApiResponse({ status: 200, description: 'Card atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Card não encontrado' })
  async update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto) {
    try {
      const card = await this.findCardByIdUseCase.execute(parseInt(id));
      if (!card) {
        throw new HttpException(
          { error: 'Ficha não encontrada' },
          HttpStatus.NOT_FOUND,
        );
      }

      const updatedCard = await this.updateCardUseCase.execute({
        ...updateCardDto,
        id: parseInt(id),
      });

      // Determina o status baseado no card atualizado
      let status = 'pending';
      if (updatedCard.concluded) {
        status = 'concluded';
      } else if (updatedCard.datehourAttend && !updatedCard.concluded) {
        status = 'in_attendance';
      }

      // Envia mensagem WebSocket para notificar sobre a atualização do card
      this.websocketGateway.sendToOrganization(updatedCard.organizationCnpj, {
        tipo: 'card_update',
        organizationCnpj: updatedCard.organizationCnpj,
        dados: {
          id: updatedCard.id,
          card: updatedCard.card,
          priority: updatedCard.priority,
          status: status,
          datehour: updatedCard.datehour.toISOString(),
          serviceId: updatedCard.serviceId,
          serviceName: updatedCard.service?.name,
          eventType: 'card_updated',
        },
      });

      return updatedCard;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @UseGuards(SessionAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar card' })
  @ApiParam({ name: 'id', description: 'ID do card', example: '1' })
  @ApiResponse({ status: 204, description: 'Card deletado com sucesso' })
  async remove(@Param('id') id: string) {
    try {
      await this.deleteCardUseCase.execute(parseInt(id));
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @UseGuards(SessionAuthGuard)
  @ApiOperation({ summary: 'Listar cards com filtros' })
  @ApiQuery({
    name: 'serviceId',
    description: 'ID do serviço',
    required: false,
    example: '1',
  })
  @ApiQuery({
    name: 'organizationCnpj',
    description: 'CNPJ da organização',
    required: false,
    example: '12345678000100',
  })
  @ApiQuery({
    name: 'pending',
    description: 'Filtrar por pendentes',
    required: false,
    example: 'true',
  })
  @ApiQuery({
    name: 'todayCalled',
    description: 'Filtrar por chamados hoje',
    required: false,
    example: 'true',
  })
  @ApiQuery({
    name: 'concluded',
    description: 'Filtrar por concluídos',
    required: false,
    example: 'true',
  })
  @ApiQuery({
    name: 'inAttendance',
    description: 'Filtrar por em atendimento',
    required: false,
    example: 'true',
  })
  @ApiResponse({ status: 200, description: 'Lista de cards filtrados' })
  async findAll(@Query() query: any) {
    try {
      if (query.serviceId) {
        return await this.findCardsByServiceUseCase.execute(
          parseInt(query.serviceId),
        );
      }
      if (query.pending) {
        return await this.findPendingCardsUseCase.execute([
          parseInt(query.serviceId),
        ]);
      }
      if (query.todayCalled) {
        return await this.findTodayCalledCardsUseCase.execute(
          query.organizationCnpj,
        );
      }
      if (query.concluded) {
        return await this.findTodayConcludedCardsUseCase.execute(
          query.organizationCnpj,
        );
      }
      if (query.inAttendance) {
        return await this.findInAttendanceCardsUseCase.execute();
      }

      // Retorna todas as fichas se nenhum filtro for especificado
      return await this.countCardsByOrganizationUseCase.execute(
        query.organizationCnpj,
      );
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('service/:serviceId')
  @UseGuards(SessionAuthGuard)
  @ApiOperation({ summary: 'Buscar cards por serviço' })
  @ApiParam({ name: 'serviceId', description: 'ID do serviço', example: '1' })
  @ApiResponse({ status: 200, description: 'Lista de cards do serviço' })
  async findByService(@Param('serviceId') serviceId: string) {
    try {
      const cards = await this.findCardsByServiceUseCase.execute(
        parseInt(serviceId),
      );
      return cards;
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('today-created/organization/:organizationCnpj/service/:serviceId')
  @UseGuards(SessionAuthGuard)
  @ApiOperation({
    summary: 'Buscar cards criados hoje por organização e serviço',
  })
  @ApiParam({
    name: 'organizationCnpj',
    description: 'CNPJ da organização',
    example: '12345678000100',
  })
  @ApiParam({ name: 'serviceId', description: 'ID do serviço', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cards criados hoje por organização e serviço',
  })
  async findTodayCreatedByOrganizationAndService(
    @Param('organizationCnpj') organizationCnpj: string,
    @Param('serviceId') serviceId: string,
  ) {
    try {
      const cards =
        await this.findTodayCreatedByOrganizationAndServiceUseCase.execute(
          organizationCnpj,
          parseInt(serviceId),
        );
      return cards;
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('summary/organization/:organizationCnpj')
  @UseGuards(SessionAuthGuard)
  @ApiOperation({
    summary:
      'Obter resumo de cards por organização (pendentes, em atendimento e concluídos hoje)',
  })
  @ApiParam({
    name: 'organizationCnpj',
    description: 'CNPJ da organização',
    example: '12345678000100',
  })
  @ApiResponse({ status: 200, description: 'Resumo de cards da organização' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - organização não autorizada',
  })
  async getCardsSummaryByOrganization(
    @Param('organizationCnpj') organizationCnpj: string,
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

      const summary =
        await this.getCardsSummaryByOrganizationUseCase.execute(
          organizationCnpj,
        );
      return summary;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('pending/organization/:organizationCnpj')
  @UseGuards(SessionAuthGuard)
  @ApiOperation({ summary: 'Contar cards pendentes por organização' })
  @ApiParam({
    name: 'organizationCnpj',
    description: 'CNPJ da organização',
    example: '12345678000100',
  })
  @ApiResponse({
    status: 200,
    description: 'Contagem de cards pendentes da organização',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - organização não autorizada',
  })
  async countPendingByOrganization(
    @Param('organizationCnpj') organizationCnpj: string,
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

      const count =
        await this.countCardsByOrganizationUseCase.execute(organizationCnpj);
      return { count };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('pending/:serviceId')
  @UseGuards(SessionAuthGuard)
  @ApiOperation({ summary: 'Listar cards pendentes por serviço' })
  @ApiParam({ name: 'serviceId', description: 'ID do serviço', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cards pendentes do serviço',
  })
  async findPendingByService(@Param('serviceId') serviceId: string) {
    try {
      const cards = await this.findPendingCardsUseCase.execute([
        parseInt(serviceId),
      ]);
      return cards;
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('today-called/organization/:organizationCnpj')
  @UseGuards(SessionAuthGuard)
  @ApiOperation({ summary: 'Contar cards chamados hoje por organização' })
  @ApiParam({
    name: 'organizationCnpj',
    description: 'CNPJ da organização',
    example: '12345678000100',
  })
  @ApiResponse({
    status: 200,
    description: 'Contagem de cards chamados hoje da organização',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - organização não autorizada',
  })
  async findTodayCalledByOrganization(
    @Param('organizationCnpj') organizationCnpj: string,
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

      return await this.findTodayCalledCardsUseCase.execute(organizationCnpj);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('today-concluded/:organizationCnpj')
  @UseGuards(SessionAuthGuard)
  @ApiOperation({ summary: 'Listar cards concluídos hoje por organização' })
  @ApiParam({
    name: 'organizationCnpj',
    description: 'CNPJ da organização',
    example: '12345678000100',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de cards concluídos hoje da organização',
  })
  async findTodayConcluded(
    @Param('organizationCnpj') organizationCnpj: string,
  ) {
    try {
      return await this.findTodayConcludedCardsUseCase.execute(
        organizationCnpj,
      );
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('concluded/organization/:organizationCnpj')
  @UseGuards(SessionAuthGuard)
  @ApiOperation({ summary: 'Contar cards concluídos hoje por organização' })
  @ApiParam({
    name: 'organizationCnpj',
    description: 'CNPJ da organização',
    example: '12345678000100',
  })
  @ApiResponse({
    status: 200,
    description: 'Contagem de cards concluídos hoje da organização',
  })
  async countConcludedTodayByOrganization(
    @Param('organizationCnpj') organizationCnpj: string,
  ) {
    try {
      const count =
        await this.countConcludedTodayCardsByOrganizationUseCase.execute(
          organizationCnpj,
        );
      return { count };
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('in-attendance')
  @UseGuards(SessionAuthGuard)
  @ApiOperation({ summary: 'Listar cards em atendimento' })
  @ApiResponse({ status: 200, description: 'Lista de cards em atendimento' })
  async findInAttendance(@CurrentSession() session: SessionData) {
    try {
      const cards = await this.findInAttendanceCardsUseCase.execute(undefined, session.cpf);
      return cards;
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('in-attendance/organization/:organizationCnpj')
  @UseGuards(SessionAuthGuard)
  @ApiOperation({ summary: 'Contar cards em atendimento por organização' })
  @ApiParam({
    name: 'organizationCnpj',
    description: 'CNPJ da organização',
    example: '12345678000100',
  })
  @ApiResponse({
    status: 200,
    description: 'Contagem de cards em atendimento da organização',
  })
  async countInAttendanceByOrganization(
    @Param('organizationCnpj') organizationCnpj: string,
  ) {
    try {
      const count =
        await this.countInAttendanceCardsByOrganizationUseCase.execute(
          organizationCnpj,
        );
      return { count };
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('in-attendance/:serviceId')
  @UseGuards(SessionAuthGuard)
  @ApiOperation({ summary: 'Listar cards em atendimento por serviço' })
  @ApiParam({ name: 'serviceId', description: 'ID do serviço', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cards em atendimento do serviço',
  })
  async findInAttendanceByService(
    @Param('serviceId') serviceId: string,
    @CurrentSession() session: SessionData,
  ) {
    try {
      const cards = await this.findInAttendanceCardsUseCase.execute(
        [parseInt(serviceId)],
        session.cpf,
      );
      return cards;
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('count/:serviceId/:date')
  @UseGuards(SessionAuthGuard)
  @ApiOperation({ summary: 'Contar cards por serviço e data' })
  @ApiParam({ name: 'serviceId', description: 'ID do serviço', example: '1' })
  @ApiParam({
    name: 'date',
    description: 'Data (YYYY-MM-DD)',
    example: '2024-01-15',
  })
  @ApiResponse({ status: 200, description: 'Contagem de cards' })
  async countByServiceAndDate(
    @Param('serviceId') serviceId: string,
    @Param('date') date: string,
  ) {
    try {
      // Converte a data corretamente (YYYY-MM-DD para Date)
      const [year, month, day] = date.split('-').map(Number);
      const targetDate = new Date(year, month - 1, day); // month - 1 porque Date usa 0-11

      const count = await this.countCardsByServiceAndDateUseCase.execute(
        parseInt(serviceId),
        targetDate,
      );
      return { count };
    } catch (error: any) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('number/:cardNumber/date/:date')
  @UseGuards(SessionAuthGuard)
  @ApiOperation({ summary: 'Buscar card por número e data' })
  @ApiParam({
    name: 'cardNumber',
    description: 'Número do card',
    example: 'A001',
  })
  @ApiParam({
    name: 'date',
    description: 'Data (YYYY-MM-DD)',
    example: '2024-01-15',
  })
  @ApiResponse({ status: 200, description: 'Card encontrado' })
  @ApiResponse({ status: 404, description: 'Card não encontrado' })
  async findByNumberAndDate(
    @Param('cardNumber') cardNumber: string,
    @Param('date') date: string,
  ) {
    try {
      // Converte a data corretamente (YYYY-MM-DD para Date)
      const [year, month, day] = date.split('-').map(Number);
      const targetDate = new Date(year, month - 1, day); // month - 1 porque Date usa 0-11

      const card = await this.findCardByNumberAndDateUseCase.execute(
        cardNumber,
        targetDate,
      );
      if (!card) {
        throw new HttpException(
          { error: 'Ficha não encontrada' },
          HttpStatus.NOT_FOUND,
        );
      }
      return card;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id/start-attendance')
  @UseGuards(SessionAuthGuard)
  @ApiOperation({ summary: 'Iniciar atendimento de um card' })
  @ApiParam({ name: 'id', description: 'ID do card', example: '1' })
  @ApiResponse({ status: 200, description: 'Atendimento iniciado com sucesso' })
  @ApiResponse({ status: 404, description: 'Card não encontrado' })
  async startAttendance(
    @Param('id') id: string,
    @CurrentSession() session: SessionData,
  ) {
    try {
      const card = await this.findCardByIdUseCase.execute(parseInt(id));
      if (!card) {
        throw new HttpException(
          { error: 'Ficha não encontrada' },
          HttpStatus.NOT_FOUND,
        );
      }

      // Atualiza o status para IN_ATTENDANCE salvando o CPF do atendente
      const updatedCard = await this.updateCardUseCase.execute({
        id: parseInt(id),
        status: 'IN_ATTENDANCE' as any,
        datehourAttend: nowBrasilia().toISOString(),
        userCpf: session.cpf,
      });

      // Envia mensagem WebSocket para notificar sobre o início do atendimento
      this.websocketGateway.sendToOrganization(updatedCard.organizationCnpj, {
        tipo: 'card_update',
        organizationCnpj: updatedCard.organizationCnpj,
        dados: {
          id: updatedCard.id,
          card: updatedCard.card,
          priority: updatedCard.priority,
          status: 'in_attendance',
          datehour: updatedCard.datehour.toISOString(),
          serviceId: updatedCard.serviceId,
          serviceName: updatedCard.service?.name,
          userCpf: updatedCard.userCpf,
          eventType: 'card_called',
        },
      });

      return updatedCard;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id/complete')
  @UseGuards(SessionAuthGuard)
  @ApiOperation({ summary: 'Concluir um card' })
  @ApiParam({ name: 'id', description: 'ID do card', example: '1' })
  @ApiResponse({ status: 200, description: 'Card concluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Card não encontrado' })
  async completeCard(@Param('id') id: string) {
    try {
      const card = await this.findCardByIdUseCase.execute(parseInt(id));
      if (!card) {
        throw new HttpException(
          { error: 'Ficha não encontrada' },
          HttpStatus.NOT_FOUND,
        );
      }

      // Atualiza o status para FINISHED e marca como concluído
      const updatedCard = await this.updateCardUseCase.execute({
        id: parseInt(id),
        status: 'FINISHED' as any,
        concluded: true,
        datehourConcluded: nowBrasilia().toISOString(),
      });

      // Envia mensagem WebSocket para notificar sobre a conclusão do card
      this.websocketGateway.sendToOrganization(updatedCard.organizationCnpj, {
        tipo: 'card_update',
        organizationCnpj: updatedCard.organizationCnpj,
        dados: {
          id: updatedCard.id,
          status: 'finished',
          datehour: updatedCard.datehourConcluded?.toISOString(),
          eventType: 'card_concluded',
        },
      });

      return updatedCard;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id/forward/:serviceId')
  @UseGuards(SessionAuthGuard)
  @ApiOperation({ summary: 'Encaminhar ficha para outro serviço' })
  @ApiParam({ name: 'id', description: 'ID da ficha', example: '1' })
  @ApiParam({ name: 'serviceId', description: 'ID do serviço de destino', example: '2' })
  @ApiResponse({ status: 200, description: 'Ficha encaminhada com sucesso' })
  @ApiResponse({ status: 404, description: 'Ficha ou serviço não encontrado' })
  async forwardCard(
    @Param('id') id: string,
    @Param('serviceId') serviceId: string,
  ) {
    try {
      const updatedCard = await this.forwardCardUseCase.execute(
        parseInt(id),
        parseInt(serviceId),
      );

      this.websocketGateway.sendToOrganization(updatedCard.organizationCnpj, {
        tipo: 'card_update',
        organizationCnpj: updatedCard.organizationCnpj,
        dados: {
          id: updatedCard.id,
          card: updatedCard.card,
          priority: updatedCard.priority,
          status: 'pending',
          serviceId: updatedCard.serviceId,
          serviceName: updatedCard.service?.name,
          eventType: 'card_forwarded',
        },
      });

      return updatedCard;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  @UseGuards(SessionAuthGuard)
  @ApiOperation({ summary: 'Buscar card por ID' })
  @ApiParam({ name: 'id', description: 'ID do card', example: '1' })
  @ApiResponse({ status: 200, description: 'Card encontrado' })
  @ApiResponse({ status: 404, description: 'Card não encontrado' })
  async findOne(@Param('id') id: string) {
    try {
      const card = await this.findCardByIdUseCase.execute(parseInt(id));
      if (!card) {
        throw new HttpException(
          { error: 'Ficha não encontrada' },
          HttpStatus.NOT_FOUND,
        );
      }
      return card;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }
}
