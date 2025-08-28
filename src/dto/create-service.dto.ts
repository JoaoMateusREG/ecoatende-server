import { IsString, IsNotEmpty, MaxLength, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransformCNPJ } from '../transformers/document-transformers';

export class CreateServiceDto {
  @ApiProperty({
    description: 'Nome do serviço',
    example: 'Atendimento ao Cliente'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Prefixo do serviço (máximo 2 caracteres)',
    example: 'A',
    maxLength: 2
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2, { message: 'Prefixo deve ter no máximo 2 caracteres' })
  prefix: string;

  @ApiProperty({
    description: 'CNPJ da organização (aceita formatação: XX.XXX.XXX/XXXX-XX ou XXXXXXXXXXXXXX). Exemplo válido: 60.301.979/0001-60',
    example: '60.301.979/0001-60',
    examples: [
      '60.301.979/0001-60',
      '60301979000160'
    ]
  })
  @IsString()
  @IsNotEmpty()
  @TransformCNPJ()
  organizationCnpj: string;

  @ApiProperty({
    description: 'Se o serviço permite criação de fichas',
    example: true,
    default: true
  })
  @IsBoolean()
  @IsOptional()
  canCreateCards?: boolean;
} 