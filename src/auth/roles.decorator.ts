import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  TEACHER = 'teacher',
  STUDENT = 'student',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
