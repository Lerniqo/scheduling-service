import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, UserRole } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No role requirement
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.headers['x-user-id'];
    const userRole = request.headers['x-user-role'];

    // Check if user authentication headers are present
    if (!userId || !userRole) {
      throw new UnauthorizedException('Missing user authentication headers (x-user-id, x-user-role)');
    }

    // Validate role format
    if (!Object.values(UserRole).includes(userRole as UserRole)) {
      throw new UnauthorizedException(`Invalid user role: ${userRole}. Must be 'teacher' or 'student'`);
    }

    // Check if user has required role
    const hasRole = requiredRoles.some((role) => role === userRole);
    
    if (!hasRole) {
      throw new ForbiddenException(`Access denied. Required role(s): ${requiredRoles.join(', ')}. Your role: ${userRole}`);
    }

    // Add user info to request for use in controllers
    request.user = {
      id: userId,
      role: userRole as UserRole,
    };

    return true;
  }
}