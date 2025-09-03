import { Card, CardStatus } from "../../entities/card";
import type { CardRepository } from "../../repositories/card.repository";
import type { ServiceRepository } from "../../repositories/service.repository";
import { CreateCardDto } from "../../dto/create-card.dto";
import { CardNumberGenerator } from "../../utils/card-number-generator";
import { Inject } from "@nestjs/common";

export class CreateCardUseCase {
  constructor(
    @Inject('CardRepository') private cardRepository: CardRepository,
    @Inject('ServiceRepository') private serviceRepository: ServiceRepository,
    private cardNumberGenerator: CardNumberGenerator,
  ) {}

  async execute(createCardDto: CreateCardDto): Promise<Card> {
    const serviceId = parseInt(createCardDto.serviceId, 10);

    // Busca o serviço para obter o prefixo e o limite
    const service = await this.serviceRepository.findById(serviceId);
    if (!service) {
      throw new Error("Serviço não encontrado");
    }

    // Verifica se o serviço permite criação de cartões
    if (!service.canCreateCards) {
      throw new Error("Este serviço não permite criação de fichas");
    }

    // Geração do número da ficha
    const today = new Date();
    
    // Passamos a responsabilidade de gerar e verificar o limite para a classe geradora
    const cardNumber = await this.cardNumberGenerator.generateCardNumber(
      serviceId,
      service.prefix,
      today,
      service.cardLimit,
    );

    // Cria a entidade Card a partir do DTO
    const card = Card.create({
      id: 0, // O ID será gerado pelo banco de dados
      card: cardNumber,
      priority: createCardDto.priority,
      status: CardStatus.WAITING, // Status inicial
      datehour: today, // Data/hora atual
      concluded: false, // Inicialmente não concluído
      organizationCnpj: createCardDto.organizationCnpj,
      serviceId: serviceId,
      userCpf: createCardDto.userCpf
    });

    return this.cardRepository.create(card);
  }
}