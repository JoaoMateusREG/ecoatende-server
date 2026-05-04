import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsBoolean,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TransformCNPJ } from '../transformers/document-transformers';
import { ServiceType } from '../entities/service';

export class CreateServiceDto {
  @ApiProperty({
    description: 'Nome do serviço',
    example: 'Atendimento ao Cliente',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Prefixo do serviço (máximo 1 caractere)',
    example: 'A',
    maxLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1, { message: 'Prefixo deve ter no máximo 1 caractere' })
  prefix: string;

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
    description: 'Se o serviço permite criação de fichas',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  canCreateCards?: boolean;

  @ApiProperty({
    description:
      'Tipo do serviço (SERVICE para serviço principal, SUB_SERVICE para subserviço)',
    example: 'SERVICE',
    default: 'SERVICE',
  })
  @IsString()
  type: ServiceType;

  @ApiProperty({
    description: 'Limite de fichas diárias para o serviço (0 = sem limite)',
    example: 150,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  cardLimit?: number;

  @ApiProperty({
    description: 'Categoria do serviço',
    example: 'Atendimento ao Cliente',
    required: false,
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({
    description: 'Cor do serviço',
    example: '#000000',
  })
  @IsString()
  @IsOptional()
  color?: string;
}
