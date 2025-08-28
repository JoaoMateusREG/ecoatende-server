import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateFirstOrganizationDto } from '../dto/create-first-organization.dto';
import { CreateFirstAdminDto } from '../dto/create-first-admin.dto';
import type { UserRepository } from '../repositories/user.repository';
import type { OrganizationRepository } from '../repositories/organization.repository';
import { User } from '../entities/user';
import { Organization } from '../entities/organization';
import { isValidCPF } from '../utils/cpf-validator';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SetupService {
  private prisma = new PrismaClient();

  constructor(
    @Inject('UserRepository') private userRepository: UserRepository,
    @Inject('OrganizationRepository') private organizationRepository: OrganizationRepository,
  ) {}

  async createFirstOrganization(createFirstOrganizationDto: CreateFirstOrganizationDto): Promise<Organization> {
    // Verificar se já existe uma organização
    const existingOrganization = await this.organizationRepository.findFirst();
    if (existingOrganization) {
      throw new Error('Já existe uma organização cadastrada no sistema');
    }

    // Validar CNPJ (implementar validação de CNPJ se necessário)
    if (!createFirstOrganizationDto.cnpj || createFirstOrganizationDto.cnpj.length < 14) {
      throw new Error('CNPJ inválido');
    }

    const organization = Organization.create({
      cnpj: createFirstOrganizationDto.cnpj,
      name: createFirstOrganizationDto.name,
    });

    return await this.organizationRepository.create(organization);
  }

  async createFirstAdmin(createFirstAdminDto: CreateFirstAdminDto): Promise<User> {
    // Verificar se já existe um admin
    const existingAdmin = await this.userRepository.findByRole('ADMIN');
    if (existingAdmin) {
      throw new Error('Já existe um administrador cadastrado no sistema');
    }

    // Verificar se existe uma organização
    const organization = await this.organizationRepository.findFirst();
    if (!organization) {
      throw new Error('É necessário criar uma organização antes de criar o administrador');
    }

    // Validar CPF
    if (!isValidCPF(createFirstAdminDto.cpf)) {
      throw new Error('CPF inválido');
    }

    // Verificar se o CPF já existe
    const existingUser = await this.userRepository.findByCpf(createFirstAdminDto.cpf);
    if (existingUser) {
      throw new Error('CPF já cadastrado');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(createFirstAdminDto.password, 10);

    const admin = User.create({
      cpf: createFirstAdminDto.cpf,
      name: createFirstAdminDto.name,
      password: hashedPassword,
      role: 'ADMIN',
      organizationCnpj: organization.cnpj,
    });

    return await this.userRepository.create(admin);
  }
} 