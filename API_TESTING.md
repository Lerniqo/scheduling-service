# Scheduling Service API Testing Documentation

## Overview
This document provides comprehensive API testing examples for the Scheduling Service microservice. The service handles teacher availability management, session booking, and scheduling operations with UUID-based identification and API Gateway integration.

## Base Configuration

**Base URL:** `http://localhost:3000`

**Required Headers:**
```json
{
  "Content-Type": "application/json",
  "x-user-id": "teacher123",
  "x-user-role": "teacher",
  "x-user-permissions": "manage:sessions,view:availability"
}
```

## Authentication & Authorization

The service uses header-based authentication from API Gateway:
- `x-user-id`: User identifier (converted to UUID internally)
- `x-user-role`: User role (teacher, student, admin)
- `x-user-permissions`: Comma-separated permissions

## API Endpoints Testing

### 1. Health Check

#### GET /health/live
**Description:** Check if service is running
```bash
curl -X GET http://localhost:3000/health/live
```

**Expected Response:**
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  }
}
```

#### GET /health/ready
**Description:** Check if service is ready to handle requests
```bash
curl -X GET http://localhost:3000/health/ready
```

### 2. Teacher Availability Management

#### POST /api/scheduling/availability
**Description:** Add or update teacher availability slots

**Headers:**
```json
{
  "Content-Type": "application/json",
  "x-user-id": "teacher123",
  "x-user-role": "teacher",
  "x-user-permissions": "manage:availability"
}
```

**Request:**
```bash
curl -X POST http://localhost:3000/api/scheduling/availability \
  -H "Content-Type: application/json" \
  -H "x-user-id: teacher123" \
  -H "x-user-role: teacher" \
  -H "x-user-permissions: manage:availability" \
  -d '{
    "availabilities": [
      {
        "startTime": "2025-10-12T10:00:00.000Z",
        "endTime": "2025-10-12T11:00:00.000Z"
      },
      {
        "startTime": "2025-10-12T14:00:00.000Z",
        "endTime": "2025-10-12T15:00:00.000Z"
      },
      {
        "startTime": "2025-10-13T09:00:00.000Z",
        "endTime": "2025-10-13T10:00:00.000Z"
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "message": "Availability updated."
}
```

#### GET /api/scheduling/teachers/:teacherId/availability
**Description:** Get available time slots for a specific teacher

**Request:**
```bash
curl -X GET http://localhost:3000/api/scheduling/teachers/teacher123/availability \
  -H "Content-Type: application/json" \
  -H "x-user-id: student456" \
  -H "x-user-role: student" \
  -H "x-user-permissions: view:availability"
```

**Expected Response:**
```json
[
  {
    "availability_id": "550e8400-e29b-41d4-a716-446655440001",
    "teacher_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "start_time": "2025-10-12T10:00:00.000Z",
    "end_time": "2025-10-12T11:00:00.000Z",
    "is_booked": false,
    "created_at": "2025-10-11T01:30:15.123Z",
    "updated_at": "2025-10-11T01:30:15.123Z"
  },
  {
    "availability_id": "550e8400-e29b-41d4-a716-446655440002",
    "teacher_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "start_time": "2025-10-12T14:00:00.000Z",
    "end_time": "2025-10-12T15:00:00.000Z",
    "is_booked": false,
    "created_at": "2025-10-11T01:30:15.123Z",
    "updated_at": "2025-10-11T01:30:15.123Z"
  }
]
```

### 3. One-on-One Session Booking

#### POST /api/scheduling/book-session
**Description:** Book a one-on-one session with a teacher

**Headers:**
```json
{
  "Content-Type": "application/json",
  "x-user-id": "student456",
  "x-user-role": "student",
  "x-user-permissions": "book:sessions"
}
```

**Request:**
```bash
curl -X POST http://localhost:3000/api/scheduling/book-session \
  -H "Content-Type: application/json" \
  -H "x-user-id: student456" \
  -H "x-user-role: student" \
  -H "x-user-permissions: book:sessions" \
  -d '{
    "availabilityId": "550e8400-e29b-41d4-a716-446655440001"
  }'
```

**Expected Response:**
```json
{
  "session_id": "660f9500-f3ac-52e5-b827-557766551001",
  "teacher_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "session_type": "ONE_ON_ONE",
  "title": "One-on-One Session",
  "description": null,
  "start_time": "2025-10-12T10:00:00.000Z",
  "end_time": "2025-10-12T11:00:00.000Z",
  "status": "SCHEDULED",
  "is_paid": false,
  "price": null,
  "max_attendees": 1,
  "video_conference_link": "https://meet.jit.si/session-1728612615123-abc123def",
  "attendees_count": 1
}
```

### 4. Group Session Management

#### POST /api/scheduling/group-sessions
**Description:** Create a new group session

**Headers:**
```json
{
  "Content-Type": "application/json",
  "x-user-id": "teacher123",
  "x-user-role": "teacher",
  "x-user-permissions": "create:group-sessions"
}
```

**Request:**
```bash
curl -X POST http://localhost:3000/api/scheduling/group-sessions \
  -H "Content-Type: application/json" \
  -H "x-user-id: teacher123" \
  -H "x-user-role: teacher" \
  -H "x-user-permissions: create:group-sessions" \
  -d '{
    "title": "Advanced JavaScript Workshop",
    "description": "Deep dive into advanced JavaScript concepts including async/await, closures, and design patterns",
    "startTime": "2025-10-15T16:00:00.000Z",
    "endTime": "2025-10-15T18:00:00.000Z",
    "maxAttendees": 15,
    "isPaid": true,
    "price": 49.99
  }'
```

**Expected Response:**
```json
{
  "session_id": "770a0600-04bd-63f6-c938-668877662001",
  "teacher_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "session_type": "GROUP",
  "title": "Advanced JavaScript Workshop",
  "description": "Deep dive into advanced JavaScript concepts including async/await, closures, and design patterns",
  "start_time": "2025-10-15T16:00:00.000Z",
  "end_time": "2025-10-15T18:00:00.000Z",
  "status": "SCHEDULED",
  "is_paid": true,
  "price": "49.99",
  "max_attendees": 15,
  "video_conference_link": "https://meet.jit.si/session-1728612715456-def456ghi",
  "attendees_count": 0
}
```

#### GET /api/scheduling/group-sessions
**Description:** Get all available group sessions

**Request:**
```bash
curl -X GET http://localhost:3000/api/scheduling/group-sessions \
  -H "Content-Type: application/json" \
  -H "x-user-id: student456" \
  -H "x-user-role: student" \
  -H "x-user-permissions: view:sessions"
```

**Expected Response:**
```json
[
  {
    "session_id": "770a0600-04bd-63f6-c938-668877662001",
    "teacher_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "session_type": "GROUP",
    "title": "Advanced JavaScript Workshop",
    "description": "Deep dive into advanced JavaScript concepts including async/await, closures, and design patterns",
    "start_time": "2025-10-15T16:00:00.000Z",
    "end_time": "2025-10-15T18:00:00.000Z",
    "status": "SCHEDULED",
    "is_paid": true,
    "price": "49.99",
    "max_attendees": 15,
    "video_conference_link": "https://meet.jit.si/session-1728612715456-def456ghi",
    "attendees_count": 3
  }
]
```

### 5. Group Session Enrollment

#### POST /api/scheduling/enroll-group-session
**Description:** Enroll a student in a group session

**Headers:**
```json
{
  "Content-Type": "application/json",
  "x-user-id": "student456",
  "x-user-role": "student",
  "x-user-permissions": "enroll:sessions"
}
```

**Request (Free Session):**
```bash
curl -X POST http://localhost:3000/api/scheduling/enroll-group-session \
  -H "Content-Type: application/json" \
  -H "x-user-id: student456" \
  -H "x-user-role: student" \
  -H "x-user-permissions: enroll:sessions" \
  -d '{
    "sessionId": "770a0600-04bd-63f6-c938-668877662001"
  }'
```

**Expected Response (Free Session):**
```json
{
  "session_id": "770a0600-04bd-63f6-c938-668877662001",
  "teacher_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "session_type": "GROUP",
  "title": "Advanced JavaScript Workshop",
  "description": "Deep dive into advanced JavaScript concepts including async/await, closures, and design patterns",
  "start_time": "2025-10-15T16:00:00.000Z",
  "end_time": "2025-10-15T18:00:00.000Z",
  "status": "SCHEDULED",
  "is_paid": true,
  "price": "49.99",
  "max_attendees": 15,
  "video_conference_link": "https://meet.jit.si/session-1728612715456-def456ghi",
  "attendees_count": 4
}
```

**Expected Response (Paid Session):**
```json
{
  "checkoutSessionId": "checkout_1728612815789_xyz789abc"
}
```

### 6. User Session Retrieval

#### GET /api/scheduling/me/sessions
**Description:** Get all sessions for the authenticated user (teacher or student)

**Request (Teacher):**
```bash
curl -X GET http://localhost:3000/api/scheduling/me/sessions \
  -H "Content-Type: application/json" \
  -H "x-user-id: teacher123" \
  -H "x-user-role: teacher" \
  -H "x-user-permissions: view:own-sessions"
```

**Request (Student):**
```bash
curl -X GET http://localhost:3000/api/scheduling/me/sessions \
  -H "Content-Type: application/json" \
  -H "x-user-id: student456" \
  -H "x-user-role: student" \
  -H "x-user-permissions: view:own-sessions"
```

**Expected Response:**
```json
[
  {
    "session_id": "660f9500-f3ac-52e5-b827-557766551001",
    "teacher_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "session_type": "ONE_ON_ONE",
    "title": "One-on-One Session",
    "description": null,
    "start_time": "2025-10-12T10:00:00.000Z",
    "end_time": "2025-10-12T11:00:00.000Z",
    "status": "SCHEDULED",
    "is_paid": false,
    "price": null,
    "max_attendees": 1,
    "video_conference_link": "https://meet.jit.si/session-1728612615123-abc123def",
    "attendees_count": 1
  },
  {
    "session_id": "770a0600-04bd-63f6-c938-668877662001",
    "teacher_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "session_type": "GROUP",
    "title": "Advanced JavaScript Workshop",
    "description": "Deep dive into advanced JavaScript concepts including async/await, closures, and design patterns",
    "start_time": "2025-10-15T16:00:00.000Z",
    "end_time": "2025-10-15T18:00:00.000Z",
    "status": "SCHEDULED",
    "is_paid": true,
    "price": "49.99",
    "max_attendees": 15,
    "video_conference_link": "https://meet.jit.si/session-1728612715456-def456ghi",
    "attendees_count": 4
  }
]
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "startTime must be before endTime",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Missing required authentication headers",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions for this operation",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Availability slot not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "This time slot is already booked",
  "error": "Conflict"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

## Testing Scenarios

### Scenario 1: Complete Teacher Workflow
1. Create availability slots (POST /api/scheduling/availability)
2. View created availability (GET /api/scheduling/teachers/:teacherId/availability)
3. Create a group session (POST /api/scheduling/group-sessions)
4. View teacher's sessions (GET /api/scheduling/me/sessions)

### Scenario 2: Complete Student Workflow
1. View teacher availability (GET /api/scheduling/teachers/:teacherId/availability)
2. Book one-on-one session (POST /api/scheduling/book-session)
3. View available group sessions (GET /api/scheduling/group-sessions)
4. Enroll in group session (POST /api/scheduling/enroll-group-session)
5. View student's sessions (GET /api/scheduling/me/sessions)

### Scenario 3: Edge Cases Testing
1. **Double Booking:** Try to book the same availability slot twice
2. **Full Session:** Try to enroll in a session that's at capacity
3. **Invalid Time:** Create availability with end time before start time
4. **Missing Headers:** Make requests without required authentication headers
5. **Invalid UUID:** Use malformed UUIDs in requests

## UUID Conversion Examples

The service automatically converts string IDs to UUIDs:

**Input:** `"teacher123"` → **Output:** `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"`
**Input:** `"student456"` → **Output:** `"b2c3d4e5-f6g7-8901-bcde-f12345678901"`

This ensures deterministic UUID generation where the same string always produces the same UUID.

## Video Conference Integration

All sessions automatically get Jitsi Meet links:
- Format: `https://meet.jit.si/session-{timestamp}-{random}`
- Unique for each session
- Ready to use immediately after session creation

## Testing Tools

### Recommended Tools:
- **Postman:** For GUI-based testing
- **curl:** For command-line testing
- **Insomnia:** Alternative REST client
- **HTTPie:** User-friendly command-line tool

### Postman Collection
Import the following environment variables:
```json
{
  "base_url": "http://localhost:3000",
  "teacher_id": "teacher123",
  "student_id": "student456",
  "teacher_permissions": "manage:availability,create:group-sessions,view:own-sessions",
  "student_permissions": "view:availability,book:sessions,enroll:sessions,view:own-sessions"
}
```

## Notes

1. **Time Format:** All timestamps must be in ISO 8601 format (UTC)
2. **UUID Handling:** String IDs are automatically converted to deterministic UUIDs
3. **Authentication:** All endpoints require proper headers from API Gateway
4. **Validation:** Request payloads are validated using class-validator decorators
5. **Database:** PostgreSQL with UUID columns and proper constraints
6. **Environment:** Service runs on port 3000 by default

## Troubleshooting

### Common Issues:
1. **Connection Refused:** Ensure the service is running on port 3000
2. **Authentication Errors:** Verify all required headers are present
3. **UUID Errors:** Resolved by automatic string-to-UUID conversion
4. **Time Validation:** Ensure ISO 8601 format for all timestamps
5. **Database Errors:** Check PostgreSQL connection and schema

For additional support, check the application logs for detailed error messages.