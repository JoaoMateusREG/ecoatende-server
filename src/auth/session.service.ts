import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { createClient, type RedisClientType } from 'redis';

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
export class SessionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SessionService.name);
  private readonly redis: RedisClientType;
  private readonly redisPrefix =
    process.env.REDIS_KEY_PREFIX?.trim() || 'ecoatende:';
  private readonly sessionTtlSeconds = Math.max(
    60,
    Number(process.env.REDIS_SESSION_TTL_SECONDS ?? 12 * 60 * 60),
  );
  private readonly redisUrl =
    process.env.REDIS_URL?.trim() || 'redis://127.0.0.1:6379';
  private readonly redisConnectTimeoutMs = Math.max(
    1000,
    Number(process.env.REDIS_CONNECT_TIMEOUT_MS ?? 10_000),
  );

  constructor() {
    this.redis = createClient({
      url: this.redisUrl,
      socket: {
        connectTimeout: this.redisConnectTimeoutMs,
        reconnectStrategy: (retries) => {
          const delay = Math.min(retries * 100, 5_000);
          return delay;
        },
      },
    });

    this.redis.on('error', (error) => {
      this.logger.error(`Erro de conexão Redis: ${error.message}`);
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.redis.connect();
      await this.redis.ping();
      this.logger.log(
        `Sessões usando Redis em ${this.redisUrl} (ttl=${this.sessionTtlSeconds}s)`,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'erro desconhecido';
      this.logger.error(`Falha ao iniciar conexão Redis: ${message}`);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis.isOpen) {
      await this.redis.quit();
    }
  }

  private getSessionKey(sessionId: string): string {
    return `${this.redisPrefix}session:${sessionId}`;
  }

  private getUserSessionsKey(cpf: string): string {
    return `${this.redisPrefix}user-sessions:${cpf}`;
  }

  getSessionCookieMaxAgeMs(): number {
    return this.sessionTtlSeconds * 1000;
  }

  private parseSession(rawSession: string): SessionData | null {
    try {
      const parsed = JSON.parse(rawSession) as SessionData;
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        expiresAt: new Date(parsed.expiresAt),
      };
    } catch {
      return null;
    }
  }

  private async listSessionKeys(): Promise<string[]> {
    const pattern = `${this.redisPrefix}session:*`;
    const keys: string[] = [];
    let cursor = '0';

    do {
      const result = await this.redis.scan(cursor, {
        MATCH: pattern,
        COUNT: 200,
      });
      cursor = result.cursor;
      keys.push(...result.keys);
    } while (cursor !== '0');

    return keys;
  }

  /**
   * Cria uma nova sessão para o usuário
   */
  async createSession(userData: {
    cpf: string;
    organizationCnpj: string;
  }): Promise<string> {
    const sessionId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.sessionTtlSeconds * 1000);

    const session: SessionData = {
      sessionId,
      userId: userData.cpf, // Usando CPF como userId
      cpf: userData.cpf,
      organizationCnpj: userData.organizationCnpj,
      createdAt: now,
      expiresAt,
      isActive: true,
    };

    const sessionKey = this.getSessionKey(sessionId);
    const userSessionsKey = this.getUserSessionsKey(userData.cpf);

    await this.redis.multi()
      .set(sessionKey, JSON.stringify(session), { EX: this.sessionTtlSeconds })
      .sAdd(userSessionsKey, sessionId)
      .expire(userSessionsKey, this.sessionTtlSeconds)
      .exec();

    this.logger.log(`Sessão criada: ${sessionId} para usuário ${userData.cpf}`);

    return sessionId;
  }

  /**
   * Retorna os dados da sessao pelo CPF
   */
  async cpfIdentification(cpf: string): Promise<SessionData | null> {
    const sessionIds = await this.redis.sMembers(this.getUserSessionsKey(cpf));
    if (sessionIds.length === 0) {
      return null;
    }

    for (const sessionId of sessionIds) {
      const session = await this.validateSession(sessionId);
      if (session) {
        return session;
      }
    }

    return null;
  }

    /**
   * Valida uma sessão e retorna os dados se válida
   */
  async validateSession(sessionId: string): Promise<SessionData | null> {
    const sessionKey = this.getSessionKey(sessionId);
    const rawSession = await this.redis.get(sessionKey);
    if (!rawSession) {
      return null;
    }

    const session = this.parseSession(rawSession);
    if (!session) {
      await this.redis.del(sessionKey);
      return null;
    }

    if (!session.isActive) {
      await this.invalidateSession(sessionId);
      return null;
    }

    if (new Date() > session.expiresAt) {
      await this.invalidateSession(sessionId);
      return null;
    }

    return session;
  }

  /**
   * Invalida uma sessão (logout)
   */
  async invalidateSession(sessionId: string): Promise<boolean> {
    const sessionKey = this.getSessionKey(sessionId);
    const rawSession = await this.redis.get(sessionKey);
    if (!rawSession) {
      return false;
    }

    const session = this.parseSession(rawSession);
    if (session) {
      await this.redis.multi()
        .del(sessionKey)
        .sRem(this.getUserSessionsKey(session.cpf), sessionId)
        .exec();
      return true;
    }

    await this.redis.del(sessionKey);
    return false;
  }

  /**
   * Invalida todas as sessões de um usuário
   */
  async invalidateUserSessions(cpf: string): Promise<number> {
    const userSessionsKey = this.getUserSessionsKey(cpf);
    const sessionIds = await this.redis.sMembers(userSessionsKey);
    if (sessionIds.length === 0) {
      return 0;
    }

    const pipeline = this.redis.multi();
    for (const sessionId of sessionIds) {
      pipeline.del(this.getSessionKey(sessionId));
    }
    pipeline.del(userSessionsKey);
    await pipeline.exec();

    return sessionIds.length;
  }

  /**
   * Renova uma sessão (estende o tempo de expiração)
   */
  async renewSession(sessionId: string): Promise<boolean> {
    const sessionKey = this.getSessionKey(sessionId);
    const rawSession = await this.redis.get(sessionKey);
    if (!rawSession) {
      return false;
    }

    const session = this.parseSession(rawSession);
    if (session && session.isActive && new Date() <= session.expiresAt) {
      const now = new Date();
      session.expiresAt = new Date(now.getTime() + this.sessionTtlSeconds * 1000);

      await this.redis.multi()
        .set(sessionKey, JSON.stringify(session), { EX: this.sessionTtlSeconds })
        .expire(this.getUserSessionsKey(session.cpf), this.sessionTtlSeconds)
        .exec();

      return true;
    }
    return false;
  }

  /**
   * Obtém estatísticas das sessões
   */
  async getSessionStats() {
    const now = new Date();
    const sessionKeys = await this.listSessionKeys();
    let activeSessions = 0;
    let expiredSessions = 0;

    for (const key of sessionKeys) {
      const rawSession = await this.redis.get(key);
      if (!rawSession) {
        continue;
      }

      const session = this.parseSession(rawSession);
      if (!session) {
        continue;
      }

      if (session.isActive && session.expiresAt > now) {
        activeSessions++;
      } else {
        expiredSessions++;
      }
    }

    return {
      totalSessions: sessionKeys.length,
      activeSessions,
      expiredSessions,
    };
  }

  /**
   * Limpa todas as sessões expiradas (para manutenção)
   */
  async cleanupAllExpiredSessions() {
    const sessionKeys = await this.listSessionKeys();
    let cleanedCount = 0;

    for (const key of sessionKeys) {
      const rawSession = await this.redis.get(key);
      if (!rawSession) {
        continue;
      }

      const session = this.parseSession(rawSession);
      if (!session) {
        await this.redis.del(key);
        cleanedCount++;
        continue;
      }

      if (new Date() > session.expiresAt) {
        const sessionId = key.replace(`${this.redisPrefix}session:`, '');
        await this.invalidateSession(sessionId);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }
}
