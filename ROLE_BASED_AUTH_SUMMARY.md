# Role-Based Authentication System

## Overview
The scheduling service has been refactored from a complex permission-based system to a simple role-based authentication system with only 2 roles: `teacher` and `student`.

## Changes Made

### 1. Authentication Infrastructure
- **`src/auth/roles.decorator.ts`**: Created `@Roles()` decorator and `UserRole` enum
- **`src/auth/roles.guard.ts`**: Implemented `RolesGuard` with automatic role validation
- **`src/auth/auth.interface.ts`**: Defined `AuthenticatedRequest` interface for typed requests

### 2. Controller Updates
- **Availability Controller**: Fully converted to use role guards
- **Scheduling Controller**: Fully converted to use role guards
- **Global Guard**: Registered `RolesGuard` globally in `app.module.ts`

### 3. Simplified Authentication Headers
**Before** (complex permissions):
```json
{
  "x-user-id": "user-uuid",
  "x-user-role": "teacher",
  "x-user-permissions": "manage_availability,create_session,view_sessions"
}
```

**After** (simple roles):
```json
{
  "x-user-id": "user-uuid", 
  "x-user-role": "teacher"
}
```

## Role Access Matrix

| Endpoint | Teacher | Student |
|----------|---------|---------|
| `POST /api/availability` | ✅ | ❌ |
| `GET /api/availability` | ✅ | ✅ |
| `POST /api/scheduling/group-sessions` | ✅ | ❌ |
| `GET /api/scheduling/group-sessions` | ✅ | ✅ |
| `POST /api/scheduling/book-session` | ❌ | ✅ |
| `POST /api/scheduling/enroll-group-session` | ❌ | ✅ |
| `GET /api/scheduling/me/sessions` | ✅ | ✅ |

## Usage Examples

### Teacher Request
```bash
curl -X POST "http://localhost:3004/api/availability" \
  -H "Content-Type: application/json" \
  -H "x-user-id: teacher-uuid-123" \
  -H "x-user-role: teacher" \
  -d '{"availabilities": [{"startTime": "2025-07-21T09:00:00Z", "endTime": "2025-07-21T12:00:00Z"}]}'
```

### Student Request
```bash
curl -X POST "http://localhost:3004/api/scheduling/book-session" \
  -H "Content-Type: application/json" \
  -H "x-user-id: student-uuid-456" \
  -H "x-user-role: student" \
  -d '{"availabilityId": "availability-uuid"}'
```

## Error Responses

### Role Access Denied
```json
{
  "statusCode": 403,
  "message": "Access denied: teacher role required",
  "error": "Forbidden"
}
```

### Missing Headers
```json
{
  "statusCode": 401,
  "message": "Missing required authentication headers",
  "error": "Unauthorized"
}
```

## Benefits of This Approach

1. **Simplicity**: No complex permission management needed
2. **Maintainability**: Easy to understand and modify role access
3. **Performance**: Faster authentication without permission lookups
4. **YAGNI Principle**: "You Aren't Gonna Need It" - only implement what's actually needed

## Files Modified

- `src/auth/roles.decorator.ts` (new)
- `src/auth/roles.guard.ts` (new) 
- `src/auth/auth.interface.ts` (new)
- `src/availability/availability.controller.ts` (updated)
- `src/scheduling/scheduling.controller.ts` (updated)
- `src/app.module.ts` (updated)
- `API_TESTING_GUIDE.md` (updated)