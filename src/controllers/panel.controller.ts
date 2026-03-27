import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CreatePanelUseCase } from '../use-cases/panel/create-panel.use-case';
import { UpdatePanelUseCase } from '../use-cases/panel/update-panel.use-case';
import { GetPanelByOrganizationUseCase } from '../use-cases/panel/get-panel-by-organization.use-case';
import { SessionAuthGuard } from '../auth/session-auth.guard';

@Controller('panels')
export class PanelController {
  constructor(
    private createPanelUseCase: CreatePanelUseCase,
    private updatePanelUseCase: UpdatePanelUseCase,
    private getPanelByOrganizationUseCase: GetPanelByOrganizationUseCase,
  ) {}

  @Get('organization/:cnpj')
  async getByOrganization(@Param('cnpj') cnpj: string) {
    return this.getPanelByOrganizationUseCase.execute(cnpj);
  }

  @UseGuards(SessionAuthGuard)
  @Post()
  async create(@Body() data: any) {
    return this.createPanelUseCase.execute(data);
  }

  @UseGuards(SessionAuthGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
  ) {
    return this.updatePanelUseCase.execute(id, data);
  }
}
