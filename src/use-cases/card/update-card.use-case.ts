import { Card } from "../../entities/card";
import type { CardRepository } from "../../repositories/card.repository";
import { UpdateCardDto } from "../../dto/update-card.dto";
import { Inject } from "@nestjs/common";

export class UpdateCardUseCase {
  constructor(@Inject('CardRepository') private cardRepository: CardRepository) {}

  async execute(updateCardDto: UpdateCardDto & { id: number }): Promise<Card> {
    // Busca o card existente
    const existingCard = await this.cardRepository.findById(updateCardDto.id);
    if (!existingCard) {
      throw new Error("Card não encontrado");
    }

    // Converte strings de data para Date se fornecidas
    const processedDto: any = { ...updateCardDto };
    if (updateCardDto.datehourAttend && typeof updateCardDto.datehourAttend === 'string') {
      processedDto.datehourAttend = new Date(updateCardDto.datehourAttend);
    }
    if (updateCardDto.datehourConcluded && typeof updateCardDto.datehourConcluded === 'string') {
      processedDto.datehourConcluded = new Date(updateCardDto.datehourConcluded);
    }

    // Atualiza apenas os campos fornecidos
    const updatedCard = Card.create({
      ...existingCard,
      ...processedDto
    });

    return this.cardRepository.update(updatedCard);
  }
} 