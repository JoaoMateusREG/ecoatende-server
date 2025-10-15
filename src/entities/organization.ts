import { User } from "./user";
import { Card } from "./card";
import { Service } from "./service";
import { Subscription } from "./subscription";
import { Payment } from "./payment";

export interface Organization {
  cnpj: string;
  name: string;
  creationDate?: Date,
  customerId?: string,
  subscription?: Subscription[];
  users?: User[];
  cards?: Card[];
  services?: Service[];
  payments?: Payment[];
  active?: boolean;
  logo?: string;
}

export class Organization {
  constructor(
    public cnpj: string,
    public name: string,
    public creationDate?: Date,
    public customerId?: string,
    public subscription?: Subscription[],
    public users?: User[],
    public cards?: Card[],
    public services?: Service[],
    public payments?: Payment[],
    public active?: boolean,
    public logo?: string
  ) {}

  static create(data: {
    cnpj: string;
    name: string;
    customerId?: string;
    subscription?: Subscription[];
    creationDate?: Date,
    users?: User[];
    cards?: Card[];
    services?: Service[];
    payments?: Payment[];
    active?: boolean;
    logo?: string;
  }): Organization {
    return new Organization(
      data.cnpj,
      data.name,
      data.creationDate,
      data.customerId,
      data.subscription,
      data.users,
      data.cards,
      data.services,
      data.payments,
      data.active,
      data.logo
    );
  }
} 