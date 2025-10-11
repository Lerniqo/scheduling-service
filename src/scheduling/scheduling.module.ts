import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulingController } from './scheduling.controller';
import { SchedulingService } from './scheduling.service';
import { Session, SessionAttendee, Availability } from '../entities';
import { AvailabilityModule } from '../availability/availability.module';
import { ZoomModule } from '../zoom/zoom.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session, SessionAttendee, Availability]),
    AvailabilityModule,
    ZoomModule,
  ],
  controllers: [SchedulingController],
  providers: [SchedulingService],
  exports: [SchedulingService],
})
export class SchedulingModule {}
