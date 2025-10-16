import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability } from '../entities/availability.entity';
import { UpdateAvailabilitySlotsDto } from './dto/update-availability-slots.dto';
import { ensureUUID } from '../utils/uuid.utils';

@Injectable()
export class AvailabilityService {
  private readonly logger = new Logger(AvailabilityService.name);

  constructor(
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
  ) {}

  /**
   * Ensure date is properly handled in UTC
   */
  private ensureUTCDate(date: Date): Date {
    const utcDate = new Date(date.toISOString());
    this.logger.debug(
      `Date conversion: ${date.toString()} → ${utcDate.toISOString()}`,
    );
    return utcDate;
  }

  async addOrUpdateAvailability(
    teacherId: string,
    dto: UpdateAvailabilitySlotsDto,
  ): Promise<{ message: string }> {
    const teacherUUID = ensureUUID(teacherId);

    // Remove all existing availability for this teacher
    await this.availabilityRepository.delete({ teacher_id: teacherUUID });

    // Add new availability slots
    const availabilityEntities = dto.availabilities.map((slot) => {
      this.logger.debug(`Received availability slot data:
        - Raw startTime: ${slot.startTime}
        - Raw endTime: ${slot.endTime}`);

      // Parse the input times
      let start = new Date(slot.startTime);
      let end = new Date(slot.endTime);

      // If the time doesn't have timezone info, treat it as Sri Lanka time
      if (
        !slot.startTime.includes('Z') &&
        !slot.startTime.includes('+') &&
        !slot.startTime.includes('-')
      ) {
        // Input is like "2025-10-11T16:00:00" - treat as Sri Lanka time
        const sriLankaStart = new Date(slot.startTime + '+05:30');
        const sriLankaEnd = new Date(slot.endTime + '+05:30');
        start = sriLankaStart;
        end = sriLankaEnd;
        this.logger.debug(`Converted to Sri Lanka timezone:
          - Start: ${slot.startTime} → ${start.toISOString()} (${start.toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })})
          - End: ${slot.endTime} → ${end.toISOString()} (${end.toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })})`);
      }

      this.logger.debug(`Parsed dates:
        - Start Date object: ${start.toString()}
        - Start ISO: ${start.toISOString()}
        - End Date object: ${end.toString()}
        - End ISO: ${end.toISOString()}`);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestException(
          'startTime and endTime must be valid ISO dates',
        );
      }
      if (start >= end) {
        throw new BadRequestException('startTime must be before endTime');
      }

      // Convert input times to UTC for proper comparison and database storage
      const utcStart = this.ensureUTCDate(start);
      const utcEnd = this.ensureUTCDate(end);

      // Get current time in Sri Lanka timezone for proper comparison
      const nowSriLanka = new Date();
      const nowUtc = new Date(nowSriLanka.toISOString());

      // Add 5 minutes buffer to prevent edge cases with network delays
      const bufferMinutes = 5;
      const nowWithBuffer = new Date(
        nowUtc.getTime() + bufferMinutes * 60 * 1000,
      );

      this.logger.debug(`Time validation (Sri Lanka context):
        - Input start time: ${start.toISOString()}
        - UTC start time: ${utcStart.toISOString()}
        - Current UTC time: ${nowUtc.toISOString()}
        - UTC time with buffer: ${nowWithBuffer.toISOString()}
        - Is past (with buffer): ${utcStart.getTime() <= nowWithBuffer.getTime()}`);

      if (utcStart.getTime() <= nowWithBuffer.getTime()) {
        // Convert times to Sri Lanka timezone for user-friendly error message
        const sriLankaStart = start.toLocaleString('en-LK', {
          timeZone: 'Asia/Colombo',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });

        const sriLankaNow = nowSriLanka.toLocaleString('en-LK', {
          timeZone: 'Asia/Colombo',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });

        throw new BadRequestException(
          `Cannot create availability in the past. ` +
            `Start time ${sriLankaStart} must be at least ${bufferMinutes} minutes after current time ${sriLankaNow} (Sri Lanka time).`,
        );
      }

      const availability = new Availability();
      availability.teacher_id = teacherUUID;
      availability.start_time = utcStart;
      availability.end_time = utcEnd;
      availability.is_booked = false;
      availability.is_paid = slot.isPaid || false;
      availability.price_per_session = slot.price || null;
      availability.session_description = slot.sessionDescription || null;

      return availability;
    });

    await this.availabilityRepository.save(availabilityEntities);
    return { message: 'Availability updated.' };
  }

  async getAvailableSlots(teacherId: string): Promise<Availability[]> {
    const teacherUUID = ensureUUID(teacherId);

    return this.availabilityRepository.find({
      where: {
        teacher_id: teacherUUID,
        is_booked: false,
      },
      order: { start_time: 'ASC' },
    });
  }

  async bookAvailabilitySlot(availabilityId: string): Promise<Availability> {
    const availability = await this.availabilityRepository.findOne({
      where: { availability_id: availabilityId },
    });

    if (!availability) {
      throw new NotFoundException('Availability slot not found');
    }

    if (availability.is_booked) {
      throw new BadRequestException('Availability slot is already booked');
    }

    availability.is_booked = true;
    return this.availabilityRepository.save(availability);
  }

  async findById(availabilityId: string): Promise<Availability> {
    const availability = await this.availabilityRepository.findOne({
      where: { availability_id: availabilityId },
    });

    if (!availability) {
      throw new NotFoundException('Availability slot not found');
    }

    return availability;
  }
}
