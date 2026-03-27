import { Module } from '@nestjs/common';
import { PanelController } from '../controllers/panel.controller';
import { CreatePanelUseCase } from '../use-cases/panel/create-panel.use-case';
import { UpdatePanelUseCase } from '../use-cases/panel/update-panel.use-case';
import { GetPanelByOrganizationUseCase } from '../use-cases/panel/get-panel-by-organization.use-case';
import { PrismaPanelRepository } from '../repositories/prisma/prisma-panel.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PanelController],
  providers: [
    CreatePanelUseCase,
    UpdatePanelUseCase,
    GetPanelByOrganizationUseCase,
    {
      provide: 'PanelRepository',
      useClass: PrismaPanelRepository,
    },
  ],
})
export class PanelModule {}
