import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Payment } from "src/entities/payment";


export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'ID da assinatura',
    example: 'sub_1234567890'
  })
  @IsString()
  @IsNotEmpty()
    id: string;

    @ApiProperty({
        description: 'Data de criação da assinatura',
        example: ''
      })
      @IsString()
      @IsNotEmpty()
    dateCreated: string;

    @ApiProperty({
        description: 'ID do cliente associado à assinatura',
        example: 'cus_1234567890'
      })
      @IsString()
      @IsNotEmpty()
    customer: string;

    @ApiProperty({
        description: 'Valor da assinatura em centavos',
        example: 5000
      })
      @IsNotEmpty()
    value: number;

    @ApiProperty({
        description: 'Próxima data de vencimento da assinatura',
        example: '2024-07-01T00:00:00Z'
      })
      @IsString()
      @IsNotEmpty()
    nextDueDate: string;

    @ApiProperty({
        description: 'Ciclo de cobrança da assinatura (mensal, anual, etc.)',
        example: 'monthly'
      })
      @IsString()
      @IsNotEmpty()
    cycle: string;

    @ApiProperty({
        description: 'Tipo de cobrança (ex.: cartão de crédito, boleto, etc.)',
        example: 'credit_card'
      })
      @IsString()
      @IsNotEmpty()
    billingType: string;

    @ApiProperty({
        description: 'Status atual da assinatura (ativa, cancelada, etc.)',
        example: 'active'
      })
      @IsString()
      @IsNotEmpty()
    status: string;

    @ApiProperty({
        description: 'Lista de pagamentos associados à assinatura',
        example: []
      })
      payments?: Payment[];
}
