import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransformCPF } from '../transformers/document-transformers';

export class CreateFirstAdminDto {
  @ApiProperty({
    description:
      'CPF do administrador (aceita formatação: XXX.XXX.XXX-XX ou XXXXXXXXXXX). Exemplo válido: 123.456.789-09',
    example: '123.456.789-09',
    examples: ['123.456.789-09', '12345678909'],
  })
  @IsString()
  @IsNotEmpty()
  @TransformCPF()
  cpf: string;

  @ApiProperty({
    description: 'Nome completo do administrador',
    example: 'João Silva',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Senha do administrador (mínimo 6 caracteres)',
    example: 'senha123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
  password: string;
}
