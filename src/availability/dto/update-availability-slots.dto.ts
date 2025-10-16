import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AvailabilitySlotDto {
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean = false;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  sessionDescription?: string;
}

export class UpdateAvailabilitySlotsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilitySlotDto)
  availabilities: AvailabilitySlotDto[];
}
