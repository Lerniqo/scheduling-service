import {
  Body,
  Controller,
  Get,
  Post,
  Headers,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { CreateGroupSessionDto } from './dto/create-group-session.dto';
import { BookSessionDto } from './dto/book-session.dto';
import { EnrollGroupSessionDto } from './dto/enroll-group-session.dto';

@Controller('api/scheduling')
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) {}

  // Teacher endpoint: POST /api/scheduling/group-sessions
  @Post('group-sessions')
  async createGroupSession(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
    @Headers('x-user-permissions') userPermissions: string,
    @Body() dto: CreateGroupSessionDto,
  ) {
    if (!userId || !userRole) {
      throw new UnauthorizedException('Missing user authentication headers');
    }

    if (userRole !== 'teacher') {
      throw new ForbiddenException('Only teachers can create group sessions');
    }

    const permissions = userPermissions ? userPermissions.split(',') : [];
    if (!permissions.includes('create_session')) {
      throw new ForbiddenException('Insufficient permissions to create sessions');
    }

    return this.schedulingService.createGroupSession(userId, dto);
  }

  // Student endpoint: GET /api/scheduling/group-sessions
  @Get('group-sessions')
  async getGroupSessions(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
    @Headers('x-user-permissions') userPermissions: string,
  ) {
    if (!userId || !userRole) {
      throw new UnauthorizedException('Missing user authentication headers');
    }

    const allowedRoles = ['student', 'teacher'];
    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException('Invalid user role');
    }

    const permissions = userPermissions ? userPermissions.split(',') : [];
    if (!permissions.includes('view_sessions')) {
      throw new ForbiddenException('Insufficient permissions to view sessions');
    }

    return this.schedulingService.getAllGroupSessions();
  }

  // Student endpoint: POST /api/scheduling/book-session
  @Post('book-session')
  async bookSession(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
    @Headers('x-user-permissions') userPermissions: string,
    @Body() dto: BookSessionDto,
  ) {
    if (!userId || !userRole) {
      throw new UnauthorizedException('Missing user authentication headers');
    }

    if (userRole !== 'student') {
      throw new ForbiddenException('Only students can book sessions');
    }

    const permissions = userPermissions ? userPermissions.split(',') : [];
    if (!permissions.includes('book_session')) {
      throw new ForbiddenException('Insufficient permissions to book sessions');
    }

    return this.schedulingService.bookOneOnOneSession(userId, dto);
  }

  // Student endpoint: POST /api/scheduling/enroll-group-session
  @Post('enroll-group-session')
  async enrollGroupSession(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
    @Headers('x-user-permissions') userPermissions: string,
    @Body() dto: EnrollGroupSessionDto,
  ) {
    if (!userId || !userRole) {
      throw new UnauthorizedException('Missing user authentication headers');
    }

    if (userRole !== 'student') {
      throw new ForbiddenException('Only students can enroll in group sessions');
    }

    const permissions = userPermissions ? userPermissions.split(',') : [];
    if (!permissions.includes('enroll_session')) {
      throw new ForbiddenException('Insufficient permissions to enroll in sessions');
    }

    return this.schedulingService.enrollInGroupSession(userId, dto);
  }

  // Teacher/Student endpoint: GET /api/scheduling/me/sessions
  @Get('me/sessions')
  async getMySessions(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
    @Headers('x-user-permissions') userPermissions: string,
  ) {
    if (!userId || !userRole) {
      throw new UnauthorizedException('Missing user authentication headers');
    }

    const allowedRoles = ['teacher', 'student'];
    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException('Invalid user role');
    }

    const permissions = userPermissions ? userPermissions.split(',') : [];
    if (!permissions.includes('view_my_sessions')) {
      throw new ForbiddenException('Insufficient permissions to view sessions');
    }

    if (userRole === 'teacher') {
      return this.schedulingService.getTeacherSessions(userId);
    } else {
      return this.schedulingService.getStudentSessions(userId);
    }
  }
}
