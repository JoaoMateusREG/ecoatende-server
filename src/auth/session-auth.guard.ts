import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SessionService } from './session.service';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionId = this.extractSessionId(request);

    if (!sessionId) {
      throw new UnauthorizedException('Sessão não encontrada');
    }

    const session = await this.sessionService.validateSession(sessionId);
    if (!session) {
      throw new UnauthorizedException('Sessão inválida ou expirada');
    }

    // Adiciona os dados da sessão à requisição
    request.session = session;
    request.user = {
      cpf: session.cpf,
      organizationCnpj: session.organizationCnpj,
      sessionId: session.sessionId,
    };

    // Renova a sessão automaticamente se ainda estiver ativa
    await this.sessionService.renewSession(sessionId);

    return true;
  }

  private extractSessionId(request: any): string | null {
    // Tenta extrair do header Authorization
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Session ')) {
      return authHeader.substring(8);
    }

    // Tenta extrair do cookie
    if (request.cookies?.session_id) {
      return request.cookies.session_id;
    }

    // Tenta extrair do query parameter (para WebSocket)
    if (request.query?.session_id) {
      return request.query.session_id;
    }

    return null;
  }
}
