import { UserRole } from './roles.decorator';

export interface RequestUser {
  id: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user: RequestUser;
}