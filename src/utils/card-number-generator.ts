import type { CardRepository } from '../repositories/card.repository';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class CardNumberGenerator {
  constructor(
    @Inject('CardRepository') private cardRepository: CardRepository,
  ) {}

  async generateCardNumber(
    serviceId: number,
    servicePrefix: string,
    date: Date = new Date(),
    cardLimit?: number,
  ): Promise<string> {
    // Formata a data para YYYY-MM-DD
    const dateStr = date.toISOString().split('T')[0];

    // Busca o último cartão do serviço para a data específica
    const lastCard = await this.cardRepository.findLastCardByServiceAndDate(
      serviceId,
      date,
    );

    let nextNumber = 1;

    if (lastCard) {
      // Extrai o número do último cartão (ex: "A100" -> 100)
      const lastNumber = parseInt(
        lastCard.card.substring(servicePrefix.length),
      );
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    // Valida se o número não excedeu o limite. Primeiro verifica o limite do serviço, depois o limite padrão de 999.
    if (cardLimit && nextNumber > cardLimit) {
      throw new Error(`Limite diário de cartões atingido para este serviço.`);
    }

    // Se o limite do serviço não for definido, valida o padrão de 999
    if (nextNumber > 999) {
      throw new Error(`Limite máximo de cartões atingido para este serviço`);
    }

    // Retorna o cartão no formato: PREFIX + NÚMERO
    return `${servicePrefix}${nextNumber}`;
  }
}
