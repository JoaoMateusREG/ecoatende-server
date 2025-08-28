import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
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
} 