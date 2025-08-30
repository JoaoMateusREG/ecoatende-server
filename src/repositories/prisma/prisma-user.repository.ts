import { prisma } from "../../infra/prisma/client";
import { UserRepository } from "../user.repository";
import { User } from "../../entities/user";
import { Service } from "../../entities/service";
import { Organization } from "../../entities/organization";

export class PrismaUserRepository implements UserRepository {
  async create(user: User): Promise<User> {
    const created = await prisma.user.create({
      data: {
        cpf: user.cpf,
        name: user.name?.toUpperCase() || '',
        password: user.password,
        role: user.role as any,
        organizationCnpj: user.organizationCnpj,
        isActive: user.isActive || true,
        picture: user.picture ?? undefined
      },
      include: {
        organization: true,
        services: true
      },
    });

    return this.mapToEntity(created);
  }

  async update(user: User): Promise<User> {
    const updated = await prisma.user.update({
      where: { cpf: user.cpf },
      data: {
        name: user.name?.toUpperCase() || '',
        password: user.password,
        role: user.role as any,
        organizationCnpj: user.organizationCnpj,
        isActive: user.isActive,
        picture: user.picture ?? undefined
      },
      include: {
        organization: true,
        services: true
      },
    });

    return this.mapToEntity(updated);
  }

  async delete(cpf: string): Promise<void> {
    await prisma.user.delete({ where: { cpf } });
  }

  async findByCpf(cpf: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { cpf },
      include: {
        organization: true,
        services: true
      },
    });

    return user ? this.mapToEntity(user) : null;
  }

  async findByRole(role: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: { role: role as any },
      include: {
        organization: true,
        services: true
      },
    });

    return user ? this.mapToEntity(user) : null;
  }

  async findByOrganization(organizationCnpj: string): Promise<User[]> {
    const users = await prisma.user.findMany({
      where: { organizationCnpj },
      include: {
        organization: true,
        services: true
      },
    });

    return users.map(this.mapToEntity);
  }

  async findByService(serviceId: number): Promise<User[]> {
    const users = await prisma.user.findMany({
      where: {
        services: {
          some: {
            id: serviceId
          }
        }
      },
      include: {
        organization: true,
        services: true
      },
    });

    return users.map(this.mapToEntity);
  }

  async findActive(): Promise<User[]> {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      include: {
        organization: true,
        services: true
      },
    });

    return users.map(this.mapToEntity);
  }

  async findByCpfAndPassword(cpf: string, password: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: { 
        cpf
      },
      include: {
        organization: true,
        services: true
      },
    });

    if (!user) {
      return null;
    }

    // Compara a senha fornecida com o hash armazenado
    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }

    return this.mapToEntity(user);
  }

  public mapToEntity = (data: any): User => {
    return User.create({
      cpf: data.cpf,
      name: data.name,
      password: data.password,
      role: data.role,
      organizationCnpj: data.organizationCnpj,
      services: data.services?.map((service: any) => 
        Service.create({
          id: service.id,
          name: service.name,
          prefix: service.prefix,
          organizationCnpj: service.organizationCnpj,
          canCreateCards: service.canCreateCards,
          category: service.category ?? undefined,
          color: service.color ?? undefined
        })
      ),
      isActive: data.isActive,
      picture: data.picture,
      organization: data.organization ? Organization.create({
        cnpj: data.organization.cnpj,
        name: data.organization.name,
        active: data.organization.active
      }) : undefined,
    });
  };
} 