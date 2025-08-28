import { Organization } from "../entities/organization";

export interface OrganizationRepository {
  create(organization: Organization): Promise<Organization>;
  update(organization: Organization): Promise<Organization>;
  delete(cnpj: string): Promise<void>;
  findByCnpj(cnpj: string): Promise<Organization | null>;
  findByName(name: string): Promise<Organization | null>;
  findAll(): Promise<Organization[]>;
  findFirst(): Promise<Organization | null>;
  findWithUsers(cnpj: string): Promise<Organization | null>;
  findWithServices(cnpj: string): Promise<Organization | null>;
  findWithCards(cnpj: string): Promise<Organization | null>;
  mapToEntity(data: any): Organization;
} 