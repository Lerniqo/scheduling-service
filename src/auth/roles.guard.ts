import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, UserRole } from './roles.decorator';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // No role requirement
    }

    const request: Request = context.switchToHttp().getRequest();
    const userId = request.headers['x-user-id'];
    const userRole = request.headers['x-user-role'];

    // Check if user authentication headers are present
    if (!userId || !userRole) {
      throw new UnauthorizedException(
        'Missing user authentication headers (x-user-id, x-user-role)',
      );
    }

    if (Array.isArray(userRole)) {
      throw new UnauthorizedException('user role cannot be an array');
    }

    // Validate role format
    if (!Object.values(UserRole).includes(userRole as UserRole)) {
      throw new UnauthorizedException(
        `Invalid user role: ${userRole}. Must be 'teacher' or 'student'`,
      );
    }

    // Check if user has required role
    const hasRole = requiredRoles.some(
      (role) => role === (userRole as UserRole),
    );

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required role(s): ${requiredRoles.join(', ')}. Your role: ${userRole}`,
      );
    }

    // Add user info to request for use in controllers
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (request as any).user = {
      id: userId,
      role: userRole as UserRole,
    };

    return true;
  }
}
