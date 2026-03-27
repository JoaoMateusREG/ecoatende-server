import { Panel } from '../entities/panel';

export interface PanelRepository {
  create(data: Omit<Panel, 'id'>): Promise<Panel>;
  update(id: number, data: Partial<Panel>): Promise<Panel>;
  findByOrganizationCnpj(cnpj: string): Promise<Panel | null>;
  findById(id: number): Promise<Panel | null>;
}
