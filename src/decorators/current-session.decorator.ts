import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SessionData } from '../auth/session.service';

export const CurrentSession = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): SessionData => {
    const request = ctx.switchToHttp().getRequest();
    return request.session;
  },
);
