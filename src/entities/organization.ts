import { User } from "./user";
import { Card } from "./card";
import { Service } from "./service";

export interface Organization {
  cnpj: string;
  name: string;
  users?: User[];
  cards?: Card[];
  services?: Service[];
}

export class Organization {
  constructor(
    public cnpj: string,
    public name: string,
    public users?: User[],
    public cards?: Card[],
    public services?: Service[]
  ) {}

  static create(data: {
    cnpj: string;
    name: string;
    users?: User[];
    cards?: Card[];
    services?: Service[];
  }): Organization {
    return new Organization(
      data.cnpj,
      data.name,
      data.users,
      data.cards,
      data.services
    );
  }
} 