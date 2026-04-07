import { Injectable } from '@nestjs/common';
import { prisma } from '../infra/prisma/client';

@Injectable()
export class CardNumberGenerator {
  async generateCardNumber(
    serviceId: number,
    servicePrefix: string,
    cardLimit?: number,
  ): Promise<string> {
    const nextNumber = await prisma.$transaction(async (tx) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Garante que existe linha para poder aplicar lock e evitar concorrência.
      // (Se já existir, não altera nada.)
      await tx.serviceCounter.upsert({
        where: { serviceId },
        create: { serviceId, currentValue: 0, lastReset: today },
        update: {},
      });

      // Lock pessimista na linha do contador: impede dois requests de
      // incrementarem ao mesmo tempo e retornarem o mesmo número.
      await tx.$queryRaw`
        SELECT 1
        FROM "ServiceCounter"
        WHERE "serviceId" = ${serviceId}
        FOR UPDATE
      `;

      const counter = await tx.serviceCounter.findUnique({
        where: { serviceId },
      });

      if (!counter) {
        throw new Error('Contador do serviço não encontrado');
      }

      const lastResetDate = new Date(counter.lastReset);
      lastResetDate.setHours(0, 0, 0, 0);

      if (lastResetDate < today) {
        const updated = await tx.serviceCounter.update({
          where: { serviceId },
          data: { currentValue: 1, lastReset: today },
          select: { currentValue: true },
        });
        return updated.currentValue;
      }

      const updated = await tx.serviceCounter.update({
        where: { serviceId },
        data: { currentValue: { increment: 1 } },
        select: { currentValue: true },
      });

      return updated.currentValue;
    });

    if (cardLimit && nextNumber > cardLimit) {
      throw new Error(`Limite diário de cartões atingido para este serviço.`);
    }

    if (nextNumber > 999) {
      throw new Error(`Limite máximo de cartões atingido para este serviço`);
    }

    return `${servicePrefix}${nextNumber}`;
  }
}
