import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransformCPF, TransformCNPJ } from '../transformers/document-transformers';

export class CreateUserDto {
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
    description: 'Nome completo do usuário',
    example: 'João Silva'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Senha do usuário (mínimo 6 caracteres)',
    example: 'senha123',
    minLength: 6
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
  password: string;

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
} 