import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AverageWaitTimeReportDto {
  @ApiProperty({
    description: 'Data inicial do período (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: 'Data final do período (YYYY-MM-DD)',
    example: '2025-01-31',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({
    description: 'ID do serviço (opcional)',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  serviceId?: number;
}

export class AverageServiceTimeReportDto {
  @ApiProperty({
    description: 'Data inicial do período (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: 'Data final do período (YYYY-MM-DD)',
    example: '2025-01-31',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({
    description: 'ID do serviço (opcional)',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  serviceId?: number;
}

export class CompletedCardsReportDto {
  @ApiProperty({
    description: 'Data inicial do período (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: 'Data final do período (YYYY-MM-DD)',
    example: '2025-01-31',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({
    description: 'ID do serviço (opcional)',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  serviceId?: number;
}
