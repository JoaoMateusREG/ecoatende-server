import { Subscription } from "../entities/subscription";

export interface SubscriptionRepository {
  create(subscription: Subscription): Promise<Subscription>;
  update(subscription: Subscription): Promise<Subscription>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Subscription | null>;
  findByOrganization(organizationCnpj: string): Promise<Subscription[]>;
  findByStatus(status: string): Promise<Subscription[]>;
  findByCustomer(customerId: string): Promise<Subscription[]>;
  mapToEntity(data: any): Subscription;
}