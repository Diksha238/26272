# Stage 1

## Campus Notification Platform — REST API Design

### Core Actions the Platform Should Support
1. Get all notifications for a student
2. Mark a notification as read
3. Mark all notifications as read
4. Get unread notification count

---

### API Endpoints

#### 1. Get All Notifications
**GET** `/api/v1/notifications`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "Placement | Event | Result",
      "message": "string",
      "isRead": false,
      "createdAt": "2026-04-22T17:51:30Z"
    }
  ]
}
```

---

#### 2. Mark Single Notification as Read
**PATCH** `/api/v1/notifications/:id/read`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response:**
```json
{
  "message": "Notification marked as read",
  "id": "uuid"
}
```

---

#### 3. Mark All Notifications as Read
**PATCH** `/api/v1/notifications/read-all`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response:**
```json
{
  "message": "All notifications marked as read"
}
```

---

#### 4. Get Unread Count
**GET** `/api/v1/notifications/unread-count`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response:**
```json
{
  "unreadCount": 5
}
```

---

### Real-Time Notification Mechanism

Use **WebSockets** (Socket.io) for real-time delivery.

**Flow:**
1. Student logs in → WebSocket connection establishes
2. Whenever notification comes on server→ server emits on that student's socket
3. Frontend instantly receives notification without page reload
**WebSocket Event:**
```json
{
  "event": "new_notification",
  "data": {
    "id": "uuid",
    "type": "Placement",
    "message": "TCS hiring drive tomorrow",
    "createdAt": "2026-05-04T10:00:00Z"
  }
}
```
# Stage 2

## Persistent Storage — Database Choice

### Recommended DB: PostgreSQL

---

### DB Schema

```sql
-- Students Table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studentID UUID NOT NULL REFERENCES students(id),
  notificationType ENUM('Placement', 'Event', 'Result') NOT NULL,
  message TEXT NOT NULL,
  isRead BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

---

### Problems as Data Volume Increases

1. **Slow queries** — 50,000 students x many notifications = millions of rows
2. **Full table scan** 
3. **Storage bloat** 

### Solutions

1. **Indexes lagao** on `studentID` and `createdAt`
2. **Pagination** 
3. **Archiving** 

---

### Queries

#### Fetch all unread notifications for a student:
```sql
SELECT * FROM notifications
WHERE studentID = 'uuid-here'
AND isRead = false
ORDER BY createdAt DESC;
```

#### Fetch notifications by type:
```sql
SELECT * FROM notifications
WHERE studentID = 'uuid-here'
AND notificationType = 'Placement'
ORDER BY createdAt DESC;
```

#### Mark all as read:
```sql
UPDATE notifications
SET isRead = true
WHERE studentID = 'uuid-here'
AND isRead = false;
```