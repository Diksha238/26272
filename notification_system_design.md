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
1. Student logs in → WebSocket connection establish hoti hai
2. Jab bhi naya notification aata hai server pe → server us student ke socket pe emit karta hai
3. Frontend instantly notification receive karta hai without page reload

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