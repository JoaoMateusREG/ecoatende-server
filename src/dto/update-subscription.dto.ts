import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSubscriptionDto {
  @ApiProperty({
    description: 'Valor da assinatura',
    example: '109.00',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiProperty({
    description: 'Próxima data de vencimento da assinatura',
    example: '',
    required: false,
  })
  @IsOptional()
  nextDueDate?: string;

  @ApiProperty({
    description: 'Ciclo de cobrança da assinatura (mensal, anual, etc.)',
    example: 'monthly',
    required: false,
  })
  @IsOptional()
  cycle?: string;

  @ApiProperty({
    description: 'Tipo de cobrança (ex.: cartão de crédito, boleto, etc.)',
    example: 'credit_card',
    required: false,
  })
  @IsOptional()
  billingType?: string;

  @ApiProperty({
    description: 'Status da assinatura (ex.: ativa, cancelada, pendente, etc.)',
    example: 'active',
    required: false,
  })
  @IsOptional()
  status?: string;
}
