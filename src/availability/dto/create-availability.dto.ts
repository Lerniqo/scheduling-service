import {
  IsDateString,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAvailabilityDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  teacher_id: string;

  @IsDateString()
  start_time: string;

  @IsDateString()
  end_time: string;
}
