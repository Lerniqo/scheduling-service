export class SessionResponseDto {
  session_id: string;
  teacher_id: string;
  session_type: string;
  title?: string | null;
  description?: string | null;
  start_time: Date;
  end_time: Date;
  status: string;
  is_paid: boolean;
  price?: number | null;
  max_attendees?: number | null;
  video_conference_link?: string | null;
  attendees_count?: number;
  // Zoom Integration Fields
  zoom_meeting_id?: string | null;
  zoom_join_url?: string | null;
  zoom_start_url?: string | null;
  zoom_password?: string | null;
}

export class PaymentResponseDto {
  checkoutSessionId: string;
}

export class SuccessResponseDto {
  message: string;
}
