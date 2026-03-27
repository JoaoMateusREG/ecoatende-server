import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { PanelRepository } from '../../repositories/panel.repository';

@Injectable()
export class GetPanelByOrganizationUseCase {
  constructor(
    @Inject('PanelRepository')
    private panelRepository: PanelRepository,
  ) {}

  async execute(organizationCnpj: string) {
    const panel = await this.panelRepository.findByOrganizationCnpj(organizationCnpj);
    if (!panel) {
      throw new NotFoundException('Panel configuration not found');
    }
    return panel;
  }
}
