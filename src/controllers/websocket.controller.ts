import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@ApiTags('WebSocket')
@Controller('websocket')
export class WebsocketController {
  constructor(private readonly websocketGateway: WebsocketGateway) {}

  @Get('status')
  @ApiOperation({
    summary: 'Verificar status do WebSocket',
    description: 'Retorna o status básico do servidor WebSocket',
  })
  @ApiResponse({
    status: 200,
    description: 'Status do WebSocket',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'running',
          description: 'Status do servidor WebSocket',
        },
        timestamp: {
          type: 'string',
          example: '2024-01-01T00:00:00.000Z',
          description: 'Timestamp da verificação',
        },
      },
    },
  })
  async getStatus() {
    return {
      status: 'running',
      timestamp: new Date().toISOString(),
      message: 'WebSocket Gateway está funcionando',
    };
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Obter estatísticas das conexões WebSocket',
    description:
      'Retorna informações detalhadas sobre conexões ativas e organizações conectadas',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas das conexões',
    schema: {
      type: 'object',
      properties: {
        totalConnections: {
          type: 'number',
          example: 10,
          description: 'Total de conexões registradas',
        },
        activeConnections: {
          type: 'number',
          example: 8,
          description: 'Conexões ativas',
        },
        organizations: {
          type: 'array',
          items: { type: 'string' },
          example: ['12.345.678/0001-90', '98.765.432/0001-10'],
          description: 'Lista de CNPJs das organizações conectadas',
        },
        connectionsByOrg: {
          type: 'object',
          example: {
            '12.345.678/0001-90': 5,
            '98.765.432/0001-10': 3,
          },
          description: 'Distribuição de conexões por organização',
        },
      },
    },
  })
  async getStats() {
    const stats = this.websocketGateway.getConnectionStats();

    return {
      ...stats,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
  }
}
