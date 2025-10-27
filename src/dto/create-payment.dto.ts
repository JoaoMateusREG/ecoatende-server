import {
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'ID do pagamento',
    example: 'pay_1234567890',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Data de criação do pagamento',
    example: '2024-06-01T12:00:00Z',
  })
  @IsString()
  @IsNotEmpty()
  dateCreated: string;

  @ApiProperty({
    description: 'ID do cliente associado ao pagamento',
    example: 'customer_123456',
  })
  @IsString()
  @IsNotEmpty()
  customer: string;

  @ApiProperty({
    description: 'ID da assinatura associada ao pagamento',
    example: 'sub_1234567890',
  })
  @IsString()
  @IsNotEmpty()
  subscription: string;

  @ApiProperty({
    description: 'Data de vencimento do pagamento',
    example: '2024-07-01T12:00:00Z',
  })
  @IsString()
  @IsNotEmpty()
  dueDate: string;

  @ApiProperty({
    description: 'Data original de vencimento do pagamento',
    example: '2024-07-01T12:00:00Z',
  })
  @IsString()
  @IsNotEmpty()
  originalDueDate: string;

  @ApiProperty({
    description: 'Valor do pagamento',
    example: 199.99,
  })
  @IsNotEmpty()
  value: number;

  @ApiProperty({
    description: 'Valor líquido do pagamento após deduções',
    example: 189.99,
  })
  @IsNotEmpty()
  netValue: number;

  @ApiProperty({
    description: 'Valor original do pagamento (se aplicável)',
    example: 199.99,
  })
  @IsOptional()
  originalValue?: number;

  @ApiProperty({
    description: 'Tipo de cobrança (ex: cartão de crédito, boleto)',
    example: 'credit_card',
  })
  @IsString()
  @IsNotEmpty()
  billingType: string;

  @ApiProperty({
    description: 'Status do pagamento (ex: pendente, pago, cancelado)',
    example: 'paid',
  })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({
    description: 'URL da cobranca (se aplicável)',
    example: 'https://www.asaas.com/i/080225913252',
  })
  @IsString()
  @IsOptional()
  invoiceUrl?: string;

  @ApiProperty({
    description: 'URL do recibo da transação (se aplicável)',
    example: 'https://example.com/receipt/pay_1234567890',
  })
  @IsString()
  @IsOptional()
  transactionReceiptUrl?: string;
}
