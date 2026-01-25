import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CardPriority } from '../entities/card';
import {
  TransformCPF,
  TransformCNPJ,
} from '../transformers/document-transformers';

export class CreateCardDto {
  @ApiProperty({
    description: 'Prioridade do card',
    enum: CardPriority,
    example: CardPriority.NORMAL,
  })
  @IsEnum(CardPriority)
  priority: CardPriority;

  @ApiProperty({
    description:
      'CNPJ da organização (aceita formatação: XX.XXX.XXX/XXXX-XX ou XXXXXXXXXXXXXX). Exemplo válido: 60.301.979/0001-60',
    example: '60.301.979/0001-60',
    examples: ['60.301.979/0001-60', '60301979000160'],
  })
  @IsString()
  @IsNotEmpty()
  @TransformCNPJ()
  organizationCnpj: string;

  @ApiProperty({
    description: 'ID do serviço',
    example: '1',
  })
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({
    description:
      'CPF do usuário responsável (opcional, aceita formatação: XXX.XXX.XXX-XX ou XXXXXXXXXXX). Exemplo válido: 123.456.789-09',
    example: '123.456.789-09',
    examples: ['123.456.789-09', '12345678909'],
    required: false,
  })
  @IsString()
  @IsOptional()
  @TransformCPF()
  userCpf?: string;
}
