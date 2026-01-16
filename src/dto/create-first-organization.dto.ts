import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransformCNPJ } from '../transformers/document-transformers';

export class CreateFirstOrganizationDto {
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
}
