import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { UpdateAvailabilitySlotsDto } from './dto/update-availability-slots.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, UserRole } from '../auth/roles.decorator';
import type { AuthenticatedRequest } from '../auth/auth.interface';

@Controller('scheduling')
@UseGuards(RolesGuard)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  // Teacher endpoint: POST /api/scheduling/availability
  @Post('availability')
  @Roles(UserRole.TEACHER)
  async updateAvailability(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateAvailabilitySlotsDto,
  ) {
    return this.availabilityService.addOrUpdateAvailability(req.user.id, dto);
  }

  // Student and Teacher endpoint: GET /api/scheduling/teachers/{teacherId}/availability
  @Get('teachers/:teacherId/availability')
  @Roles(UserRole.STUDENT, UserRole.TEACHER)
  async getTeacherAvailability(@Param('teacherId') teacherId: string) {
    return this.availabilityService.getAvailableSlots(teacherId);
  }
}
