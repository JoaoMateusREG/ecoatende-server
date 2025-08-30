import { User } from "../../entities/user";
import type { UserRepository } from "../../repositories/user.repository";
import { CreateUserDto } from "../../dto/create-user.dto";
import { isValidCPF } from "../../utils/cpf-validator";
import * as bcrypt from 'bcryptjs';
import { Inject } from "@nestjs/common";

export class CreateUserUseCase {
  constructor(@Inject('UserRepository') private userRepository: UserRepository) {}

  async execute(createUserDto: CreateUserDto): Promise<User> {
    // Valida o CPF antes de criar o usuário
    if (!isValidCPF(createUserDto.cpf)) {
      throw new Error("CPF inválido");
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