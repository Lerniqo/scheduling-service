import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { CreateGroupSessionDto } from './dto/create-group-session.dto';
import { BookSessionDto } from './dto/book-session.dto';
import { EnrollGroupSessionDto } from './dto/enroll-group-session.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, UserRole } from '../auth/roles.decorator';
import type { AuthenticatedRequest } from '../auth/auth.interface';

@Controller('api/scheduling')
@UseGuards(RolesGuard)
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) {}

  // Teacher endpoint: POST /api/scheduling/group-sessions
  @Post('group-sessions')
  @Roles(UserRole.TEACHER)
  async createGroupSession(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateGroupSessionDto,
  ) {
    return this.schedulingService.createGroupSession(req.user.id, dto);
  }

  // Student and Teacher endpoint: GET /api/scheduling/group-sessions
  @Get('group-sessions')
  @Roles(UserRole.STUDENT, UserRole.TEACHER)
  async getGroupSessions() {
    return this.schedulingService.getAllGroupSessions();
  }

  // Student endpoint: POST /api/scheduling/book-session
  @Post('book-session')
  @Roles(UserRole.STUDENT)
  async bookSession(
    @Req() req: AuthenticatedRequest,
    @Body() dto: BookSessionDto,
  ) {
    return this.schedulingService.bookOneOnOneSession(req.user.id, dto);
  }

  // Student endpoint: POST /api/scheduling/enroll-group-session
  @Post('enroll-group-session')
  @Roles(UserRole.STUDENT)
  async enrollGroupSession(
    @Req() req: AuthenticatedRequest,
    @Body() dto: EnrollGroupSessionDto,
  ) {
    return this.schedulingService.enrollInGroupSession(req.user.id, dto);
  }

  // Teacher/Student endpoint: GET /api/scheduling/me/sessions
  @Get('me/sessions')
  @Roles(UserRole.TEACHER, UserRole.STUDENT)
  async getMySessions(
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user.role === UserRole.TEACHER) {
      return this.schedulingService.getTeacherSessions(req.user.id);
    } else {
      return this.schedulingService.getStudentSessions(req.user.id);
    }
  }
}
