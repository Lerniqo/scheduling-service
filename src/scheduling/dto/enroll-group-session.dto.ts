import {
  IsUUID,
  IsNotEmpty,
} from 'class-validator';

export class EnrollGroupSessionDto {
  @IsUUID()
  @IsNotEmpty()
  sessionId: string;
}