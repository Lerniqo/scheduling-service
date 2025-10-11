# Complete Postman Testing Guide for Scheduling Service

## 🚀 Base Configuration

**Base URL:** `http://localhost:3004` (Based on main.ts - port 3004)

## 📋 All API Endpoints with Complete Postman Setup

---

## 1. 🏥 Health Check APIs

### 1.1 Liveness Check
**Method:** `GET`  
**URL:** `{{base_url}}/health/live`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:** None (GET request)

**Expected Response:**
```json
{
  "status": "ok",
  "info": {
    "memory_heap": {
      "status": "up"
    }
  }
}
```

---

### 1.2 Readiness Check
**Method:** `GET`  
**URL:** `{{base_url}}/health/ready`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:** None (GET request)

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

---

## 2. 🏠 Root Endpoint

### 2.1 Get Hello Message
**Method:** `GET`  
**URL:** `{{base_url}}/`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:** None (GET request)

**Expected Response:**
```json
"Hello World!"
```

---

## 3. 📅 Availability Management APIs

### 3.1 Update Teacher Availability (Teacher Only)
**Method:** `POST`  
**URL:** `{{base_url}}/api/scheduling/availability`

**Authorization Headers:**
```json
{
  "Content-Type": "application/json",
  "x-user-id": "teacher123",
  "x-user-role": "teacher",
  "x-user-permissions": "manage_availability"
}
```

**JSON Body:**
```json
{
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
}
```

**Expected Response:**
```json
{
  "message": "Availability updated."
}
```

---

### 3.2 Get Teacher Availability (Student/Teacher)
**Method:** `GET`  
**URL:** `{{base_url}}/api/scheduling/teachers/teacher123/availability`

**Authorization Headers (Student):**
```json
{
  "Content-Type": "application/json",
  "x-user-id": "student456",
  "x-user-role": "student",
  "x-user-permissions": "view_availability"
}
```

**Authorization Headers (Teacher):**
```json
{
  "Content-Type": "application/json",
  "x-user-id": "teacher123",
  "x-user-role": "teacher",
  "x-user-permissions": "view_availability"
}
```

**Body:** None (GET request)

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
  }
]
```

---

## 4. 🎯 Session Scheduling APIs

### 4.1 Create Group Session (Teacher Only)
**Method:** `POST`  
**URL:** `{{base_url}}/api/scheduling/group-sessions`

**Authorization Headers:**
```json
{
  "Content-Type": "application/json",
  "x-user-id": "teacher123",
  "x-user-role": "teacher",
  "x-user-permissions": "create_session"
}
```

**JSON Body (Paid Session):**
```json
{
  "title": "Advanced JavaScript Workshop",
  "description": "Deep dive into advanced JavaScript concepts including async/await, closures, and design patterns",
  "startTime": "2025-10-15T16:00:00.000Z",
  "endTime": "2025-10-15T18:00:00.000Z",
  "maxAttendees": 15,
  "isPaid": true,
  "price": 49.99
}
```

**JSON Body (Free Session):**
```json
{
  "title": "Intro to Python Programming",
  "description": "Basic Python concepts for beginners",
  "startTime": "2025-10-16T14:00:00.000Z",
  "endTime": "2025-10-16T15:30:00.000Z",
  "maxAttendees": 20,
  "isPaid": false
}
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

---

### 4.2 Get All Group Sessions (Student/Teacher)
**Method:** `GET`  
**URL:** `{{base_url}}/api/scheduling/group-sessions`

**Authorization Headers (Student):**
```json
{
  "Content-Type": "application/json",
  "x-user-id": "student456",
  "x-user-role": "student",
  "x-user-permissions": "view_sessions"
}
```

**Authorization Headers (Teacher):**
```json
{
  "Content-Type": "application/json",
  "x-user-id": "teacher123",
  "x-user-role": "teacher",
  "x-user-permissions": "view_sessions"
}
```

**Body:** None (GET request)

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

---

### 4.3 Book One-on-One Session (Student Only)
**Method:** `POST`  
**URL:** `{{base_url}}/api/scheduling/book-session`

**Authorization Headers:**
```json
{
  "Content-Type": "application/json",
  "x-user-id": "student456",
  "x-user-role": "student",
  "x-user-permissions": "book_session"
}
```

**JSON Body:**
```json
{
  "availabilityId": "550e8400-e29b-41d4-a716-446655440001"
}
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

---

### 4.4 Enroll in Group Session (Student Only)
**Method:** `POST`  
**URL:** `{{base_url}}/api/scheduling/enroll-group-session`

**Authorization Headers:**
```json
{
  "Content-Type": "application/json",
  "x-user-id": "student456",
  "x-user-role": "student",
  "x-user-permissions": "enroll_session"
}
```

**JSON Body:**
```json
{
  "sessionId": "770a0600-04bd-63f6-c938-668877662001"
}
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

---

### 4.5 Get My Sessions (Teacher/Student)
**Method:** `GET`  
**URL:** `{{base_url}}/api/scheduling/me/sessions`

**Authorization Headers (Teacher):**
```json
{
  "Content-Type": "application/json",
  "x-user-id": "teacher123",
  "x-user-role": "teacher",
  "x-user-permissions": "view_my_sessions"
}
```

**Authorization Headers (Student):**
```json
{
  "Content-Type": "application/json",
  "x-user-id": "student456",
  "x-user-role": "student",
  "x-user-permissions": "view_my_sessions"
}
```

**Body:** None (GET request)

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
  }
]
```

---

## 🎯 Postman Environment Variables

Create these environment variables in Postman:

```json
{
  "base_url": "http://localhost:3004",
  "teacher_id": "teacher123",
  "student_id": "student456",
  "teacher_role": "teacher",
  "student_role": "student",
  "teacher_permissions": "manage_availability,create_session,view_sessions,view_my_sessions,view_availability",
  "student_permissions": "view_availability,book_session,enroll_session,view_sessions,view_my_sessions"
}
```

## 🔐 Required Permission Matrix

| Role | Required Permissions |
|------|---------------------|
| **Teacher** | `manage_availability`, `create_session`, `view_sessions`, `view_my_sessions`, `view_availability` |
| **Student** | `view_availability`, `book_session`, `enroll_session`, `view_sessions`, `view_my_sessions` |

## ⚠️ Important Notes for Testing

1. **Port:** Service runs on **port 3004** (not 3000)
2. **UUID Format:** All IDs accept both string format (converted to UUID) and UUID format
3. **Time Format:** All timestamps must be in ISO 8601 format with `.000Z` suffix
4. **Headers:** All three headers (`x-user-id`, `x-user-role`, `x-user-permissions`) are **required** for all API calls except health endpoints
5. **Permissions:** Use **underscores** in permissions (e.g., `manage_availability`, not `manage:availability`)

## 🧪 Error Response Examples

### 401 Unauthorized (Missing Headers)
```json
{
  "statusCode": 401,
  "message": "Missing user authentication headers",
  "error": "Unauthorized"
}
```

### 403 Forbidden (Wrong Role)
```json
{
  "statusCode": 403,
  "message": "Only teachers can create group sessions",
  "error": "Forbidden"
}
```

### 403 Forbidden (Missing Permission)
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions to manage availability",
  "error": "Forbidden"
}
```

### 400 Bad Request (Validation Error)
```json
{
  "statusCode": 400,
  "message": [
    "startTime must be a valid ISO 8601 date string",
    "endTime must be a valid ISO 8601 date string"
  ],
  "error": "Bad Request"
}
```

## 🚀 Testing Workflow Recommendations

### Complete Teacher Workflow:
1. Update availability → `POST /api/scheduling/availability`
2. Create group session → `POST /api/scheduling/group-sessions`
3. View my sessions → `GET /api/scheduling/me/sessions`

### Complete Student Workflow:
1. View teacher availability → `GET /api/scheduling/teachers/teacher123/availability`
2. Book one-on-one session → `POST /api/scheduling/book-session`
3. View group sessions → `GET /api/scheduling/group-sessions`
4. Enroll in group session → `POST /api/scheduling/enroll-group-session`
5. View my sessions → `GET /api/scheduling/me/sessions`