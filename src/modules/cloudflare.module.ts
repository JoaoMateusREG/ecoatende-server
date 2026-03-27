import { Module } from '@nestjs/common';
import { CloudflareController } from '../controllers/cloudflare.controller';

@Module({
    controllers: [CloudflareController],
})
export class CloudflareModule {}