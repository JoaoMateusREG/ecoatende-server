import { CardRepository } from '../repositories/card.repository';

export class CardNumberGenerator {
  constructor(private cardRepository: CardRepository) {}

  async generateCardNumber(serviceId: number, servicePrefix: string, date: Date = new Date()): Promise<string> {
    // Formata a data para YYYY-MM-DD
    const dateStr = date.toISOString().split('T')[0];
    
    // Busca o último card do serviço para a data específica
    const lastCard = await this.cardRepository.findLastCardByServiceAndDate(serviceId, date);
    
    let nextNumber = 1;
    
    if (lastCard) {
      // Extrai o número do último card (ex: "A001" -> 1)
      const lastNumber = parseInt(lastCard.card.substring(servicePrefix.length));
      nextNumber = lastNumber + 1;
    }
    
    // Formata o número com zeros à esquerda (ex: 1 -> "001")
    const formattedNumber = nextNumber.toString().padStart(3, '0');
    
    // Retorna o card no formato: PREFIX + NÚMERO (ex: "A001")
    return `${servicePrefix}${formattedNumber}`;
  }
} 