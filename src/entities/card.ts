import { Organization } from './organization';
import { Service } from './service';
import { User } from './user';

export enum CardStatus {
  WAITING = 'WAITING',
  CALLED = 'CALLED',
  IN_ATTENDANCE = 'IN_ATTENDANCE',
  FINISHED = 'FINISHED',
}

export enum CardPriority {
  NORMAL = 'NORMAL',
  PREFERENTIAL = 'PREFERENTIAL',
  URGENT = 'URGENT',
}

export interface Card {
  id: number;
  card: string;
  priority: CardPriority;
  status: CardStatus;
  datehour: Date;
  datehourAttend?: Date;
  concluded: boolean;
  datehourConcluded?: Date;
  organizationCnpj: string;
  serviceId: number;
  userCpf?: string;
  organization?: Organization;
  service?: Service;
  user?: User;
}

export class Card {
  constructor(
    public id: number,
    public card: string,
    public priority: CardPriority,
    public status: CardStatus,
    public datehour: Date,
    public concluded: boolean = false,
    public organizationCnpj: string,
    public serviceId: number,
    public datehourAttend?: Date,
    public datehourConcluded?: Date,
    public userCpf?: string,
    public organization?: Organization,
    public service?: Service,
    public user?: User,
  ) {}

  static create(data: {
    id: number;
    card: string;
    priority: CardPriority;
    status: CardStatus;
    datehour: Date;
    datehourAttend?: Date;
    concluded?: boolean;
    datehourConcluded?: Date;
    organizationCnpj: string;
    serviceId: number;
    userCpf?: string;
    organization?: Organization;
    service?: Service;
    user?: User;
  }): Card {
    return new Card(
      data.id,
      data.card,
      data.priority,
      data.status,
      data.datehour,
      data.concluded ?? false,
      data.organizationCnpj,
      data.serviceId,
      data.datehourAttend,
      data.datehourConcluded,
      data.userCpf,
      data.organization,
      data.service,
      data.user,
    );
  }
}
