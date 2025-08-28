import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { SessionService, SessionData } from '../auth/session.service';

interface SocketConnection {
  socket: Socket;
  organizationCnpj?: string;
  connectionId: string;
  connectedAt: Date;
  sessionId?: string;
  cpf?: string;
}

interface WebSocketMessage {
  tipo: string;
  organizationCnpj: string;
  dados?: any;
}

@WebSocketGateway({
  namespace: '/ecoatende/websocket',
  cors: {
    origin: ['http://localhost:3418'],
    credentials: true,
  },
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);
  private conexoes: SocketConnection[] = [];

  constructor(private sessionService: SessionService) {}

  afterInit(server: Server) {
    this.logger.log('🚀 WebSocket Gateway inicializado');
    this.logger.log(`📡 Servidor WebSocket rodando em: /ecoatende/websocket`);
    this.logger.log(`🔧 Configuração: Socket.IO com CORS habilitado`);
  }

  async handleConnection(client: Socket) {
    const connectionId = this.generateConnectionId();
    const sessionId = this.extractSessionId(client);
    
    // Valida a sessão se fornecida
    let session: SessionData | null = null;
    if (sessionId) {
      try {
        session = await this.sessionService.validateSession(sessionId);
        if (session) {
          // Renova a sessão automaticamente
          await this.sessionService.renewSession(sessionId);
        }
      } catch (error) {
        this.logger.warn(`Sessão inválida para conexão ${connectionId}: ${sessionId}`);
      }
    }

    const conexao: SocketConnection = {
      socket: client,
      connectionId,
      connectedAt: new Date(),
      sessionId: session?.sessionId,
      cpf: session?.cpf,
      organizationCnpj: session?.organizationCnpj
    };
    
    this.conexoes.push(conexao);

    this.logger.log(`🔗 Nova conexão estabelecida: ${connectionId}${session ? ` (usuário: ${session.cpf})` : ' (não autenticado)'}`);
    this.logStatus();

    // Adiciona o connectionId ao socket para referência
    client.data.connectionId = connectionId;
    client.data.sessionId = sessionId;
  }

  private extractSessionId(client: Socket): string | null {
    // Tenta extrair do query parameter
    const sessionId = client.handshake.query.session_id as string;
    if (sessionId) {
      return sessionId;
    }

    // Tenta extrair do header (se disponível)
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Session ')) {
      return authHeader.substring(8);
    }

    return null;
  }

  handleDisconnect(client: Socket) {
    const conexao = this.conexoes.find(c => c.socket === client);
    if (conexao) {
      const duration = Date.now() - conexao.connectedAt.getTime();
      const durationMinutes = Math.round(duration / 60000);
      
      this.logger.log(`🔌 Conexão desconectada: ${conexao.connectionId} (${conexao.organizationCnpj || 'sem organização'}) - Duração: ${durationMinutes}min`);
    }
    
    const index = this.conexoes.findIndex(c => c.socket === client);
    if (index !== -1) {
      this.conexoes.splice(index, 1);
      this.logStatus();
    }
  }

  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const conexao = this.conexoes.find(c => c.socket === client);
    this.logger.log(`📨 Ping recebido de ${conexao?.connectionId || 'desconhecida'}: ${JSON.stringify(data)}`);
    return { event: 'pong', data: { message: 'pong', timestamp: Date.now() } };
  }

  @SubscribeMessage('auth')
  async handleAuth(@MessageBody() data: WebSocketMessage, @ConnectedSocket() client: Socket) {
    const conexao = this.conexoes.find(c => c.socket === client);
    if (conexao) {
      // Se já tem sessão válida, usa os dados da sessão
      if (conexao.sessionId && conexao.cpf) {
        const session = await this.sessionService.validateSession(conexao.sessionId);
        if (session) {
          conexao.organizationCnpj = session.organizationCnpj;
          this.logger.log(`🔐 Autenticação via sessão: ${conexao.connectionId} -> ${session.organizationCnpj}`);
          client.join(session.organizationCnpj);
          return { event: 'auth_success', data: { message: 'Autenticado via sessão', organizationCnpj: session.organizationCnpj } };
        }
      }

      // Fallback para autenticação manual (se não tem sessão)
      const oldOrg = conexao.organizationCnpj;
      conexao.organizationCnpj = data.organizationCnpj;
      
      if (oldOrg !== data.organizationCnpj) {
        this.logger.log(`🔐 Autenticação manual: ${conexao.connectionId} -> ${data.organizationCnpj}`);
        client.join(data.organizationCnpj);
      }
    }
    
    return { event: 'auth_success', data: { message: 'Autenticado com sucesso' } };
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: WebSocketMessage, @ConnectedSocket() client: Socket) {
    const conexao = this.conexoes.find(c => c.socket === client);
    this.logger.log(`📨 Mensagem recebida de ${conexao?.connectionId || 'desconhecida'}: ${data.tipo}`);
    
    // Envia mensagem para todas as conexões da mesma organização
    if (conexao?.organizationCnpj) {
      this.server.to(conexao.organizationCnpj).emit('message', data);
      this.logger.debug(`📤 Mensagem ${data.tipo} enviada para organização ${conexao.organizationCnpj}`);
    }
    
    return { event: 'message_received', data: { received: data, timestamp: Date.now() } };
  }

  // Método público para enviar mensagens para uma organização específica
  sendToOrganization(organizationCnpj: string, message: any) {
    this.server.to(organizationCnpj).emit('message', message);
    this.logger.log(`📤 Mensagem enviada para organização ${organizationCnpj}`);
  }

  // Método para obter estatísticas das conexões
  getConnectionStats() {
    const stats = {
      totalConnections: this.conexoes.length,
      activeConnections: this.conexoes.filter(c => c.socket.connected).length,
      organizations: [...new Set(this.conexoes.map(c => c.organizationCnpj).filter(Boolean))],
      connectionsByOrg: {} as Record<string, number>
    };

    // Conta conexões por organização
    this.conexoes.forEach(c => {
      if (c.organizationCnpj) {
        stats.connectionsByOrg[c.organizationCnpj] = (stats.connectionsByOrg[c.organizationCnpj] || 0) + 1;
      }
    });

    return stats;
  }

  // Método privado para gerar ID único de conexão
  private generateConnectionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Método privado para log de status
  private logStatus() {
    const stats = this.getConnectionStats();
    const orgDetails = Object.entries(stats.connectionsByOrg)
      .map(([org, count]) => `${org}: ${count}`)
      .join(', ');
    
    this.logger.log(`📊 Status: ${stats.totalConnections} total, ${stats.activeConnections} ativas, ${stats.organizations.length} organizações [${orgDetails}]`);
  }
} 