import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CardPriority, CardStatus } from '../entities/card';
import { TransformCPF } from '../transformers/document-transformers';

export class UpdateCardDto {
  @ApiProperty({
    description: 'Número do card/ficha',
    example: 'A001',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  card?: string;

  @ApiProperty({
    description: 'Prioridade do card',
    enum: CardPriority,
    example: CardPriority.NORMAL,
    required: false,
  })
  @IsEnum(CardPriority)
  @IsOptional()
  priority?: CardPriority;

  @ApiProperty({
    description: 'Status do card',
    enum: CardStatus,
    example: CardStatus.WAITING,
    required: false,
  })
  @IsEnum(CardStatus)
  @IsOptional()
  status?: CardStatus;

  @ApiProperty({
    description: 'Indica se o card foi concluído',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  concluded?: boolean;

  @ApiProperty({
    description: 'Data e hora do início do atendimento',
    example: '2024-01-15T10:30:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  datehourAttend?: string;

  @ApiProperty({
    description: 'Data e hora da conclusão',
    example: '2024-01-15T11:30:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  datehourConcluded?: string;

  @ApiProperty({
    description:
      'CPF do usuário responsável (aceita formatação: XXX.XXX.XXX-XX ou XXXXXXXXXXX). Exemplo válido: 123.456.789-09',
    example: '123.456.789-09',
    examples: ['123.456.789-09', '12345678909'],
    required: false,
  })
  @IsString()
  @IsOptional()
  @TransformCPF()
  userCpf?: string;
}
