import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Headers,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { UpdateAvailabilityDto } from './dto/update-availability-slots.dto';

@Controller('api/scheduling')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  // Teacher endpoint: POST /api/scheduling/availability
  @Post('availability')
  async updateAvailability(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
    @Headers('x-user-permissions') userPermissions: string,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    if (!userId || !userRole) {
      throw new UnauthorizedException('Missing user authentication headers');
    }

    // Only teachers can update their availability
    if (userRole !== 'teacher') {
      throw new ForbiddenException('Only teachers can update availability');
    }

    // Check if user has the required permission
    const permissions = userPermissions ? userPermissions.split(',') : [];
    if (!permissions.includes('manage_availability')) {
      throw new ForbiddenException('Insufficient permissions to manage availability');
    }

    return this.availabilityService.addOrUpdateAvailability(userId, dto);
  }

  // Student endpoint: GET /api/scheduling/teachers/{teacherId}/availability
  @Get('teachers/:teacherId/availability')
  async getTeacherAvailability(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
    @Headers('x-user-permissions') userPermissions: string,
    @Param('teacherId') teacherId: string,
  ) {
    if (!userId || !userRole) {
      throw new UnauthorizedException('Missing user authentication headers');
    }

    // Both students and teachers can view availability
    const allowedRoles = ['student', 'teacher'];
    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException('Invalid user role');
    }

    const permissions = userPermissions ? userPermissions.split(',') : [];
    if (!permissions.includes('view_availability')) {
      throw new ForbiddenException('Insufficient permissions to view availability');
    }

    return this.availabilityService.getAvailableSlots(teacherId);
  }
}
