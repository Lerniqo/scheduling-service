export class SessionResponseDto {
  session_id: string;
  teacher_id: string;
  session_type: string;
  title?: string;
  description?: string;
  start_time: Date;
  end_time: Date;
  status: string;
  is_paid: boolean;
  price?: number;
  max_attendees?: number;
  video_conference_link?: string;
  attendees_count?: number;
}

export class PaymentResponseDto {
  checkoutSessionId: string;
}

export class SuccessResponseDto {
  message: string;
}