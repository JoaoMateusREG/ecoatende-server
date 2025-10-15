import { Organization } from './organization';
import { Subscription } from './subscription';

export interface Payment {
  id: string;
  dateCreated: string;
  customer: string;
  organization?: Organization;
  organizationCnpj: string;
  subscription?: Subscription;
  subscriptionId: string;
  dueDate: string;
  originalDueDate: string;
  value: number;
  netValue: number;
  originalValue?: number | null;
  billingType: string;
  status: string;
  transactionReceiptUrl?: string;
}

export class Payment {
  constructor(
    public id: string,
    public dateCreated: string,
    public customer: string,
    public organizationCnpj: string,
    public subscriptionId: string,
    public dueDate: string,
    public originalDueDate: string,
    public value: number,
    public netValue: number,
    public billingType: string,
    public status: string,
    public organization?: Organization,
    public subscription?: Subscription,
    public originalValue?: number | null,
    public transactionReceiptUrl?: string,
  ) {}

  static create(data: {
    id: string;
    dateCreated: string;
    customer: string;
    organizationCnpj: string;
    subscriptionId: string;
    dueDate: string;
    originalDueDate: string;
    value: number;
    netValue: number;
    billingType: string;
    status: string;
    organization?: Organization;
    subscription?: Subscription;
    originalValue?: number | null;
    transactionReceiptUrl?: string;
  }): Payment {
    return new Payment(
      data.id,
      data.dateCreated,
      data.customer,
      data.organizationCnpj,
      data.subscriptionId,
      data.dueDate,
      data.originalDueDate,
      data.value,
      data.netValue,
      data.billingType,
      data.status,
      data.organization,
      data.subscription,
      data.originalValue,
      data.transactionReceiptUrl,
    );
  }
}
