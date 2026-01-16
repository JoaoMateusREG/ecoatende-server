import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsDate,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransformCNPJ } from '../transformers/document-transformers';

export class CreateOrganizationDto {
  @ApiProperty({
    description:
      'CNPJ da organização (aceita formatação: XX.XXX.XXX/XXXX-XX ou XXXXXXXXXXXXXX). Exemplo válido: 60.301.979/0001-60',
    example: '60.301.979/0001-60',
    examples: ['60.301.979/0001-60', '60301979000160'],
  })
  @IsString()
  @IsNotEmpty()
  @TransformCNPJ()
  cnpj: string;

  @ApiProperty({
    description: 'Nome da organização',
    example: 'Empresa XYZ Ltda',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Email da organização',
    example: 'empresaltds@exemple.com',
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Contato da organização',
    example: '88 99999-9999',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'ID do cliente no sistema do gateway de pagamento',
    example: '@fdsa$%fdsgfhgfsfadsf61265',
  })
  @IsOptional()
  customerId: string;

  @ApiProperty({
    description: 'Se a organização está ativa',
    example: true,
  })
  @IsBoolean()
  active: boolean;

  @ApiProperty({
    description: 'Data de criação da organização',
    example: '2024-06-01T12:00:00Z',
  })
  @IsDate()
  @IsOptional()
  creationDate: Date;

  @ApiProperty({
    description: 'Logo da organização',
    example: 'https://example.com/logo.png',
  })
  @IsString()
  @IsOptional()
  logo?: string;
}
