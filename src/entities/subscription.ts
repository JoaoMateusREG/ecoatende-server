import { Organization } from './organization';
import { Payment } from './payment';

export interface Subscription {
  id: string;
  dateCreated: string;
  customer: string;
  value: number;
  nextDueDate: string;
  cycle: string;
  billingType: string;
  status: string;
  organizationCnpj: string;
  organization?: Organization[];
  payments?: Payment[];
}

export class Subscription {
  constructor(
    public id: string,
    public dateCreated: string,
    public customer: string,
    public value: number,
    public nextDueDate: string,
    public cycle: string,
    public billingType: string,
    public status: string,
    public organizationCnpj: string,
    public organization?: Organization[],
    public payments?: Payment[]
  ) {}

  static create(data: {
    id: string;
    dateCreated: string;
    customer: string;
    value: number;
    nextDueDate: string;
    cycle: string;
    billingType: string;
    status: string;
    organizationCnpj: string;
    organization?: Organization[];
    payments?: Payment[];
  }): Subscription {
    return new Subscription(
      data.id,
      data.dateCreated,
      data.customer,
      data.value,
      data.nextDueDate,
      data.cycle,
      data.billingType,
      data.status,
      data.organizationCnpj,
      data.organization,
      data.payments
    );
  }
}