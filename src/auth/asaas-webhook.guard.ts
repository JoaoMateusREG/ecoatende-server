import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AsaasWebhookGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['asaas-access-token'];

    if (!token) {
      throw new UnauthorizedException('Asaas access token is missing');
    }

    if (token !== process.env.ASAAS_WEBHOOK_TOKEN) {
      throw new UnauthorizedException('Invalid Asaas access token');
    }

    return true;
  }
}
