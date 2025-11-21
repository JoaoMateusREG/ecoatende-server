import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface SessionData {
  sessionId: string;
  userId: string;
  cpf: string;
  organizationCnpj: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private sessions: Map<string, SessionData> = new Map();
  private readonly SESSION_DURATION_HOURS = 12; // 12 horas

  /**
   * Cria uma nova sessão para o usuário
   */
  async createSession(userData: {
    cpf: string;
    organizationCnpj: string;
  }): Promise<string> {
    const sessionId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.SESSION_DURATION_HOURS * 60 * 60 * 1000);

    const session: SessionData = {
      sessionId,
      userId: userData.cpf, // Usando CPF como userId
      cpf: userData.cpf,
      organizationCnpj: userData.organizationCnpj,
      createdAt: now,
      expiresAt,
      isActive: true,
    };

    this.sessions.set(sessionId, session);
    this.logger.log(`Sessão criada: ${sessionId} para usuário ${userData.cpf}`);

    // Agenda limpeza da sessão expirada
    setTimeout(() => {
      this.cleanupExpiredSession(sessionId);
    }, this.SESSION_DURATION_HOURS * 60 * 60 * 1000);

    return sessionId;
  }

  /**
   * Valida uma sessão e retorna os dados se válida
   */
  async validateSession(sessionId: string): Promise<SessionData | null> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    if (!session.isActive) {
      return null;
    }

    if (new Date() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  /**
   * Invalida uma sessão (logout)
   */
  async invalidateSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      this.sessions.delete(sessionId);
      return true;
    }
    return false;
  }

  /**
   * Invalida todas as sessões de um usuário
   */
  async invalidateUserSessions(cpf: string): Promise<number> {
    let invalidatedCount = 0;
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.cpf === cpf && session.isActive) {
        session.isActive = false;
        this.sessions.delete(sessionId);
        invalidatedCount++;
      }
    }

    return invalidatedCount;
  }

  /**
   * Renova uma sessão (estende o tempo de expiração)
   */
  async renewSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (session && session.isActive && new Date() <= session.expiresAt) {
      const now = new Date();
      session.expiresAt = new Date(now.getTime() + this.SESSION_DURATION_HOURS * 60 * 60 * 1000);
      
      // Agenda nova limpeza
      setTimeout(() => {
        this.cleanupExpiredSession(sessionId);
      }, this.SESSION_DURATION_HOURS * 60 * 60 * 1000);

      return true;
    }
    return false;
  }

  /**
   * Obtém estatísticas das sessões
   */
  getSessionStats() {
    const now = new Date();
    const activeSessions = Array.from(this.sessions.values()).filter(
      session => session.isActive && session.expiresAt > now
    );

    return {
      totalSessions: this.sessions.size,
      activeSessions: activeSessions.length,
      expiredSessions: Array.from(this.sessions.values()).filter(
        session => session.expiresAt <= now
      ).length,
    };
  }

  /**
   * Limpa sessões expiradas
   */
  private cleanupExpiredSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (session && new Date() > session.expiresAt) {
      this.sessions.delete(sessionId);
    }
  }

  /**
   * Limpa todas as sessões expiradas (para manutenção)
   */
  cleanupAllExpiredSessions() {
    const now = new Date();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (new Date() > session.expiresAt) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }
}
