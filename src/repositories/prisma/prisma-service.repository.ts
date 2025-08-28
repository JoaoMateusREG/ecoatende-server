import { prisma } from "../../infra/prisma/client";
import { ServiceRepository } from "../service.repository";
import { Service } from "../../entities/service";
import { Organization } from "../../entities/organization";
import { User } from "../../entities/user";

export class PrismaServiceRepository implements ServiceRepository {
  async create(service: Service): Promise<Service> {
    const created = await prisma.service.create({
      data: {
        name: service.name,
        prefix: service.prefix,
        organizationCnpj: service.organizationCnpj,
        canCreateCards: service.canCreateCards
      },
      include: {
        organization: true,
        users: true
      },
    });

    return this.mapToEntity(created);
  }

  async update(service: Service): Promise<Service> {
    const updated = await prisma.service.update({
      where: { id: service.id },
      data: {
        name: service.name,
        prefix: service.prefix,
        organizationCnpj: service.organizationCnpj,
        canCreateCards: service.canCreateCards
      },
      include: {
        organization: true,
        users: true
      },
    });

    return this.mapToEntity(updated);
  }

  async delete(id: number): Promise<void> {
    await prisma.service.delete({ where: { id } });
  }

  async findById(id: number): Promise<Service | null> {
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        organization: true,
        users: true
      },
    });

    return service ? this.mapToEntity(service) : null;
  }

  async findByName(name: string): Promise<Service | null> {
    const service = await prisma.service.findFirst({
      where: { name: name },
      include: {
        organization: true,
        users: true
      },
    });

    return service ? this.mapToEntity(service) : null;
  }

  async findByOrganization(organizationCnpj: string): Promise<Service[]> {
    const services = await prisma.service.findMany({
      where: { organizationCnpj },
      include: {
        organization: true,
        users: true
      },
    });

    return services.map(this.mapToEntity);
  }

  async findByUser(userCpf: string): Promise<Service[]> {
    const services = await prisma.service.findMany({
      where: {
        users: {
          some: {
            cpf: userCpf
          }
        }
      },
      include: {
        organization: true,
        users: true
      },
    });

    return services.map(this.mapToEntity);
  }

  async findActive(): Promise<Service[]> {
    const services = await prisma.service.findMany({
      include: {
        organization: true,
        users: true
      },
    });

    return services.map(this.mapToEntity);
  }

  async associateUsers(serviceId: number, userCpfs: string[]): Promise<void> {
    // Faz tudo em uma única operação: remove todas as associações e adiciona as novas
    await prisma.service.update({
      where: { id: serviceId },
      data: {
        users: {
          set: userCpfs.map(cpf => ({ cpf }))
        }
      }
    });
  }

  public mapToEntity = (data: any): Service => {
    return Service.create({
      id: data.id,
      name: data.name,
      prefix: data.prefix,
      organizationCnpj: data.organizationCnpj,
      canCreateCards: data.canCreateCards,
      organization: data.organization ? Organization.create({
        cnpj: data.organization.cnpj,
        name: data.organization.name
      }) : undefined,
      users: data.users?.map((user: any) => 
        User.create({
          cpf: user.cpf,
          name: user.name,
          password: user.password,
          role: user.role,
          organizationCnpj: user.organizationCnpj,
          isActive: user.isActive
        })
      )
    });
  };
} 