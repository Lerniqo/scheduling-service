import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Session,
  SessionType,
  SessionStatus,
} from '../entities/session.entity';
import { SessionAttendee } from '../entities/session-attendee.entity';
import { CreateGroupSessionDto } from './dto/create-group-session.dto';
import { BookSessionDto } from './dto/book-session.dto';
import { EnrollGroupSessionDto } from './dto/enroll-group-session.dto';
import { SessionResponseDto, PaymentResponseDto } from './dto/response.dto';
import { AvailabilityService } from '../availability/availability.service';
import { ZoomService, ZoomMeetingResponse } from '../zoom/zoom.service';
import { ensureUUID } from '../utils/uuid.utils';
import axios from 'axios';

@Injectable()
export class SchedulingService {
  private readonly logger = new Logger(SchedulingService.name);

  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(SessionAttendee)
    private readonly sessionAttendeeRepository: Repository<SessionAttendee>,
    private readonly availabilityService: AvailabilityService,
    private readonly zoomService: ZoomService,
  ) {}

  async createGroupSession(
    teacherId: string,
    dto: CreateGroupSessionDto,
  ): Promise<SessionResponseDto> {
    const teacherUUID = ensureUUID(teacherId);
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException(
        'startTime and endTime must be valid ISO dates',
      );
    }
    if (start >= end) {
      throw new BadRequestException('startTime must be before endTime');
    }

    // Create Zoom meeting for the group session
    const durationMinutes = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60),
    );

    this.logger.log(`Creating Zoom meeting for group session: ${dto.title}`);

    let zoomMeeting: ZoomMeetingResponse;
    try {
      zoomMeeting = await this.zoomService.createSessionMeeting(
        dto.title,
        'Group Session',
        start,
        durationMinutes,
      );
      this.logger.log(
        `✅ Zoom meeting created successfully: Meeting ID ${zoomMeeting.id}`,
      );
    } catch (error: unknown) {
      let message = 'An unknown error occurred';
      if (error instanceof Error) {
        message = error.message;
      }
      this.logger.error('❌ Zoom meeting creation failed:', error);
      throw new BadRequestException(
        `Failed to create Zoom meeting: ${message}`,
      );
    }

    const session = this.sessionRepository.create({
      teacher_id: teacherUUID,
      session_type: SessionType.GROUP,
      title: dto.title,
      description: dto.description,
      start_time: start,
      end_time: end,
      is_paid: dto.isPaid || false,
      price: dto.price,
      max_attendees: dto.maxAttendees || 10,
      video_conference_link: zoomMeeting.join_url,
      zoom_meeting_id: zoomMeeting.id.toString(),
      zoom_join_url: zoomMeeting.join_url,
      zoom_start_url: zoomMeeting.start_url,
      zoom_password: zoomMeeting.password,
      status: SessionStatus.SCHEDULED,
    });

    const savedSession = await this.sessionRepository.save(session);

    return {
      session_id: savedSession.session_id,
      teacher_id: savedSession.teacher_id,
      session_type: savedSession.session_type,
      title: savedSession.title,
      description: savedSession.description,
      start_time: savedSession.start_time,
      end_time: savedSession.end_time,
      status: savedSession.status,
      is_paid: savedSession.is_paid,
      price: savedSession.price,
      max_attendees: savedSession.max_attendees,
      video_conference_link: savedSession.video_conference_link,
      attendees_count: 0,
      zoom_meeting_id: savedSession.zoom_meeting_id,
      zoom_join_url: savedSession.zoom_join_url,
      zoom_start_url: savedSession.zoom_start_url,
      zoom_password: savedSession.zoom_password,
    };
  }

  async bookOneOnOneSession(
    studentId: string,
    dto: BookSessionDto,
  ): Promise<SessionResponseDto | PaymentResponseDto> {
    try {
      const studentUUID = ensureUUID(studentId);

      // Get the availability slot
      const availability = await this.availabilityService.findById(
        dto.availabilityId,
      );

      if (availability.is_booked) {
        throw new ConflictException('This time slot is already booked');
      }

      // Mark availability as booked
      await this.availabilityService.bookAvailabilitySlot(dto.availabilityId);

      // Create Zoom meeting for one-on-one session
      const durationMinutes = Math.ceil(
        (availability.end_time.getTime() - availability.start_time.getTime()) /
          (1000 * 60),
      );

      this.logger.log(
        `Creating Zoom meeting for session: ${
          availability.session_description || 'One-on-One Session'
        }`,
      );

      let zoomMeeting: ZoomMeetingResponse;
      try {
        zoomMeeting = await this.zoomService.createSessionMeeting(
          availability.session_description || 'One-on-One Session',
          'Individual Tutoring',
          availability.start_time,
          durationMinutes,
        );
        this.logger.log(
          `✅ Zoom meeting created successfully: Meeting ID ${zoomMeeting.id}`,
        );
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          this.logger.error('❌ Zoom meeting creation failed:', {
            message: error.message,
            response: error.response?.data as unknown,
            status: error.response?.status,
          });
          throw new BadRequestException(
            `Failed to create Zoom meeting: ${error.message}`,
          );
        }

        let message = 'An unknown error occurred';
        if (error instanceof Error) {
          message = error.message;
        }

        this.logger.error('❌ Zoom meeting creation failed:', error);
        throw new BadRequestException(
          `Failed to create Zoom meeting: ${message}`,
        );
      }

      // Create session with pricing from availability
      const session = new Session();
      session.teacher_id = availability.teacher_id;
      session.session_type = SessionType.ONE_ON_ONE;
      session.title = availability.session_description || 'One-on-One Session';
      session.description = availability.session_description;
      session.start_time = availability.start_time;
      session.end_time = availability.end_time;
      session.is_paid = availability.is_paid || false;
      session.price = availability.price_per_session;
      session.video_conference_link = zoomMeeting.join_url;
      session.zoom_meeting_id = zoomMeeting.id.toString();
      session.zoom_join_url = zoomMeeting.join_url;
      session.zoom_start_url = zoomMeeting.start_url;
      session.zoom_password = zoomMeeting.password;
      session.status = SessionStatus.SCHEDULED;
      session.max_attendees = 1;

      const savedSession = await this.sessionRepository.save(session);

      // Create session attendee record
      const attendee = this.sessionAttendeeRepository.create({
        session_id: savedSession.session_id,
        student_id: studentUUID,
        booking_time: new Date(),
      });

      await this.sessionAttendeeRepository.save(attendee);

      // Only return join URL to student
      return {
        session_id: savedSession.session_id,
        teacher_id: savedSession.teacher_id,
        session_type: savedSession.session_type,
        title: savedSession.title,
        description: savedSession.description,
        start_time: savedSession.start_time,
        end_time: savedSession.end_time,
        status: savedSession.status,
        is_paid: savedSession.is_paid,
        price: savedSession.price,
        max_attendees: savedSession.max_attendees,
        video_conference_link: savedSession.zoom_join_url,
        attendees_count: 1,
        zoom_meeting_id: savedSession.zoom_meeting_id,
        zoom_join_url: savedSession.zoom_join_url,
      };
    } catch (error) {
      console.error('Error booking session:', error);
      throw error;
    }
  }

  async enrollInGroupSession(
    studentId: string,
    dto: EnrollGroupSessionDto,
  ): Promise<SessionResponseDto | PaymentResponseDto> {
    const studentUUID = ensureUUID(studentId);

    const session = await this.sessionRepository.findOne({
      where: { session_id: dto.sessionId },
      relations: ['attendees'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.session_type !== SessionType.GROUP) {
      throw new BadRequestException('This endpoint is only for group sessions');
    }

    // Check if session is full
    const currentAttendees = await this.sessionAttendeeRepository.count({
      where: { session_id: dto.sessionId },
    });

    if (session.max_attendees && currentAttendees >= session.max_attendees) {
      throw new ConflictException('Session is full');
    }

    // Check if student is already enrolled
    const existingEnrollment = await this.sessionAttendeeRepository.findOne({
      where: {
        session_id: dto.sessionId,
        student_id: studentUUID,
      },
    });

    if (existingEnrollment) {
      throw new ConflictException(
        'Student is already enrolled in this session',
      );
    }

    // If session is paid, return payment session ID (mock implementation)
    if (session.is_paid) {
      const checkoutSessionId = `checkout_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      return { checkoutSessionId };
    }

    // Create enrollment for free sessions
    const attendee = this.sessionAttendeeRepository.create({
      session_id: dto.sessionId,
      student_id: studentUUID,
      booking_time: new Date(),
    });

    await this.sessionAttendeeRepository.save(attendee);

    const updatedAttendeesCount = await this.sessionAttendeeRepository.count({
      where: { session_id: dto.sessionId },
    });

    // Only return join URL to student
    return {
      session_id: session.session_id,
      teacher_id: session.teacher_id,
      session_type: session.session_type,
      title: session.title,
      description: session.description,
      start_time: session.start_time,
      end_time: session.end_time,
      status: session.status,
      is_paid: session.is_paid,
      price: session.price,
      max_attendees: session.max_attendees,
      video_conference_link: session.zoom_join_url,
      attendees_count: updatedAttendeesCount,
      zoom_meeting_id: session.zoom_meeting_id,
      zoom_join_url: session.zoom_join_url,
    };
  }

  async getTeacherSessions(teacherId: string): Promise<SessionResponseDto[]> {
    const teacherUUID = ensureUUID(teacherId);

    const sessions = await this.sessionRepository.find({
      where: { teacher_id: teacherUUID },
      order: { start_time: 'DESC' },
    });

    const result: SessionResponseDto[] = [];
    for (const session of sessions) {
      const attendeesCount = await this.sessionAttendeeRepository.count({
        where: { session_id: session.session_id },
      });

      result.push({
        session_id: session.session_id,
        teacher_id: session.teacher_id,
        session_type: session.session_type,
        title: session.title,
        description: session.description,
        start_time: session.start_time,
        end_time: session.end_time,
        status: session.status,
        is_paid: session.is_paid,
        price: session.price,
        max_attendees: session.max_attendees,
        video_conference_link: session.video_conference_link,
        attendees_count: attendeesCount,
        zoom_meeting_id: session.zoom_meeting_id,
        zoom_join_url: session.zoom_join_url,
        zoom_start_url: session.zoom_start_url,
        zoom_password: session.zoom_password,
      });
    }

    return result;
  }

  async getStudentSessions(studentId: string): Promise<SessionResponseDto[]> {
    const studentUUID = ensureUUID(studentId);

    const attendeeRecords = await this.sessionAttendeeRepository.find({
      where: { student_id: studentUUID },
      relations: ['session'],
    });

    const result: SessionResponseDto[] = [];
    for (const attendee of attendeeRecords) {
      const session = await this.sessionRepository.findOne({
        where: { session_id: attendee.session_id },
      });

      if (session) {
        const attendeesCount = await this.sessionAttendeeRepository.count({
          where: { session_id: session.session_id },
        });

        result.push({
          session_id: session.session_id,
          teacher_id: session.teacher_id,
          session_type: session.session_type,
          title: session.title,
          description: session.description,
          start_time: session.start_time,
          end_time: session.end_time,
          status: session.status,
          is_paid: session.is_paid,
          price: session.price,
          max_attendees: session.max_attendees,
          video_conference_link: session.zoom_join_url,
          attendees_count: attendeesCount,
          zoom_meeting_id: session.zoom_meeting_id,
          zoom_join_url: session.zoom_join_url,
          zoom_start_url: session.zoom_start_url,
          zoom_password: session.zoom_password,
        });
      }
    }

    return result.sort(
      (a, b) => b.start_time.getTime() - a.start_time.getTime(),
    );
  }

  async getAllGroupSessions(): Promise<SessionResponseDto[]> {
    const sessions = await this.sessionRepository.find({
      where: {
        session_type: SessionType.GROUP,
        status: SessionStatus.SCHEDULED,
      },
      order: { start_time: 'ASC' },
    });

    const result: SessionResponseDto[] = [];
    for (const session of sessions) {
      const attendeesCount = await this.sessionAttendeeRepository.count({
        where: { session_id: session.session_id },
      });

      // Only include sessions that aren't full
      if (session.max_attendees && attendeesCount < session.max_attendees) {
        result.push({
          session_id: session.session_id,
          teacher_id: session.teacher_id,
          session_type: session.session_type,
          title: session.title,
          description: session.description,
          start_time: session.start_time,
          end_time: session.end_time,
          status: session.status,
          is_paid: session.is_paid,
          price: session.price,
          max_attendees: session.max_attendees,
          video_conference_link: session.zoom_join_url,
          attendees_count: attendeesCount,
          zoom_meeting_id: session.zoom_meeting_id,
          zoom_join_url: session.zoom_join_url,
        });
      }
    }

    return result;
  }
}
