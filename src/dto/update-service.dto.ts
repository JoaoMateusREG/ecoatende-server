import { IsString, IsOptional, IsNotEmpty, MaxLength, IsArray, IsString as IsStringArray, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateServiceDto {
  @ApiProperty({
    description: 'Nome do serviço',
    example: 'Atendimento ao Cliente',
    required: false
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({
    description: 'Prefixo do serviço (máximo 2 caracteres)',
    example: 'A',
    maxLength: 2,
    required: false
  })
  @IsString()
  @IsOptional()
  @MaxLength(2, { message: 'Prefixo deve ter no máximo 2 caracteres' })
  prefix?: string;

  @ApiProperty({
    description: 'CPFs dos usuários que devem ser associados ao serviço',
    example: ['123.456.789-01', '987.654.321-00'],
    required: false,
    type: [String]
  })
  @IsArray()
  @IsOptional()
  @IsStringArray({ each: true })
  userCpfs?: string[];

  @ApiProperty({
    description: 'Se o serviço pode criar fichas',
    example: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  canCreateCards?: boolean;
} 