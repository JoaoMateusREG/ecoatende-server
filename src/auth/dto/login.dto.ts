import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransformCPF } from '../../transformers/document-transformers';

export class LoginDto {
  @ApiProperty({
    description: 'CPF do usuário (aceita formatação: XXX.XXX.XXX-XX ou XXXXXXXXXXX). Exemplo válido: 123.456.789-09',
    example: '123.456.789-09',
    examples: [
      '123.456.789-09',
      '12345678909'
    ]
  })
  @IsString()
  @IsNotEmpty()
  @TransformCPF()
  cpf: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'senha123'
  })
  @IsString()
  @IsNotEmpty()
  password: string;
} 