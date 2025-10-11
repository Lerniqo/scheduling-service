# API Testing Documentation - Zoom Integration

This document provides comprehensive testing information for all API endpoints in the Scheduling Service with **Enterprise Zoom Integration**.

## Base URL
```
http://localhost:3004
```

## Authentication Headers
All API endpoints require these headers:
- `x-user-id`: User identifier (string)
- `x-user-role`: User role (teacher/student)  
- `x-user-permissions`: JSON array of permissions

## 🎥 Zoom Integration Overview

The scheduling service now creates **real Zoom meetings** for every session using enterprise Zoom API credentials:
- **Account ID**: `byEO6UxCT0G6QMBqE2C9-Q`
- **Server-to-Server OAuth** authentication
- **Automatic meeting creation** with security features
- **Meeting passwords** and **waiting rooms** for enhanced control

## API Endpoints

### 1. Health Check Endpoints

#### 1.1 Liveness Check
```bash
curl -X GET "http://localhost:3004/health/live"
```

**Response:**
```json
{
  "status": "ok",
  "info": {},
  "error": {},
  "details": {}
}
```

#### 1.2 Readiness Check  
```bash
curl -X GET "http://localhost:3004/health/ready"
```

**Response:**
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    }
  }
}
```

### 2. Teacher Availability Management

#### 2.1 Create Availability Slot
```bash
curl -X POST "http://localhost:3004/api/scheduling/availability" \
  -H "Content-Type: application/json" \
  -H "x-user-id: teacher123" \
  -H "x-user-role: teacher" \
  -H "x-user-permissions: [\"create_availability\"]" \
  -d '{
    "startTime": "2024-12-15T10:00:00.000Z",
    "endTime": "2024-12-15T11:00:00.000Z"
  }'
```

**Response:**
```json
{
  "availability_id": "uuid-string",
  "teacher_id": "uuid-string", 
  "start_time": "2024-12-15T10:00:00.000Z",
  "end_time": "2024-12-15T11:00:00.000Z",
  "is_booked": false,
  "created_at": "2024-12-10T12:00:00.000Z",
  "updated_at": "2024-12-10T12:00:00.000Z"
}
```

#### 2.2 Get Teacher's Availability
```bash
curl -X GET "http://localhost:3004/api/scheduling/teachers/teacher123/availability" \
  -H "x-user-id: teacher123" \
  -H "x-user-role: teacher" \
  -H "x-user-permissions: [\"view_availability\"]"
```

**Response:**
```json
[
  {
    "availability_id": "uuid-string",
    "teacher_id": "uuid-string",
    "start_time": "2024-12-15T10:00:00.000Z", 
    "end_time": "2024-12-15T11:00:00.000Z",
    "is_booked": false,
    "created_at": "2024-12-10T12:00:00.000Z",
    "updated_at": "2024-12-10T12:00:00.000Z"
  }
]
```

### 3. Session Management with Real Zoom Meetings

#### 3.1 Create Group Session 🎯
**Creates actual Zoom meeting with enterprise features**

```bash
curl -X POST "http://localhost:3004/api/scheduling/group-sessions" \
  -H "Content-Type: application/json" \
  -H "x-user-id: teacher123" \
  -H "x-user-role: teacher" \
  -H "x-user-permissions: [\"create_group_session\"]" \
  -d '{
    "title": "Advanced Mathematics Tutorial",
    "description": "Learn calculus fundamentals",
    "startTime": "2024-12-20T14:00:00.000Z",
    "endTime": "2024-12-20T15:30:00.000Z", 
    "maxAttendees": 8,
    "isPaid": true,
    "price": 25.00
  }'
```

**Response with Enterprise Zoom Meeting:**
```json
{
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "teacher_id": "teacher-uuid-converted-from-teacher123",
  "session_type": "GROUP",
  "title": "Advanced Mathematics Tutorial",
  "description": "Learn calculus fundamentals", 
  "start_time": "2024-12-20T14:00:00.000Z",
  "end_time": "2024-12-20T15:30:00.000Z",
  "status": "SCHEDULED",
  "is_paid": true,
  "price": 25.00,
  "max_attendees": 8,
  "video_conference_link": "https://us05web.zoom.us/j/123456789?pwd=AbCdEf123456",
  "attendees_count": 0,
  "zoom_meeting_id": "123456789",
  "zoom_join_url": "https://us05web.zoom.us/j/123456789?pwd=AbCdEf123456",
  "zoom_start_url": "https://us05web.zoom.us/s/123456789?zak=xyz789abc123",
  "zoom_password": "AbC123dE"
}
```

#### 3.2 Book One-on-One Session 👥
**Creates personal Zoom meeting for individual tutoring**

```bash
curl -X POST "http://localhost:3004/api/scheduling/book-session" \
  -H "Content-Type: application/json" \
  -H "x-user-id: student456" \
  -H "x-user-role: student" \
  -H "x-user-permissions: [\"book_session\"]" \
  -d '{
    "availabilityId": "availability-uuid-from-teacher"
  }'
```

**Response with Personal Zoom Meeting:**
```json
{
  "session_id": "x9y8z7w6-v5u4-3210-stuv-wx9876543210",
  "teacher_id": "teacher-uuid-from-availability", 
  "session_type": "ONE_ON_ONE",
  "title": "One-on-One Session",
  "start_time": "2024-12-15T10:00:00.000Z",
  "end_time": "2024-12-15T11:00:00.000Z",
  "status": "SCHEDULED",
  "is_paid": false,
  "max_attendees": 1,
  "video_conference_link": "https://us05web.zoom.us/j/987654321?pwd=XyZ789aBc",
  "attendees_count": 1,
  "zoom_meeting_id": "987654321",
  "zoom_join_url": "https://us05web.zoom.us/j/987654321?pwd=XyZ789aBc",
  "zoom_start_url": "https://us05web.zoom.us/s/987654321?zak=def456ghi",
  "zoom_password": "XyZ456gH"
}
```

#### 3.3 Enroll in Group Session 📚
**Join existing group session with Zoom meeting details**

```bash
curl -X POST "http://localhost:3004/api/scheduling/enroll-group-session" \
  -H "Content-Type: application/json" \
  -H "x-user-id: student456" \
  -H "x-user-role: student" \
  -H "x-user-permissions: [\"enroll_group_session\"]" \
  -d '{
    "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }'
```

**Response (Free Session) with Zoom Access:**
```json
{
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "teacher_id": "teacher-uuid",
  "session_type": "GROUP", 
  "title": "Advanced Mathematics Tutorial",
  "description": "Learn calculus fundamentals",
  "start_time": "2024-12-20T14:00:00.000Z",
  "end_time": "2024-12-20T15:30:00.000Z",
  "status": "SCHEDULED",
  "is_paid": false,
  "max_attendees": 8,
  "video_conference_link": "https://us05web.zoom.us/j/123456789?pwd=AbCdEf123456",
  "attendees_count": 2,
  "zoom_meeting_id": "123456789",
  "zoom_join_url": "https://us05web.zoom.us/j/123456789?pwd=AbCdEf123456",
  "zoom_start_url": "https://us05web.zoom.us/s/123456789?zak=xyz789abc123",
  "zoom_password": "AbC123dE"
}
```

**Response (Paid Session - Requires Payment):**
```json
{
  "checkoutSessionId": "checkout_1702730400000_abc123def"
}
```

#### 3.4 Get Available Group Sessions 🔍
**Browse all open group sessions with Zoom meeting info**

```bash
curl -X GET "http://localhost:3004/api/scheduling/group-sessions" \
  -H "x-user-id: student456" \
  -H "x-user-role: student" \
  -H "x-user-permissions: [\"view_group_sessions\"]"
```

**Response with Zoom Integration:**
```json
[
  {
    "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "teacher_id": "teacher-uuid",
    "session_type": "GROUP",
    "title": "Advanced Mathematics Tutorial", 
    "description": "Learn calculus fundamentals",
    "start_time": "2024-12-20T14:00:00.000Z",
    "end_time": "2024-12-20T15:30:00.000Z",
    "status": "SCHEDULED",
    "is_paid": true,
    "price": 25.00,
    "max_attendees": 8,
    "video_conference_link": "https://us05web.zoom.us/j/123456789?pwd=AbCdEf123456",
    "attendees_count": 3,
    "zoom_meeting_id": "123456789",
    "zoom_join_url": "https://us05web.zoom.us/j/123456789?pwd=AbCdEf123456",
    "zoom_start_url": "https://us05web.zoom.us/s/123456789?zak=xyz789abc123",
    "zoom_password": "AbC123dE"
  }
]
```

#### 3.5 Get User's Sessions 📋
**View all user sessions (teacher or student perspective)**

```bash
curl -X GET "http://localhost:3004/api/scheduling/me/sessions" \
  -H "x-user-id: teacher123" \
  -H "x-user-role: teacher" \
  -H "x-user-permissions: [\"view_my_sessions\"]"
```

**Response with Complete Zoom Details:**
```json
[
  {
    "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "teacher_id": "teacher-uuid",
    "session_type": "GROUP",
    "title": "Advanced Mathematics Tutorial",
    "description": "Learn calculus fundamentals",
    "start_time": "2024-12-20T14:00:00.000Z", 
    "end_time": "2024-12-20T15:30:00.000Z",
    "status": "SCHEDULED",
    "is_paid": true,
    "price": 25.00,
    "max_attendees": 8,
    "video_conference_link": "https://us05web.zoom.us/j/123456789?pwd=AbCdEf123456",
    "attendees_count": 3,
    "zoom_meeting_id": "123456789",
    "zoom_join_url": "https://us05web.zoom.us/j/123456789?pwd=AbCdEf123456",
    "zoom_start_url": "https://us05web.zoom.us/s/123456789?zak=xyz789abc123",
    "zoom_password": "AbC123dE"
  }
]
```

## 🔧 Zoom Integration Features

### 🎥 Enterprise Meeting Creation
- **Real Zoom meetings** created using enterprise API credentials
- **Server-to-Server OAuth** for secure, unattended operation
- **Scheduled meetings** with precise timing and duration
- **Meeting IDs** and **passwords** for secure access

### 🔐 Advanced Security Features
- **Automatic password generation** for all meetings
- **Waiting rooms** enabled for group sessions (teacher approval required)
- **Host-controlled meeting start** (teachers must initiate)
- **Multiple device support** for flexible access

### 📱 Complete Access Methods
- **`zoom_join_url`**: Direct participant access with embedded password
- **`zoom_start_url`**: Teacher/host control URL with full permissions
- **`zoom_meeting_id` + `zoom_password`**: Traditional meeting access
- **`video_conference_link`**: Quick access (alias for join_url)

### ⚙️ Smart Meeting Configuration
**Group Sessions:**
- Waiting room enabled ✅
- Participants muted on entry ✅ 
- Host approval required ✅
- Recording disabled by default ✅

**One-on-One Sessions:**
- Direct access (no waiting room) ✅
- Host and participant video enabled ✅
- Secure password protection ✅
- Private meeting environment ✅

## Error Responses

### 400 Bad Request
```json
{
  "message": "startTime and endTime must be valid ISO dates",
  "error": "Bad Request",
  "statusCode": 400
}
```

### 404 Not Found
```json
{
  "message": "Session not found", 
  "error": "Not Found",
  "statusCode": 404
}
```

### 409 Conflict
```json
{
  "message": "This time slot is already booked",
  "error": "Conflict", 
  "statusCode": 409
}
```

### 500 Internal Server Error (Zoom API Issues)
```json
{
  "message": "Failed to create Zoom meeting",
  "error": "Internal Server Error",
  "statusCode": 500
}
```

### 🔒 Zoom Authentication Errors
```json
{
  "message": "Failed to authenticate with Zoom API",
  "error": "Internal Server Error",
  "statusCode": 500
}
```

## 🧪 Testing Guidelines

### 1. **Date & Time Handling**
- Use ISO 8601 format: `"2024-12-15T10:00:00.000Z"`
- All times processed in UTC
- Meeting duration calculated automatically

### 2. **Authentication Requirements**
- All endpoints require proper `x-user-*` headers
- UUIDs generated automatically for all entities
- String user IDs converted to UUIDs deterministically

### 3. **Zoom Meeting Behavior**
- Real meetings created on Zoom servers
- Meeting links active immediately after creation
- Passwords required for all meeting access
- Meetings scheduled with proper start times

### 4. **Session Management**
- Sessions start with `"SCHEDULED"` status
- Group sessions support multiple attendees
- One-on-one sessions limited to single student
- Paid sessions require checkout flow

### 5. **Video Conferencing Access**
- **Teachers**: Use `zoom_start_url` for full meeting control
- **Students**: Use `zoom_join_url` for participant access
- **Mobile Apps**: Use `zoom_meeting_id` + `zoom_password`
- **Web Browsers**: Use `video_conference_link` (same as join_url)

## 🌍 Environment Configuration

### Required Zoom API Credentials:
```bash
ZOOM_ACCOUNT_ID=byEO6UxCT0G6QMBqE2C9-Q
ZOOM_CLIENT_ID=_NOg1l7zRfiTsGKqjBz5RQ
ZOOM_CLIENT_SECRET=apLlxpRqMo7VomCIxo81hljAeficvNMf
```

### Database Connection:
```bash
DATABASE_URL=postgresql://neondb_owner:password@host/neondb?sslmode=require
PORT=3004
```

## 📊 Database Schema Updates

### Enhanced `scheduled_sessions` Table:
```sql
-- Original fields
session_id UUID PRIMARY KEY
teacher_id UUID NOT NULL
session_type ENUM('ONE_ON_ONE', 'GROUP')
title VARCHAR(255)
description TEXT
start_time TIMESTAMP NOT NULL
end_time TIMESTAMP NOT NULL
status ENUM('SCHEDULED', 'COMPLETED', 'CANCELED')
is_paid BOOLEAN DEFAULT false
price DECIMAL(10,2)
max_attendees INTEGER
video_conference_link VARCHAR(500)

-- New Zoom Integration fields
zoom_meeting_id VARCHAR(255)     -- Zoom meeting identifier
zoom_join_url TEXT               -- Participant access URL
zoom_start_url TEXT              -- Host control URL  
zoom_password VARCHAR(50)        -- Meeting password

-- Audit timestamps
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()
```

### Supporting Tables:
- `teacher_availability` - Available time slots
- `session_attendees` - Student enrollments with Zoom access
- Database includes full UUID support and proper constraints

## 🚀 Production Ready Features

✅ **Enterprise Zoom Integration** with real meeting creation  
✅ **OAuth 2.0 Server-to-Server** authentication  
✅ **Automatic password generation** for meeting security  
✅ **Waiting room control** for group session management  
✅ **Multiple access methods** (web, mobile, desktop)  
✅ **Database schema** with proper UUID handling  
✅ **Error handling** for Zoom API failures  
✅ **Session lifecycle management** with real video conferencing  

This scheduling service is now production-ready with enterprise-grade video conferencing capabilities!