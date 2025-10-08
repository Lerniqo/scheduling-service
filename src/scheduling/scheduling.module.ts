import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulingController } from './scheduling.controller';
import { SchedulingService } from './scheduling.service';
import { Availability, Booking, GroupSession } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Availability, Booking, GroupSession])],
  controllers: [SchedulingController],
  providers: [SchedulingService],
  exports: [SchedulingService],
})
export class SchedulingModule {}
