import { Card } from '../entities/card';

export interface CardRepository {
  create(card: Card): Promise<Card>;
  update(card: Card): Promise<Card>;
  delete(id: number): Promise<void>;
  deleteByServiceId(serviceId: number): Promise<void>;
  findById(id: number): Promise<Card | null>;
  findByServiceId(serviceId: number): Promise<Card[]>;
  findByNumberAndDate(cardNumber: string, date: Date): Promise<Card | null>;
  findTodayCreatedByOrganizationAndService(
    organizationCnpj: string,
    serviceId: number,
  ): Promise<Card[]>;
  findTodayConcluded(organizationCnpj: string): Promise<Card[]>;
  countByServiceAndDate(serviceId: number, date: Date): Promise<number>;
  findPendingByServices(serviceIds?: number[]): Promise<Card[]>;
  countPendingByOrganization(organizationCnpj: string): Promise<number>;
  findInAttendanceByServices(serviceIds?: number[]): Promise<Card[]>;
  findTodayCalledByOrganization(organizationCnpj: string): Promise<Card[]>;
  findLastCardByServiceAndDate(
    serviceId: number,
    date: Date,
  ): Promise<Card | null>;
  countConcludedTodayByOrganization(organizationCnpj: string): Promise<number>;
  countInAttendanceByOrganization(organizationCnpj: string): Promise<number>;
  getAverageWaitTime(
    organizationCnpj: string,
    startDate: Date,
    endDate: Date,
    serviceId?: number,
  ): Promise<number>;
  getAverageServiceTime(
    organizationCnpj: string,
    startDate: Date,
    endDate: Date,
    serviceId?: number,
  ): Promise<number>;
  getCompletedCardsCount(
    organizationCnpj: string,
    startDate: Date,
    endDate: Date,
    serviceId?: number,
  ): Promise<number>;
  mapToEntity(data: any): Card;
}
