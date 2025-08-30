import { IsString, IsOptional, IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrganizationDto {
  @ApiProperty({
    description: 'Nome da organização',
    example: 'Empresa XYZ Ltda',
    required: false
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({
    description: 'Se a organização está ativa',
    example: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({
    description: 'Logo da organização',
    example: 'https://example.com/logo.png',
    required: false
  })
  @IsString()
  @IsOptional()
  logo?: string;
} 