# API Gateway Integration & Permissions Guide

## Overview
This document outlines how the Scheduling Service integrates with the API Gateway for authentication, authorization, and role-based access control.

## API Gateway Headers
The API Gateway automatically adds these headers to all requests after authentication:

### Required Headers
```json
{
  "x-user-id": "uuid-of-authenticated-user",
  "x-user-role": "teacher|student|admin",
  "x-user-permissions": "comma,separated,list,of,permissions"
}
```

## Role-Based Access Control (RBAC)

### Teacher Role
**Permissions Required:**
- `manage_availability` - Create/update availability slots
- `create_session` - Create group sessions
- `view_sessions` - View all sessions
- `view_my_sessions` - View own sessions
- `view_availability` - View teacher availability

**Allowed Endpoints:**
- `POST /api/scheduling/availability` - Update availability (requires: `manage_availability`)
- `POST /api/scheduling/group-sessions` - Create group sessions (requires: `create_session`)
- `GET /api/scheduling/group-sessions` - View all group sessions (requires: `view_sessions`)
- `GET /api/scheduling/me/sessions` - View own sessions (requires: `view_my_sessions`)
- `GET /api/scheduling/teachers/{teacherId}/availability` - View availability (requires: `view_availability`)

### Student Role
**Permissions Required:**
- `view_sessions` - View available sessions
- `view_availability` - View teacher availability
- `book_session` - Book one-on-one sessions
- `enroll_session` - Enroll in group sessions
- `view_my_sessions` - View own sessions

**Allowed Endpoints:**
- `GET /api/scheduling/teachers/{teacherId}/availability` - View availability (requires: `view_availability`)
- `GET /api/scheduling/group-sessions` - View group sessions (requires: `view_sessions`)
- `POST /api/scheduling/book-session` - Book sessions (requires: `book_session`)
- `POST /api/scheduling/enroll-group-session` - Enroll in sessions (requires: `enroll_session`)
- `GET /api/scheduling/me/sessions` - View own sessions (requires: `view_my_sessions`)

### Admin Role (Future Extension)
**Permissions Required:**
- All permissions from teacher and student roles
- `admin_view_all` - View all data across the system
- `admin_manage_sessions` - Manage any user's sessions
- `admin_manage_availability` - Manage any teacher's availability

## Permission Validation Flow

### 1. Request Processing
```
API Gateway → Microservice
Headers: x-user-id, x-user-role, x-user-permissions
```

### 2. Controller Validation
```typescript
// Example validation in controller
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
```

### 3. Response
- **Success**: Process request normally
- **401 Unauthorized**: Missing authentication headers
- **403 Forbidden**: Wrong role or insufficient permissions

## Header Examples for Testing

### Teacher Headers
```json
{
  "x-user-id": "teacher-550e8400-e29b-41d4-a716-446655440000",
  "x-user-role": "teacher",
  "x-user-permissions": "manage_availability,create_session,view_sessions,view_my_sessions,view_availability"
}
```

### Student Headers
```json
{
  "x-user-id": "student-660e8400-e29b-41d4-a716-446655440001",
  "x-user-role": "student",
  "x-user-permissions": "view_sessions,view_availability,book_session,enroll_session,view_my_sessions"
}
```

### Admin Headers (Future)
```json
{
  "x-user-id": "admin-770e8400-e29b-41d4-a716-446655440002",
  "x-user-role": "admin",
  "x-user-permissions": "manage_availability,create_session,view_sessions,view_my_sessions,view_availability,book_session,enroll_session,admin_view_all,admin_manage_sessions,admin_manage_availability"
}
```

## Error Handling

### Authentication Errors (401)
- Missing `x-user-id` header
- Missing `x-user-role` header
- Invalid user ID format

### Authorization Errors (403)
- Wrong user role for endpoint
- Missing required permission
- Invalid role value

### Example Error Responses
```json
// Missing headers
{
  "statusCode": 401,
  "message": "Missing user authentication headers",
  "error": "Unauthorized"
}

// Wrong role
{
  "statusCode": 403,
  "message": "Only teachers can create group sessions",
  "error": "Forbidden"
}

// Missing permission
{
  "statusCode": 403,
  "message": "Insufficient permissions to create sessions",
  "error": "Forbidden"
}

// Invalid role
{
  "statusCode": 403,
  "message": "Invalid user role",
  "error": "Forbidden"
}
```

## Security Considerations

### 1. Header Validation
- All headers are validated for presence and format
- User roles are checked against allowed values
- Permissions are parsed and validated

### 2. Permission Granularity
- Each endpoint requires specific permissions
- Permissions are checked in addition to role validation
- Future-proof design allows for fine-grained access control

### 3. User Context Isolation
- Users can only access their own data (sessions, availability)
- Teacher IDs are extracted from headers, not request parameters
- Student enrollments are tied to authenticated user ID

## API Gateway Configuration Requirements

### Required Middleware
1. **Authentication Middleware**
   - Validates JWT tokens
   - Extracts user information
   - Sets user headers

2. **Authorization Middleware**
   - Validates user roles
   - Checks permissions against user profile
   - Forwards validated headers to microservices

### Header Format
```
x-user-id: UUID format (e.g., 550e8400-e29b-41d4-a716-446655440000)
x-user-role: String enum (teacher|student|admin)
x-user-permissions: Comma-separated string (no spaces)
```

## Testing Without API Gateway

For local development and testing without the API Gateway:

### Manual Header Addition
```bash
curl -X POST http://localhost:3004/api/scheduling/availability \
  -H "Content-Type: application/json" \
  -H "x-user-id: teacher-550e8400-e29b-41d4-a716-446655440000" \
  -H "x-user-role: teacher" \
  -H "x-user-permissions: manage_availability,create_session,view_sessions" \
  -d '{"availabilities":[{"startTime":"2025-07-21T09:00:00Z","endTime":"2025-07-21T12:00:00Z"}]}'
```

### Postman Environment Variables
```json
{
  "teacher_id": "teacher-550e8400-e29b-41d4-a716-446655440000",
  "teacher_role": "teacher",
  "teacher_permissions": "manage_availability,create_session,view_sessions,view_my_sessions,view_availability",
  "student_id": "student-660e8400-e29b-41d4-a716-446655440001",
  "student_role": "student",
  "student_permissions": "view_sessions,view_availability,book_session,enroll_session,view_my_sessions"
}
```

This approach ensures secure, role-based access control while maintaining clean separation between authentication (API Gateway) and business logic (Microservice).