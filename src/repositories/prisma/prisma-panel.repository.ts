import { Injectable } from '@nestjs/common';
import { PanelRepository } from '../panel.repository';
import { prisma } from '../../infra/prisma/client';
import { Panel } from '../../entities/panel';

@Injectable()
export class PrismaPanelRepository implements PanelRepository {
  async create(data: Omit<Panel, 'id'>): Promise<Panel> {
    const created = await prisma.panel.create({ 
      data: {
        headerBg: data.headerBg,
        headerText: data.headerText,
        logoBg: data.logoBg,
        logoUrl: data.logoUrl || '',
        alertBg: data.alertBg,
        marqueeText: data.marqueeText,
        message: data.message,
        currentCardBg: data.currentCardBg,
        currentCardText: data.currentCardText,
        cardText: data.cardText,
        serviceText: data.serviceText,
        titleText: data.titleText,
        youtubePlaylistId: data.youtubePlaylistId,
        organizationCnpj: data.organizationCnpj,
      }
    });
    return Panel.create(created);
  }

  async update(id: number, data: Partial<Panel>): Promise<Panel> {
    const updated = await prisma.panel.update({ 
      where: { id }, 
      data: {
        headerBg: data.headerBg,
        headerText: data.headerText,
        logoBg: data.logoBg,
        logoUrl: data.logoUrl === null ? '' : data.logoUrl,
        alertBg: data.alertBg,
        marqueeText: data.marqueeText,
        message: data.message,
        currentCardBg: data.currentCardBg,
        currentCardText: data.currentCardText,
        cardText: data.cardText,
        serviceText: data.serviceText,
        titleText: data.titleText,
        youtubePlaylistId: data.youtubePlaylistId,
      } as any
    });
    return Panel.create(updated);
  }

  async findByOrganizationCnpj(cnpj: string): Promise<Panel | null> {
    const panel = await prisma.panel.findUnique({ where: { organizationCnpj: cnpj } });
    return panel ? Panel.create(panel) : null;
  }

  async findById(id: number): Promise<Panel | null> {
    const panel = await prisma.panel.findUnique({ where: { id } });
    return panel ? Panel.create(panel) : null;
  }
}
