import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Availability } from '../entities/availability.entity';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private readonly repo: Repository<Availability>,
  ) {}

  async create(dto: CreateAvailabilityDto): Promise<Availability> {
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('startTime and endTime must be valid ISO dates');
    }
    if (start >= end) {
      throw new BadRequestException('startTime must be before endTime');
    }

    const entity = this.repo.create({
      providerId: dto.providerId,
      providerName: dto.providerName ?? null,
      startTime: start,
      endTime: end,
      status: dto.status,
      maxBookings: dto.maxBookings,
      location: dto.location ?? null,
      description: dto.description ?? null,
      subject: dto.subject ?? null,
      price: dto.price as any, // TypeORM will handle numeric precision
    } as DeepPartial<Availability>);
    return this.repo.save(entity);
  }

  async findByTeacherId(teacherId: string): Promise<Availability[]> {
    return this.repo.find({
      where: { providerId: teacherId },
      order: { startTime: 'ASC' },
    });
  }

  async update(id: string, dto: UpdateAvailabilityDto): Promise<Availability> {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Availability not found');
    }

    // If times are provided, validate ordering
    const start = dto.startTime ? new Date(dto.startTime) : existing.startTime;
    const end = dto.endTime ? new Date(dto.endTime) : existing.endTime;
    if (start && end && start >= end) {
      throw new BadRequestException('startTime must be before endTime');
    }

    const preloaded = await this.repo.preload({
      id,
      providerId: dto.providerId,
      providerName: dto.providerName,
      startTime: dto.startTime ? new Date(dto.startTime) : undefined,
      endTime: dto.endTime ? new Date(dto.endTime) : undefined,
      status: dto.status,
      maxBookings: dto.maxBookings,
      location: dto.location,
      description: dto.description,
      subject: dto.subject,
      price: dto.price as any,
    });

    if (!preloaded) {
      throw new NotFoundException('Availability not found');
    }
    return this.repo.save(preloaded);
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    const res = await this.repo.delete(id);
    return { deleted: !!res.affected && res.affected > 0 };
  }
}
