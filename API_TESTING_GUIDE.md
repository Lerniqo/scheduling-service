# Scheduling Service API Testing Guide

This document provides comprehensive testing instructions for all API endpoints in the Scheduling Service microservice.

## Base URL
```
http://localhost:3004
```

## Authentication Headers
For all authenticated endpoints, include these headers:
```json
{
  "Content-Type": "application/json",
  "x-user-id": "user-uuid-123",
  "x-user-role": "teacher"
}
```

**Note**: Both `x-user-id` and `x-user-role` headers are required for all endpoints. The microservice validates role-based access and needs the user ID for data association. Only two roles are supported: `teacher` and `student`.

---

## 🎓 Teacher APIs

### 1. Update Teacher Availability
**Endpoint**: `POST /api/scheduling/availability`
**Description**: Allows teachers to add or update their available time slots with pricing

**Headers**:
```json
{
  "Content-Type": "application/json",
  "x-user-id": "teacher-uuid-123",
  "x-user-role": "teacher"
}
```

**Request Body** (with Sri Lankan time):
```json
{
  "availabilities": [
    {
      "startTime": "2025-10-12T09:00:00",
      "endTime": "2025-10-12T12:00:00",
      "isPaid": false,
      "sessionDescription": "Free consultation session"
    },
    {
      "startTime": "2025-10-12T14:00:00",
      "endTime": "2025-10-12T17:00:00",
      "isPaid": true,
      "price": 50.00,
      "sessionDescription": "Advanced tutoring session"
    }
  ]
}
```

**Success Response (200 OK)**:
```json
{
  "message": "Availability updated successfully",
  "availabilities": [
    {
      "availability_id": "550e8400-e29b-41d4-a716-446655440000",
      "teacher_id": "teacher-uuid-123",
      "start_time": "2025-10-12T03:30:00.000Z",
      "end_time": "2025-10-12T06:30:00.000Z",
      "is_paid": false,
      "price_per_session": null,
      "session_description": "Free consultation session",
      "is_booked": false,
      "created_at": "2025-10-11T12:00:00.000Z"
    }
  ]
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3004/api/scheduling/availability \
  -H "Content-Type: application/json" \
  -H "x-user-id: teacher-uuid-123" \
  -H "x-user-role: teacher" \
  -d '{
    "availabilities": [
      {
        "startTime": "2025-10-12T19:00:00",
        "endTime": "2025-10-12T20:00:00",
        "isPaid": true,
        "price": 75.00,
        "sessionDescription": "Evening tutoring session"
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
  "x-user-id": "teacher-uuid-123",
  "x-user-role": "teacher"
}
```

**Request Body**:
```json
{
  "title": "Mastering Quadratic Equations",
  "description": "An in-depth look at factoring and solving quadratic equations with real-world applications.",
  "startTime": "2025-10-12T14:00:00",
  "endTime": "2025-10-12T15:00:00",
  "isPaid": true,
  "price": 500.00,
  "maxAttendees": 20
}
```

**Success Response (201 Created)**:
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "teacher_id": "teacher-uuid-123",
  "session_type": "GROUP",
  "title": "Mastering Quadratic Equations",
  "description": "An in-depth look at factoring and solving quadratic equations with real-world applications.",
  "start_time": "2025-10-12T08:30:00.000Z",
  "end_time": "2025-10-12T09:30:00.000Z",
  "status": "SCHEDULED",
  "is_paid": true,
  "price": 500,
  "max_attendees": 20,
  "zoom_join_url": "https://us05web.zoom.us/j/123456789?pwd=abc123",
  "zoom_start_url": "https://us05web.zoom.us/s/123456789?zak=xyz789",
  "zoom_meeting_id": "123456789",
  "zoom_password": "abc123",
  "video_conference_link": "https://us05web.zoom.us/j/123456789?pwd=abc123",
  "attendees_count": 0,
  "created_at": "2025-10-11T12:00:00.000Z"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3004/api/scheduling/group-sessions \
  -H "Content-Type: application/json" \
  -H "x-user-id: teacher-uuid-123" \
  -H "x-user-role: teacher" \
  -d '{
    "title": "Advanced Mathematics",
    "description": "Calculus and beyond",
    "startTime": "2025-10-12T19:00:00",
    "endTime": "2025-10-12T20:00:00",
    "isPaid": true,
    "price": 25.00,
    "maxAttendees": 10
  }'
```

---

### 3. Get Teacher Sessions
**Endpoint**: `GET /api/scheduling/me/sessions`
**Description**: Retrieves all sessions for the authenticated teacher

**Headers**:
```json
{
  "x-user-id": "teacher-uuid-123",
  "x-user-role": "teacher"
}
```

**Success Response (200 OK)**:
```json
[
  {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "teacher_id": "teacher-uuid-123",
    "session_type": "ONE_ON_ONE",
    "title": "Advanced tutoring session",
    "description": "Advanced tutoring session",
    "start_time": "2025-10-12T08:30:00.000Z",
    "end_time": "2025-10-12T09:30:00.000Z",
    "status": "SCHEDULED",
    "is_paid": true,
    "price": 75,
    "max_attendees": 1,
    "zoom_join_url": "https://us05web.zoom.us/j/123456789?pwd=abc123",
    "zoom_start_url": "https://us05web.zoom.us/s/123456789?zak=xyz789",
    "zoom_meeting_id": "123456789",
    "zoom_password": "abc123",
    "video_conference_link": "https://us05web.zoom.us/j/123456789?pwd=abc123",
    "attendees_count": 1,
    "created_at": "2025-10-11T12:00:00.000Z"
  }
]
```

**cURL Example**:
```bash
curl -X GET http://localhost:3004/api/scheduling/me/sessions \
  -H "x-user-id: teacher-uuid-123" \
  -H "x-user-role: teacher"
```

---

## 👨‍🎓 Student APIs

### 4. View Teacher Availability
**Endpoint**: `GET /api/scheduling/teachers/{teacherId}/availability`
**Description**: Retrieves open, unbooked time slots for a specific teacher with pricing information

**Headers**:
```json
{
  "x-user-id": "student-uuid-456",
  "x-user-role": "student"
}
```

**URL Parameters**:
- `teacherId` (string, required): The UUID of the teacher

**Success Response (200 OK)**:
```json
[
  {
    "availability_id": "770e8400-e29b-41d4-a716-446655440002",
    "teacher_id": "teacher-uuid-123",
    "start_time": "2025-10-12T03:30:00.000Z",
    "end_time": "2025-10-12T06:30:00.000Z",
    "is_booked": false,
    "is_paid": false,
    "price_per_session": null,
    "session_description": "Free consultation session",
    "created_at": "2025-10-11T12:00:00.000Z"
  },
  {
    "availability_id": "880e8400-e29b-41d4-a716-446655440003",
    "teacher_id": "teacher-uuid-123",
    "start_time": "2025-10-12T08:30:00.000Z",
    "end_time": "2025-10-12T11:30:00.000Z",
    "is_booked": false,
    "is_paid": true,
    "price_per_session": 50.00,
    "session_description": "Advanced tutoring session",
    "created_at": "2025-10-11T12:00:00.000Z"
  }
]
```

**cURL Example**:
```bash
curl -X GET http://localhost:3004/api/scheduling/teachers/teacher-uuid-123/availability \
  -H "x-user-id: student-uuid-456" \
  -H "x-user-role: student"
```

---

### 5. Browse Group Sessions
**Endpoint**: `GET /api/scheduling/group-sessions`
**Description**: Retrieves all upcoming, open group sessions

**Headers**:
```json
{
  "x-user-id": "student-uuid-456",
  "x-user-role": "student"
}
```

**Success Response (200 OK)**:
```json
[
  {
    "session_id": "990e8400-e29b-41d4-a716-446655440004",
    "teacher_id": "teacher-uuid-456",
    "session_type": "GROUP",
    "title": "Advanced Calculus Workshop",
    "description": "Deep dive into differential and integral calculus.",
    "start_time": "2025-10-12T09:30:00.000Z",
    "end_time": "2025-10-12T11:30:00.000Z",
    "status": "SCHEDULED",
    "is_paid": true,
    "price": 750,
    "max_attendees": 15,
    "zoom_join_url": "https://us05web.zoom.us/j/987654321?pwd=def456",
    "video_conference_link": "https://us05web.zoom.us/j/987654321?pwd=def456",
    "attendees_count": 8,
    "created_at": "2025-10-11T10:00:00.000Z"
  }
]
```

**cURL Example**:
```bash
curl -X GET http://localhost:3004/api/scheduling/group-sessions \
  -H "x-user-id: student-uuid-456" \
  -H "x-user-role: student"
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
  "x-user-role": "student"
}
```

**Request Body**:
```json
{
  "availabilityId": "770e8400-e29b-41d4-a716-446655440002"
}
```

**Success Response (201 Created) - Paid Session**:
```json
{
  "session_id": "bb0e8400-e29b-41d4-a716-446655440006",
  "teacher_id": "teacher-uuid-123",
  "session_type": "ONE_ON_ONE",
  "title": "Advanced tutoring session",
  "description": "Advanced tutoring session",
  "start_time": "2025-10-12T08:30:00.000Z",
  "end_time": "2025-10-12T09:30:00.000Z",
  "status": "SCHEDULED",
  "is_paid": true,
  "price": 50.00,
  "max_attendees": 1,
  "zoom_join_url": "https://us05web.zoom.us/j/123456789?pwd=abc123",
  "video_conference_link": "https://us05web.zoom.us/j/123456789?pwd=abc123",
  "attendees_count": 1,
  "created_at": "2025-10-11T12:30:00.000Z"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3004/api/scheduling/book-session \
  -H "Content-Type: application/json" \
  -H "x-user-id: student-uuid-456" \
  -H "x-user-role: student" \
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
  "x-user-id": "student-uuid-456",
  "x-user-role": "student"
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
  "teacher_id": "teacher-uuid-456",
  "session_type": "GROUP",
  "title": "Free Physics Study Group",
  "description": "Collaborative problem-solving session.",
  "start_time": "2025-10-12T04:30:00.000Z",
  "end_time": "2025-10-12T06:30:00.000Z",
  "status": "SCHEDULED",
  "is_paid": false,
  "price": null,
  "max_attendees": 25,
  "zoom_join_url": "https://us05web.zoom.us/j/987654321?pwd=def456",
  "video_conference_link": "https://us05web.zoom.us/j/987654321?pwd=def456",
  "attendees_count": 13,
  "created_at": "2025-10-11T10:00:00.000Z"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3004/api/scheduling/enroll-group-session \
  -H "Content-Type: application/json" \
  -H "x-user-id: student-uuid-456" \
  -H "x-user-role: student" \
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
  "x-user-id": "student-uuid-456",
  "x-user-role": "student"
}
```

**Success Response (200 OK)**:
```json
[
  {
    "session_id": "bb0e8400-e29b-41d4-a716-446655440006",
    "teacher_id": "teacher-uuid-123",
    "session_type": "ONE_ON_ONE",
    "title": "Advanced tutoring session",
    "description": "Advanced tutoring session",
    "start_time": "2025-10-12T08:30:00.000Z",
    "end_time": "2025-10-12T09:30:00.000Z",
    "status": "SCHEDULED",
    "is_paid": true,
    "price": 50.00,
    "max_attendees": 1,
    "zoom_join_url": "https://us05web.zoom.us/j/123456789?pwd=abc123",
    "video_conference_link": "https://us05web.zoom.us/j/123456789?pwd=abc123",
    "attendees_count": 1,
    "created_at": "2025-10-11T12:30:00.000Z"
  }
]
```

**cURL Example**:
```bash
curl -X GET http://localhost:3004/api/scheduling/me/sessions \
  -H "x-user-id: student-uuid-456" \
  -H "x-user-role: student"
```

---

## 🧪 Testing Scenarios

### Environment Variables for Testing
```json
{
  "baseUrl": "http://localhost:3004",
  "teacherId": "teacher-550e8400-e29b-41d4-a716-446655440000",
  "teacherRole": "teacher",
  "studentId": "student-660e8400-e29b-41d4-a716-446655440001",
  "studentRole": "student"
}
```

### Common Error Responses

**Missing Authentication Headers (401)**:
```json
{
  "statusCode": 401,
  "message": "Missing user authentication headers",
  "error": "Unauthorized"
}
```

**Wrong Role Access (403)**:
```json
{
  "statusCode": 403,
  "message": "Access denied: teacher role required",
  "error": "Forbidden"
}
```

**Past Time Validation (400)**:
```json
{
  "statusCode": 400,
  "message": "Cannot create availability in the past. Start time 04:00:00 PM must be at least 5 minutes after current time 05:26:00 PM (Sri Lanka time).",
  "error": "Bad Request"
}
```

**Zoom Meeting Creation Error (500)**:
```json
{
  "statusCode": 500,
  "message": "Failed to create Zoom meeting: Invalid access token, does not contain scopes:[meeting:write:meeting]",
  "error": "Internal Server Error"
}
```

---

## 📋 Key Features

### ✅ **Individual Session Pricing Transparency**
- Teachers set pricing when creating availability
- Students see exact costs before booking
- Support for both free and paid sessions

### ✅ **Sri Lanka Timezone Support**
- Send times in Sri Lankan format: `"2025-10-12T19:00:00"`
- Database stores in UTC with timezone info
- Past time validation works with Sri Lankan time

### ✅ **Professional Zoom Integration**
- Real Zoom meetings for all sessions
- Students get join URLs only
- Teachers get both join and start URLs
- Meeting passwords for security

### ✅ **Role-Based Access Control**
- Simple two-role system: teacher and student
- Automatic role validation on all endpoints
- Clear error messages for access violations

---

This guide now consistently shows both `x-user-id` and `x-user-role` headers throughout all examples, which matches your system requirements! 🎯