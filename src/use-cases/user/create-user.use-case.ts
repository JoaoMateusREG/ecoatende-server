import { User } from "../../entities/user";
import type { UserRepository } from "../../repositories/user.repository";
import { CreateUserDto } from "../../dto/create-user.dto";
import { isValidCPF } from "../../utils/cpf-validator";
import * as bcrypt from 'bcryptjs';
import { Inject } from "@nestjs/common";

export class CreateUserUseCase {
  constructor(@Inject('UserRepository') private userRepository: UserRepository) {}

  async execute(createUserDto: CreateUserDto, requestingUserCpf?: string): Promise<User> {
    // Valida o CPF antes de criar o usuário
    if (!isValidCPF(createUserDto.cpf)) {
      throw new Error("CPF inválido");
    }

    // Se foi fornecido o CPF de quem está fazendo a requisição, verifica permissão
    if (requestingUserCpf) {
      const requestingUser = await this.userRepository.findByCpf(requestingUserCpf);
      
      if (!requestingUser) {
        throw new Error("Usuário solicitante não encontrado");
      }

      // Verifica permissões baseado no role
      if (requestingUser.role === 'USER') {
        throw new Error("Você não tem permissão para criar usuários");
      }

      if (requestingUser.role === 'ORGANIZATION_ADMIN') {
        // ORGANIZATION_ADMIN só pode criar usuários da própria organização
        if (requestingUser.organizationCnpj !== createUserDto.organizationCnpj) {
          throw new Error("Você só pode criar usuários da sua própria organização");
        }

        if (createUserDto.role == 'ADMIN' || 'ORGANIZATION_ADMIN' ) {
          throw new Error("Você não tem permissão para criar adiministradores");
        }
      }
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Cria a entidade User a partir do DTO
    const user = User.create({
      cpf: createUserDto.cpf,
      name: createUserDto.name,
      password: hashedPassword,
      organizationCnpj: createUserDto.organizationCnpj,
      role: createUserDto.role,
      isActive: true,
      picture: createUserDto.picture ?? undefined
    });

    return this.userRepository.create(user);
  }
} 