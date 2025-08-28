import { Service } from "../entities/service";

export interface ServiceRepository {
  create(service: Service): Promise<Service>;
  update(service: Service): Promise<Service>;
  delete(id: number): Promise<void>;
  findById(id: number): Promise<Service | null>;
  findByOrganization(organizationCnpj: string): Promise<Service[]>;
  findByUser(cpf: string): Promise<Service[]>;
  findByName(name: string): Promise<Service | null>;
  findActive(): Promise<Service[]>;
  associateUsers(serviceId: number, userCpfs: string[]): Promise<void>;
  mapToEntity(data: any): Service;
} 