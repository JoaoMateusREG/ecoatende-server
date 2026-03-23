import { IsString, IsOptional, IsNotEmpty, IsBoolean, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrganizationDto {
  @ApiProperty({
    description: 'Nome da organização',
    example: 'Empresa XYZ Ltda',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;

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
    description: 'ID do cliente no sistema de pagamentos',
    example: '@$2dfsgfsvsbnsghfsdhsh6465dfsh6s15',
    required: false,
  })
  @IsOptional()
  customerId?: string;

  @ApiProperty({
    description: 'Se a organização está ativa',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({
    description: 'Logo da organização',
    example: 'https://example.com/logo.png',
    required: false,
  })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiProperty({
    description: 'Dias de carência para o bloqueio por falta de pagamento',
    example: 31,
    required: false,
  })
  @IsInt()
  @IsOptional()
  gracePeriodDays?: number;
}
