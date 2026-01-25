import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type { UserRepository } from '../repositories/user.repository';
import { LoginDto } from './dto/login.dto';
import { SessionService } from './session.service';
import type { PaymentRepository } from '../repositories/payment.repository';
import { UserRole } from '../utils/user-role';

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
    @Inject('PaymentRepository') private paymentRepository: PaymentRepository,
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

    // Busca todos os pagamentos da organização
    const payments = await this.paymentRepository.findByOrganizationCnpj(user.organizationCnpj);

    // Filtra pagamentos com status RECEIVED e ordena por dueDate (mais recente primeiro)
    const receivedPayments = payments
      .filter(payment => payment.status === 'RECEIVED')
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

    // Se não houver nenhum pagamento recebido, bloqueia o login
    if (receivedPayments.length === 0) {
      throw new UnauthorizedException('Nenhum pagamento confirmado. Entre em contato com o suporte.');
    }

    // Verifica se o último pagamento recebido está dentro do prazo
    const lastReceivedPayment = receivedPayments[0];
    const dueDate = new Date(lastReceivedPayment.dueDate);
    
    // Adiciona 31 dias à data de vencimento
    const expirationDate = new Date(dueDate);
    expirationDate.setDate(expirationDate.getDate() + 31);
    
    const currentDate = new Date();
    
    // Se a data atual for maior que a data de expiração, bloqueia o login
    if (currentDate > expirationDate) {
      throw new UnauthorizedException('Pagamento expirado. Entre em contato com o suporte.');
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

  async site(loginDto: LoginDto): Promise<LoginResponse> {
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

    if (user.role !== UserRole.ADMIN){
      throw new UnauthorizedException('Apenas os administradores da empresa podem acessar')
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

  async getCurrentUserOrganization(cpf: string) {
    try {
      // Busca o usuário atualizado no banco com todos os dados
      const user = await this.userRepository.findByCpf(cpf);
      
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Usuário não encontrado ou inativo');
      }

      if (!user.organization) {
        throw new UnauthorizedException('Usuário não possui organização associada');
      }

      // Retorna a organização com todas as relações
      return user.organization;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Erro ao buscar organização do usuário');
    }
  }
} 