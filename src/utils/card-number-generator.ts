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
    // Busca o último cartão do serviço para a data específica
    const lastCard = await this.cardRepository.findLastCardByServiceAndDate(
      serviceId,
      date,
    );

    let nextNumber = 1;

    if (lastCard) {
      // Extrai apenas os dígitos do número do último cartão (ignora prefixo e 'P')
      const digits = lastCard.card.replace(/[^0-9]/g, '');
      const lastNumber = parseInt(digits);
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

    // Retorna o cartão no formato: PREFIX + NÚMERO (sem o P de preferencial, adicionado no use case)
    return `${servicePrefix}${nextNumber}`;
  }
}
