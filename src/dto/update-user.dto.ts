import { IsString, IsOptional, IsNotEmpty, MinLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransformCNPJ } from '../transformers/document-transformers';
import { UserRole } from '@prisma/client';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
    required: false
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({
    description: 'Nova senha do usuário (mínimo 6 caracteres)',
    example: 'novaSenha123',
    minLength: 6,
    required: false
  })
  @IsString()
  @IsOptional()
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
  password?: string;

  @ApiProperty({
    description: 'CNPJ da organização (aceita formatação: XX.XXX.XXX/XXXX-XX ou XXXXXXXXXXXXXX). Exemplo válido: 60.301.979/0001-60',
    example: '60.301.979/0001-60',
    examples: [
      '60.301.979/0001-60',
      '60301979000160'
    ],
    required: false
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @TransformCNPJ()
  organizationCnpj?: string;

  @ApiProperty({
    description: 'Role do usuário',
    example: UserRole.USER,
    required: false
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({
    description: 'Status ativo do usuário',
    example: true,
    required: false
  })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Foto do usuário',
    example: 'https://example.com/picture.png',
    required: false
  })
  @IsString()
  @IsOptional()
  picture?: string;
} 