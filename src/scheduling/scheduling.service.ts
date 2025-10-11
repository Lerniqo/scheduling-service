import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session, SessionType, SessionStatus } from '../entities/session.entity';
import { SessionAttendee } from '../entities/session-attendee.entity';
import { Availability } from '../entities/availability.entity';
import { CreateGroupSessionDto } from './dto/create-group-session.dto';
import { BookSessionDto } from './dto/book-session.dto';
import { EnrollGroupSessionDto } from './dto/enroll-group-session.dto';
import { SessionResponseDto, PaymentResponseDto } from './dto/response.dto';
import { AvailabilityService } from '../availability/availability.service';
import { ensureUUID } from '../utils/uuid.utils';

@Injectable()
export class SchedulingService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(SessionAttendee)
    private readonly sessionAttendeeRepository: Repository<SessionAttendee>,
    private readonly availabilityService: AvailabilityService,
  ) {}

  async createGroupSession(teacherId: string, dto: CreateGroupSessionDto): Promise<SessionResponseDto> {
    const teacherUUID = ensureUUID(teacherId);
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('startTime and endTime must be valid ISO dates');
    }
    if (start >= end) {
      throw new BadRequestException('startTime must be before endTime');
    }

    // Generate video conference link (using Jitsi Meet)
    const roomName = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const videoConferenceLink = `https://meet.jit.si/${roomName}`;

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
      video_conference_link: videoConferenceLink,
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
    };
  }

  async bookOneOnOneSession(studentId: string, dto: BookSessionDto): Promise<SessionResponseDto | PaymentResponseDto> {
    try {
      const studentUUID = ensureUUID(studentId);
      
      // Get the availability slot
      const availability = await this.availabilityService.findById(dto.availabilityId);
      
      if (availability.is_booked) {
        throw new ConflictException('This time slot is already booked');
      }

      // Mark availability as booked
      await this.availabilityService.bookAvailabilitySlot(dto.availabilityId);

      // Generate video conference link
      const roomName = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const videoConferenceLink = `https://meet.jit.si/${roomName}`;

      // Create session
      const session = this.sessionRepository.create({
        teacher_id: availability.teacher_id,
        session_type: SessionType.ONE_ON_ONE,
        title: 'One-on-One Session',
        start_time: availability.start_time,
        end_time: availability.end_time,
        is_paid: false, // Assuming one-on-one sessions are free unless specified
        video_conference_link: videoConferenceLink,
        status: SessionStatus.SCHEDULED,
        max_attendees: 1,
      });

      const savedSession = await this.sessionRepository.save(session);

      // Create session attendee record
      const attendee = this.sessionAttendeeRepository.create({
        session_id: savedSession.session_id,
        student_id: studentUUID,
        booking_time: new Date(),
      });

      await this.sessionAttendeeRepository.save(attendee);

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
        attendees_count: 1,
      };
    } catch (error) {
      console.error('Error booking session:', error);
      throw error;
    }
  }

  async enrollInGroupSession(studentId: string, dto: EnrollGroupSessionDto): Promise<SessionResponseDto | PaymentResponseDto> {
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
      where: { session_id: dto.sessionId }
    });

    if (currentAttendees >= session.max_attendees) {
      throw new ConflictException('Session is full');
    }

    // Check if student is already enrolled
    const existingEnrollment = await this.sessionAttendeeRepository.findOne({
      where: { 
        session_id: dto.sessionId,
        student_id: studentUUID 
      }
    });

    if (existingEnrollment) {
      throw new ConflictException('Student is already enrolled in this session');
    }

    // If session is paid, return payment session ID (mock implementation)
    if (session.is_paid) {
      const checkoutSessionId = `checkout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
      where: { session_id: dto.sessionId }
    });

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
      video_conference_link: session.video_conference_link,
      attendees_count: updatedAttendeesCount,
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
        where: { session_id: session.session_id }
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
        where: { session_id: attendee.session_id }
      });

      if (session) {
        const attendeesCount = await this.sessionAttendeeRepository.count({
          where: { session_id: session.session_id }
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
        });
      }
    }

    return result.sort((a, b) => b.start_time.getTime() - a.start_time.getTime());
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
        where: { session_id: session.session_id }
      });

      // Only include sessions that aren't full
      if (attendeesCount < session.max_attendees) {
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
        });
      }
    }

    return result;
  }
}
