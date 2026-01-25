import { Organization } from './organization';
import { User } from './user';
import { Card } from './card';

export interface Service {
  id: number;
  name: string;
  prefix: string;
  organizationCnpj: string;
  canCreateCards: boolean;
  cardLimit?: number;
  category?: string;
  color?: string;
  users?: User[];
  cards?: Card[];
  organization?: Organization;
}

export class Service {
  constructor(
    public id: number,
    public name: string,
    public prefix: string,
    public organizationCnpj: string,
    public canCreateCards: boolean,
    public cardLimit?: number,
    public category?: string,
    public color?: string,
    public users?: User[],
    public cards?: Card[],
    public organization?: Organization,
  ) {}

  static create(data: {
    id: number;
    name: string;
    prefix: string;
    organizationCnpj: string;
    canCreateCards: boolean;
    cardLimit?: number;
    category?: string;
    color?: string;
    users?: User[];
    cards?: Card[];
    organization?: Organization;
  }): Service {
    return new Service(
      data.id,
      data.name,
      data.prefix,
      data.organizationCnpj,
      data.canCreateCards,
      data.cardLimit,
      data.category,
      data.color,
      data.users,
      data.cards,
      data.organization,
    );
  }
}
