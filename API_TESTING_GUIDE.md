# Scheduling Service API Testing Guide

This document provides comprehensive testing instructions for all API endpoints in the Scheduling Service microservice.

## Base URL
```
http://localhost:3004
```

## Authentication Headers
For all authenticated endpoints, include these headers (set by API Gateway):
```json
{
  "Content-Type": "application/json",
  "x-user-id": "user-uuid-123",
  "x-user-role": "teacher", 
  "x-user-permissions": "manage_availability,create_session,view_sessions"
}
```

**Note**: These headers are automatically set by the API Gateway based on authenticated user context. The microservice validates role and permissions for each endpoint.

---

## 🎓 Teacher APIs

### 1. Update Teacher Availability
**Endpoint**: `POST /api/scheduling/availability`
**Description**: Allows teachers to add or update their available time slots

**Headers**:
```json
{
  "Content-Type": "application/json",
  "x-user-id": "teacher-uuid-123",
  "x-user-role": "teacher",
  "x-user-permissions": "manage_availability,create_session,view_sessions"
}
```

**Request Body**:
```json
{
  "availabilities": [
    {
      "startTime": "2025-07-21T09:00:00Z",
      "endTime": "2025-07-21T12:00:00Z"
    },
    {
      "startTime": "2025-07-21T14:00:00Z",
      "endTime": "2025-07-21T17:00:00Z"
    },
    {
      "startTime": "2025-07-22T10:00:00Z",
      "endTime": "2025-07-22T13:00:00Z"
    }
  ]
}
```

**Success Response (200 OK)**:
```json
{
  "message": "Availability updated."
}
```

**Error Responses**:
```json
// Unauthorized (401)
{
  "statusCode": 401,
  "message": "Missing user authentication headers",
  "error": "Unauthorized"
}

// Forbidden (403)
{
  "statusCode": 403,
  "message": "Only teachers can update availability",
  "error": "Forbidden"
}

// Permission Error (403)
{
  "statusCode": 403,
  "message": "Insufficient permissions to manage availability",
  "error": "Forbidden"
}

// Bad Request (400)
{
  "statusCode": 400,
  "message": "startTime must be before endTime",
  "error": "Bad Request"
}

// Validation Error (400)
{
  "statusCode": 400,
  "message": [
    "startTime must be a valid ISO 8601 date string",
    "endTime must be a valid ISO 8601 date string"
  ],
  "error": "Bad Request"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3004/api/scheduling/availability \
  -H "Content-Type: application/json" \
  -H "x-user-id: teacher-uuid-123" \
  -H "x-user-role: teacher" \
  -H "x-user-permissions: manage_availability,create_session,view_sessions" \
  -d '{
    "availabilities": [
      {
        "startTime": "2025-07-21T09:00:00Z",
        "endTime": "2025-07-21T12:00:00Z"
      }
    ]
  }'
```

---

### 2. Create Group Session
**Endpoint**: `POST /api/scheduling/group-sessions`
**Description**: Creates a new group session

**Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer teacher-jwt-token"
}
```

**Request Body**:
```json
{
  "title": "Mastering Quadratic Equations",
  "description": "An in-depth look at factoring and solving quadratic equations with real-world applications.",
  "startTime": "2025-07-22T14:00:00Z",
  "endTime": "2025-07-22T15:00:00Z",
  "isPaid": true,
  "price": 500.00,
  "maxAttendees": 20
}
```

**Optional Fields Example**:
```json
{
  "title": "Free Mathematics Tutorial",
  "startTime": "2025-07-23T10:00:00Z",
  "endTime": "2025-07-23T11:00:00Z"
}
```

**Success Response (201 Created)**:
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "teacher_id": "teacher-placeholder-id",
  "session_type": "GROUP",
  "title": "Mastering Quadratic Equations",
  "description": "An in-depth look at factoring and solving quadratic equations with real-world applications.",
  "start_time": "2025-07-22T14:00:00.000Z",
  "end_time": "2025-07-22T15:00:00.000Z",
  "status": "SCHEDULED",
  "is_paid": true,
  "price": 500,
  "max_attendees": 20,
  "video_conference_link": "https://meet.jit.si/session-1729123456789-abc123def",
  "attendees_count": 0
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3004/api/scheduling/group-sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer teacher-jwt-token" \
  -d '{
    "title": "Mastering Quadratic Equations",
    "description": "An in-depth look at factoring and solving.",
    "startTime": "2025-07-22T14:00:00Z",
    "endTime": "2025-07-22T15:00:00Z",
    "isPaid": true,
    "price": 500.00,
    "maxAttendees": 20
  }'
```

---

### 3. Get Teacher Sessions
**Endpoint**: `GET /api/scheduling/me/sessions`
**Description**: Retrieves all sessions for the authenticated teacher

**Headers**:
```json
{
  "Authorization": "Bearer teacher-jwt-token"
}
```

**Success Response (200 OK)**:
```json
[
  {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "teacher_id": "teacher-placeholder-id",
    "session_type": "GROUP",
    "title": "Mastering Quadratic Equations",
    "description": "An in-depth look at factoring and solving.",
    "start_time": "2025-07-22T14:00:00.000Z",
    "end_time": "2025-07-22T15:00:00.000Z",
    "status": "SCHEDULED",
    "is_paid": true,
    "price": 500,
    "max_attendees": 20,
    "video_conference_link": "https://meet.jit.si/session-1729123456789-abc123def",
    "attendees_count": 5
  },
  {
    "session_id": "660e8400-e29b-41d4-a716-446655440001",
    "teacher_id": "teacher-placeholder-id",
    "session_type": "ONE_ON_ONE",
    "title": "One-on-One Session",
    "description": null,
    "start_time": "2025-07-21T09:00:00.000Z",
    "end_time": "2025-07-21T10:00:00.000Z",
    "status": "COMPLETED",
    "is_paid": false,
    "price": null,
    "max_attendees": 1,
    "video_conference_link": "https://meet.jit.si/session-1729123456780-xyz789abc",
    "attendees_count": 1
  }
]
```

**cURL Example**:
```bash
curl -X GET http://localhost:3004/api/scheduling/me/sessions \
  -H "Authorization: Bearer teacher-jwt-token"
```

---

## 👨‍🎓 Student APIs

### 4. View Teacher Availability
**Endpoint**: `GET /api/scheduling/teachers/{teacherId}/availability`
**Description**: Retrieves open, unbooked time slots for a specific teacher

**Headers**:
```json
{
  "Authorization": "Bearer student-jwt-token"
}
```

**URL Parameters**:
- `teacherId` (string, required): The ID of the teacher

**Success Response (200 OK)**:
```json
[
  {
    "availability_id": "770e8400-e29b-41d4-a716-446655440002",
    "teacher_id": "teacher-123",
    "start_time": "2025-07-21T09:00:00.000Z",
    "end_time": "2025-07-21T12:00:00.000Z",
    "is_booked": false,
    "created_at": "2025-07-20T10:30:00.000Z",
    "updated_at": "2025-07-20T10:30:00.000Z"
  },
  {
    "availability_id": "880e8400-e29b-41d4-a716-446655440003",
    "teacher_id": "teacher-123",
    "start_time": "2025-07-21T14:00:00.000Z",
    "end_time": "2025-07-21T17:00:00.000Z",
    "is_booked": false,
    "created_at": "2025-07-20T10:30:00.000Z",
    "updated_at": "2025-07-20T10:30:00.000Z"
  }
]
```

**cURL Example**:
```bash
curl -X GET http://localhost:3004/api/scheduling/teachers/teacher-123/availability \
  -H "Authorization: Bearer student-jwt-token"
```

---

### 5. Browse Group Sessions
**Endpoint**: `GET /api/scheduling/group-sessions`
**Description**: Retrieves all upcoming, open group sessions

**Headers**:
```json
{
  "Authorization": "Bearer student-jwt-token"
}
```

**Success Response (200 OK)**:
```json
[
  {
    "session_id": "990e8400-e29b-41d4-a716-446655440004",
    "teacher_id": "teacher-456",
    "session_type": "GROUP",
    "title": "Advanced Calculus Workshop",
    "description": "Deep dive into differential and integral calculus.",
    "start_time": "2025-07-23T15:00:00.000Z",
    "end_time": "2025-07-23T17:00:00.000Z",
    "status": "SCHEDULED",
    "is_paid": true,
    "price": 750,
    "max_attendees": 15,
    "video_conference_link": "https://meet.jit.si/session-1729123456790-def456ghi",
    "attendees_count": 8
  },
  {
    "session_id": "aa0e8400-e29b-41d4-a716-446655440005",
    "teacher_id": "teacher-789",
    "session_type": "GROUP",
    "title": "Free Physics Study Group",
    "description": "Collaborative problem-solving session.",
    "start_time": "2025-07-24T10:00:00.000Z",
    "end_time": "2025-07-24T12:00:00.000Z",
    "status": "SCHEDULED",
    "is_paid": false,
    "price": null,
    "max_attendees": 25,
    "video_conference_link": "https://meet.jit.si/session-1729123456791-ghi789jkl",
    "attendees_count": 12
  }
]
```

**cURL Example**:
```bash
curl -X GET http://localhost:3004/api/scheduling/group-sessions \
  -H "Authorization: Bearer student-jwt-token"
```

---

### 6. Book One-on-One Session
**Endpoint**: `POST /api/scheduling/book-session`
**Description**: Books a one-on-one session using an availability slot

**Headers**:
```json
{
  "Content-Type": "application/json",
  "x-user-id": "student-uuid-456",
  "x-user-role": "student",
  "x-user-permissions": "book_session,view_sessions"
}
```

**Request Body**:
```json
{
  "availabilityId": "770e8400-e29b-41d4-a716-446655440002"
}
```

**Success Response (201 Created) - Free Session**:
```json
{
  "session_id": "bb0e8400-e29b-41d4-a716-446655440006",
  "teacher_id": "teacher-123",
  "session_type": "ONE_ON_ONE",
  "title": "One-on-One Session",
  "description": null,
  "start_time": "2025-07-21T09:00:00.000Z",
  "end_time": "2025-07-21T12:00:00.000Z",
  "status": "SCHEDULED",
  "is_paid": false,
  "price": null,
  "max_attendees": 1,
  "video_conference_link": "https://meet.jit.si/session-1729123456792-jkl012mno",
  "attendees_count": 1
}
```

**Error Response - Slot Already Booked (409 Conflict)**:
```json
{
  "statusCode": 409,
  "message": "This time slot is already booked",
  "error": "Conflict"
}
```

**Error Response - Slot Not Found (404 Not Found)**:
```json
{
  "statusCode": 404,
  "message": "Availability slot not found",
  "error": "Not Found"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3004/api/scheduling/book-session \
  -H "Content-Type: application/json" \
  -H "x-user-id: student-uuid-456" \
  -H "x-user-role: student" \
  -H "x-user-permissions: book_session,view_sessions" \
  -d '{
    "availabilityId": "770e8400-e29b-41d4-a716-446655440002"
  }'
```

---

### 7. Enroll in Group Session
**Endpoint**: `POST /api/scheduling/enroll-group-session`
**Description**: Enrolls a student in a group session

**Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer student-jwt-token"
}
```

**Request Body**:
```json
{
  "sessionId": "990e8400-e29b-41d4-a716-446655440004"
}
```

**Success Response (201 Created) - Free Session**:
```json
{
  "session_id": "990e8400-e29b-41d4-a716-446655440004",
  "teacher_id": "teacher-456",
  "session_type": "GROUP",
  "title": "Free Physics Study Group",
  "description": "Collaborative problem-solving session.",
  "start_time": "2025-07-24T10:00:00.000Z",
  "end_time": "2025-07-24T12:00:00.000Z",
  "status": "SCHEDULED",
  "is_paid": false,
  "price": null,
  "max_attendees": 25,
  "video_conference_link": "https://meet.jit.si/session-1729123456791-ghi789jkl",
  "attendees_count": 13
}
```

**Success Response (200 OK) - Paid Session**:
```json
{
  "checkoutSessionId": "checkout_1729123456793_abc123def456"
}
```

**Error Response - Session Full (409 Conflict)**:
```json
{
  "statusCode": 409,
  "message": "Session is full",
  "error": "Conflict"
}
```

**Error Response - Already Enrolled (409 Conflict)**:
```json
{
  "statusCode": 409,
  "message": "Student is already enrolled in this session",
  "error": "Conflict"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3004/api/scheduling/enroll-group-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer student-jwt-token" \
  -d '{
    "sessionId": "990e8400-e29b-41d4-a716-446655440004"
  }'
```

---

### 8. Get Student Sessions
**Endpoint**: `GET /api/scheduling/me/sessions`
**Description**: Retrieves all sessions for the authenticated student

**Headers**:
```json
{
  "Authorization": "Bearer student-jwt-token"
}
```

**Success Response (200 OK)**:
```json
[
  {
    "session_id": "bb0e8400-e29b-41d4-a716-446655440006",
    "teacher_id": "teacher-123",
    "session_type": "ONE_ON_ONE",
    "title": "One-on-One Session",
    "description": null,
    "start_time": "2025-07-21T09:00:00.000Z",
    "end_time": "2025-07-21T12:00:00.000Z",
    "status": "SCHEDULED",
    "is_paid": false,
    "price": null,
    "max_attendees": 1,
    "video_conference_link": "https://meet.jit.si/session-1729123456792-jkl012mno",
    "attendees_count": 1
  },
  {
    "session_id": "990e8400-e29b-41d4-a716-446655440004",
    "teacher_id": "teacher-456",
    "session_type": "GROUP",
    "title": "Advanced Calculus Workshop",
    "description": "Deep dive into differential and integral calculus.",
    "start_time": "2025-07-23T15:00:00.000Z",
    "end_time": "2025-07-23T17:00:00.000Z",
    "status": "SCHEDULED",
    "is_paid": true,
    "price": 750,
    "max_attendees": 15,
    "video_conference_link": "https://meet.jit.si/session-1729123456790-def456ghi",
    "attendees_count": 9
  }
]
```

**cURL Example**:
```bash
curl -X GET http://localhost:3004/api/scheduling/me/sessions \
  -H "Authorization: Bearer student-jwt-token"
```

---

## 🧪 Testing Scenarios

### End-to-End Testing Flow

1. **Teacher Sets Availability**:
   ```bash
   POST /api/scheduling/availability
   # Add multiple time slots for testing
   ```

2. **Student Views Available Slots**:
   ```bash
   GET /api/scheduling/teachers/{teacherId}/availability
   # Should show the slots created in step 1
   ```

3. **Student Books One-on-One Session**:
   ```bash
   POST /api/scheduling/book-session
   # Use availabilityId from step 2
   ```

4. **Verify Slot is Booked**:
   ```bash
   GET /api/scheduling/teachers/{teacherId}/availability
   # The booked slot should not appear in available slots
   ```

5. **Teacher Creates Group Session**:
   ```bash
   POST /api/scheduling/group-sessions
   # Create both free and paid sessions
   ```

6. **Student Views Group Sessions**:
   ```bash
   GET /api/scheduling/group-sessions
   # Should show sessions from step 5
   ```

7. **Student Enrolls in Group Session**:
   ```bash
   POST /api/scheduling/enroll-group-session
   # Test with both free and paid sessions
   ```

8. **Check Session Capacity**:
   ```bash
   GET /api/scheduling/group-sessions
   # attendees_count should have increased
   ```

### Error Testing Scenarios

1. **Invalid Date Formats**:
   ```json
   {
     "availabilities": [
       {
         "startTime": "invalid-date",
         "endTime": "2025-07-21T12:00:00Z"
       }
     ]
   }
   ```

2. **End Time Before Start Time**:
   ```json
   {
     "availabilities": [
       {
         "startTime": "2025-07-21T12:00:00Z",
         "endTime": "2025-07-21T09:00:00Z"
       }
     ]
   }
   ```

3. **Booking Already Booked Slot**:
   ```bash
   # Book the same availability slot twice
   POST /api/scheduling/book-session (first time - should succeed)
   POST /api/scheduling/book-session (second time - should fail with 409)
   ```

4. **Enrolling in Full Session**:
   ```bash
   # Create session with maxAttendees: 1, then try to enroll 2 students
   ```

5. **Double Enrollment**:
   ```bash
   # Same student tries to enroll in the same session twice
   ```

---

## 🛠️ Testing Tools

### Postman Collection
Import this collection into Postman for easy testing:

```json
{
  "info": {
    "name": "Scheduling Service API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{authToken}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3004"
    },
    {
      "key": "teacherToken",
      "value": "teacher-jwt-token"
    },
    {
      "key": "studentToken",
      "value": "student-jwt-token"
    }
  ]
}
```

### Environment Variables for Testing
```json
{
  "baseUrl": "http://localhost:3004",
  "teacherId": "teacher-550e8400-e29b-41d4-a716-446655440000",
  "teacherRole": "teacher",
  "teacherPermissions": "manage_availability,create_session,view_sessions,view_my_sessions,view_availability",
  "studentId": "student-660e8400-e29b-41d4-a716-446655440001",
  "studentRole": "student",
  "studentPermissions": "view_sessions,view_availability,book_session,enroll_session,view_my_sessions"
}
```

### Sample Test Data
```json
{
  "sampleAvailability": {
    "availabilities": [
      {
        "startTime": "2025-07-21T09:00:00Z",
        "endTime": "2025-07-21T12:00:00Z"
      }
    ]
  },
  "sampleGroupSession": {
    "title": "Test Session",
    "description": "Test Description",
    "startTime": "2025-07-22T14:00:00Z",
    "endTime": "2025-07-22T15:00:00Z",
    "isPaid": false,
    "maxAttendees": 5
  }
}
```

---

## 📋 Status Codes Reference

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data or validation errors
- **401 Unauthorized**: Missing or invalid authentication
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflict (already booked, already enrolled, etc.)
- **500 Internal Server Error**: Server error

---

## 🔍 Debugging Tips

1. **Check Database State**: Use database tools to verify data persistence
2. **Validate JSON**: Ensure request bodies are valid JSON
3. **Time Zones**: All times should be in ISO 8601 UTC format
4. **Authentication**: Verify JWT tokens are properly formatted
5. **Network**: Ensure the service is running on the correct port (3004)

This comprehensive guide should help you test all functionality of the Scheduling Service API effectively!