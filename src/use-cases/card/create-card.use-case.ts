import { Card, CardStatus } from "../../entities/card";
import type { CardRepository } from "../../repositories/card.repository";
import type { ServiceRepository } from "../../repositories/service.repository";
import { CreateCardDto } from "../../dto/create-card.dto";
import { CardNumberGenerator } from "../../utils/card-number-generator";
import { Inject } from "@nestjs/common";

export class CreateCardUseCase {
  constructor(
    @Inject('CardRepository') private cardRepository: CardRepository,
    @Inject('ServiceRepository') private serviceRepository: ServiceRepository
  ) {}

  async execute(createCardDto: CreateCardDto): Promise<Card> {
    // Busca o serviço para obter o prefixo
    const service = await this.serviceRepository.findById(parseInt(createCardDto.serviceId));
    if (!service) {
      throw new Error("Serviço não encontrado");
    }

    // Verifica se o serviço permite criação de cards
    if (!service.canCreateCards) {
      throw new Error("Este serviço não permite criação de fichas");
    }

    // Gera o número do card usando o prefixo do serviço
    const cardNumberGenerator = new CardNumberGenerator(this.cardRepository);
    const cardNumber = await cardNumberGenerator.generateCardNumber(
      service.id,
      service.prefix,
      new Date()
    );

    // Cria a entidade Card a partir do DTO
    const card = Card.create({
      id: 0, // Será gerado pelo banco de dados
      card: cardNumber,
      priority: createCardDto.priority,
      status: CardStatus.WAITING, // Status inicial
      datehour: new Date(), // Data/hora atual
      concluded: false, // Inicialmente não concluído
      organizationCnpj: createCardDto.organizationCnpj,
      serviceId: parseInt(createCardDto.serviceId),
      userCpf: createCardDto.userCpf
    });

    return this.cardRepository.create(card);
  }
} 