import { User } from "../entities/user";

export interface UserRepository {
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(cpf: string): Promise<void>;
  findByCpf(cpf: string): Promise<User | null>;
  findByRole(role: string): Promise<User | null>;
  findByOrganization(organizationCnpj: string): Promise<User[]>;
  findByService(serviceId: number): Promise<User[]>;
  findActive(): Promise<User[]>;
  findByCpfAndPassword(cpf: string, password: string): Promise<User | null>;
  mapToEntity(data: any): User;
} 