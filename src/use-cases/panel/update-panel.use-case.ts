import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { PanelRepository } from '../../repositories/panel.repository';
import { Panel } from '../../entities/panel';

@Injectable()
export class UpdatePanelUseCase {
  constructor(
    @Inject('PanelRepository')
    private panelRepository: PanelRepository,
  ) {}

  async execute(id: number, data: Partial<Panel>) {
    const existingPanel = await this.panelRepository.findById(id);
    if (!existingPanel) {
      throw new NotFoundException('Panel configuration not found');
    }
    return this.panelRepository.update(id, data);
  }
}
