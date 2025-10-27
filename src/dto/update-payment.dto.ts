import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePaymentDto {
  @ApiProperty({
    description: 'Data de criação do pagamento',
    example: '2024-06-01T12:00:00Z',
  })
  @IsString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({
    description: 'Valor do pagamento',
    example: 199.99,
  })
  @IsOptional()
  value?: number;

  @ApiProperty({
    description: 'Status do pagamento',
    example: 'paid',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({
    description: 'Tipo de cobrança do pagamento',
    example: 'credit_card',
  })
  @IsString()
  @IsOptional()
  billingType?: string;

  @ApiProperty({
    description: 'URL da cobranca (se aplicável)',
    example: 'https://www.asaas.com/i/080225913252',
  })
  @IsString()
  @IsOptional()
  invoiceUrl?: string;

  @ApiProperty({
    description: 'URL do recibo da transação',
    example: 'https://example.com/receipt.pdf',
  })
  @IsString()
  @IsOptional()
  transactionReceiptUrl?: string;
}
