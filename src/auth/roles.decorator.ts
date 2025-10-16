import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  TEACHER = 'Teacher',
  STUDENT = 'Student',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
