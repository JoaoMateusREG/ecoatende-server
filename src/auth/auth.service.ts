import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type { UserRepository } from '../repositories/user.repository';
import { LoginDto } from './dto/login.dto';
import { SessionService } from './session.service';

export interface LoginResponse {
  sessionId: string;
  user: {
    cpf: string;
    name: string;
    organizationCnpj: string;
    isActive: boolean;
    services: Array<{
      id: number;
      name: string;
      prefix: string;
    }>;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @Inject('UserRepository') private userRepository: UserRepository,
    private sessionService: SessionService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.userRepository.findByCpfAndPassword(
      loginDto.cpf,
      loginDto.password
    );

    if (!user) {
      throw new UnauthorizedException('CPF ou senha inválidos');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuário inativo');
    }

    if (!user.organization?.active) {
      throw new UnauthorizedException('Organização inativa');
    }

    // Cria uma sessão para o usuário
    const sessionId = await this.sessionService.createSession({
      cpf: user.cpf,
      organizationCnpj: user.organizationCnpj,
    });

    return {
      sessionId,
      user: {
        cpf: user.cpf,
        name: user.name,
        organizationCnpj: user.organizationCnpj,
        isActive: user.isActive,
        services: user.services?.map(service => ({
          id: service.id,
          name: service.name,
          prefix: service.prefix
        })) || []
      },
    };
  }

  async validateUser(cpf: string): Promise<any> {
    const user = await this.userRepository.findByCpf(cpf);
    if (user && user.isActive) {
      return user;
    }
    return null;
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async getCurrentUser(cpf: string) {
    try {
      // Busca o usuário atualizado no banco com todos os dados
      const user = await this.userRepository.findByCpf(cpf);
      
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Usuário não encontrado ou inativo');
      }

      // Retorna todos os dados do usuário igual à rota users/:cpf
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Erro ao buscar usuário');
    }
  }

  async renewSession(sessionId: string): Promise<boolean> {
    return this.sessionService.renewSession(sessionId);
  }

  getSessionStats() {
    return this.sessionService.getSessionStats();
  }
} 