import { IsUUID, IsNotEmpty } from 'class-validator';

export class BookSessionDto {
  @IsUUID()
  @IsNotEmpty()
  availabilityId: string;
}
