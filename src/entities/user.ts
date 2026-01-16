import { Service } from './service';
import { Organization } from './organization';
import { Card } from './card';

export interface User {
  cpf: string;
  name: string;
  password: string;
  role?: string;
  organizationCnpj: string;
  services?: Service[];
  cards?: Card[];
  picture?: string;
  isActive?: boolean;
  organization?: Organization;
}

export class User {
  constructor(
    public cpf: string,
    public name: string,
    public password: string,
    public organizationCnpj: string,
    public role?: string,
    public services?: Service[],
    public cards?: Card[],
    public picture?: string,
    public isActive?: boolean,
    public organization?: Organization,
  ) {}

  static create(data: {
    cpf: string;
    name: string;
    password: string;
    organizationCnpj: string;
    role?: string;
    services?: Service[];
    cards?: Card[];
    picture?: string;
    isActive?: boolean;
    organization?: Organization;
  }): User {
    return new User(
      data.cpf,
      data.name,
      data.password,
      data.organizationCnpj,
      data.role,
      data.services,
      data.cards,
      data.picture,
      data.isActive,
      data.organization,
    );
  }
}
