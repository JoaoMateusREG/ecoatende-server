import { Injectable, Inject } from '@nestjs/common';
import type { PanelRepository } from '../../repositories/panel.repository';
import { Panel } from '../../entities/panel';

@Injectable()
export class CreatePanelUseCase {
  constructor(
    @Inject('PanelRepository')
    private panelRepository: PanelRepository,
  ) {}

  async execute(data: Omit<Panel, 'id'>) {
    return this.panelRepository.create(data);
  }
}
