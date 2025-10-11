import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability } from '../entities/availability.entity';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability-slots.dto';
import { ensureUUID } from '../utils/uuid.utils';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
  ) {}

  async addOrUpdateAvailability(teacherId: string, dto: UpdateAvailabilityDto): Promise<{ message: string }> {
    const teacherUUID = ensureUUID(teacherId);
    
    // Remove all existing availability for this teacher
    await this.availabilityRepository.delete({ teacher_id: teacherUUID });

    // Add new availability slots
    const availabilityEntities = dto.availabilities.map(slot => {
      const start = new Date(slot.startTime);
      const end = new Date(slot.endTime);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestException('startTime and endTime must be valid ISO dates');
      }
      if (start >= end) {
        throw new BadRequestException('startTime must be before endTime');
      }

      return this.availabilityRepository.create({
        teacher_id: teacherUUID,
        start_time: start,
        end_time: end,
        is_booked: false,
      });
    });

    await this.availabilityRepository.save(availabilityEntities);
    return { message: 'Availability updated.' };
  }

  async getAvailableSlots(teacherId: string): Promise<Availability[]> {
    const teacherUUID = ensureUUID(teacherId);
    
    return this.availabilityRepository.find({
      where: { 
        teacher_id: teacherUUID,
        is_booked: false 
      },
      order: { start_time: 'ASC' },
    });
  }

  async bookAvailabilitySlot(availabilityId: string): Promise<Availability> {
    const availability = await this.availabilityRepository.findOne({
      where: { availability_id: availabilityId }
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
      where: { availability_id: availabilityId }
    });

    if (!availability) {
      throw new NotFoundException('Availability slot not found');
    }

    return availability;
  }
}
