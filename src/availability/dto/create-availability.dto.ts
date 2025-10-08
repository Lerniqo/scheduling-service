import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { AvailabilityStatus } from '../../entities/availability.entity';

export class CreateAvailabilityDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  providerId: string; // teacherId

  @IsOptional()
  @IsString()
  @MaxLength(255)
  providerName?: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsEnum(AvailabilityStatus)
  status?: AvailabilityStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxBookings?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  subject?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;
}
