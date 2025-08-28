import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUser {
  cpf: string;
  organizationCnpj: string;
  sessionId: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
); 