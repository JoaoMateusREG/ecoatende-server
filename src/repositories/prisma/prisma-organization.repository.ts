import { prisma } from "../../infra/prisma/client";
import { OrganizationRepository } from "../organization.repository";
import { Organization } from "../../entities/organization";
import { User } from "../../entities/user";
import { Service } from "../../entities/service";

export class PrismaOrganizationRepository implements OrganizationRepository {
  async create(organization: Organization): Promise<Organization> {
    const created = await prisma.organization.create({
      data: {
        cnpj: organization.cnpj,
        name: organization.name,
        active: organization.active,
        logo: organization.logo
      }
    });

    return this.mapToEntity(created);
  }

  async update(organization: Organization): Promise<Organization> {
    const updated = await prisma.organization.update({
      where: { cnpj: organization.cnpj },
      data: {
        name: organization.name,
        active: organization.active,
        logo: organization.logo
      }
    });

    return this.mapToEntity(updated);
  }

  async delete(cnpj: string): Promise<void> {
    await prisma.organization.delete({ where: { cnpj } });
  }

  async findByCnpj(cnpj: string): Promise<Organization | null> {
    const organization = await prisma.organization.findUnique({
      where: { cnpj }
    });

    return organization ? this.mapToEntity(organization) : null;
  }

  async findByName(name: string): Promise<Organization | null> {
    const organization = await prisma.organization.findFirst({
      where: { name }
    });

    return organization ? this.mapToEntity(organization) : null;
  }

  async findAll(): Promise<Organization[]> {
    const organizations = await prisma.organization.findMany({
    });

    return organizations.map(this.mapToEntity);
  }

  async findFirst(): Promise<Organization | null> {
    const organization = await prisma.organization.findFirst({
    });

    return organization ? this.mapToEntity(organization) : null;
  }

  async findWithUsers(cnpj: string): Promise<Organization | null> {
    const organization = await prisma.organization.findUnique({
      where: { cnpj },
      include: {
        users: true,
        services: {
          include: {
            users: true
          }
        }
      },
    });

    return organization ? this.mapToEntity(organization) : null;
  }

  async findWithServices(cnpj: string): Promise<Organization | null> {
    const organization = await prisma.organization.findUnique({
      where: { cnpj },
      include: {
        services: {
          include: {
            users: true
          }
        },
        users: true
      },
    });

    return organization ? this.mapToEntity(organization) : null;
  }

  async findWithCards(cnpj: string): Promise<Organization | null> {
    const organization = await prisma.organization.findUnique({
      where: { cnpj },
      include: {
        cards: true
      },
    });

    return organization ? this.mapToEntity(organization) : null;
  }

  public mapToEntity = (data: any): Organization => {
    return Organization.create({
      cnpj: data.cnpj,
      name: data.name,
      users: data.users?.map((user: any) =>
        User.create({
          cpf: user.cpf,
          name: user.name,
          password: user.password,
          role: user.role,
          organizationCnpj: user.organizationCnpj,
          isActive: user.isActive,
          picture: user.picture
        })
      ),
      services: data.services?.map((service: any) =>
        Service.create({
          id: service.id,
          name: service.name,
          prefix: service.prefix,
          organizationCnpj: service.organizationCnpj,
          category: service.category ?? undefined,
          color: service.color ?? undefined,
          canCreateCards: service.canCreateCards,
          cardLimit: service.cardLimit ?? undefined,
          users: service.users?.map((user: any) =>
            User.create({
              cpf: user.cpf,
              name: user.name,
              password: user.password,
              role: user.role,
              organizationCnpj: user.organizationCnpj,
              isActive: user.isActive,
              picture: user.picture
            })
          )
        })
      ),
      active: data.active,
      logo: data.logo
    });
  };
} 