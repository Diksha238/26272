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
# Stage 3

## Query Analysis & Optimization

### Original Query:
```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt DESC;
```

### Is this query accurate?
yes, the query is logically correct  — the unread notifications of each student are fetched, first the newest.

### Why is it slow?
1. **No index** on `studentID` or `isRead` or `createdAt`
   — full table is scanning all 5,000,000 rows 
2. **SELECT \*** — all the unnecessary columns are also fetching
3. **isRead = false** — on low cardinality column filter is slow

### What would I change?
1. 
```sql
CREATE INDEX idx_notifications_student_unread
ON notifications(studentID, isRead, createdAt DESC);
```
2. 
```sql
SELECT id, notificationType, message, createdAt
FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt DESC;
```
3. 
```sql
SELECT id, notificationType, message, createdAt
FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt DESC
LIMIT 20 OFFSET 0;
```

### Computation Cost After Fix:
- Index : O(log n) instead of O(n)
- 5M rows pe dramatically faster query

---

### Should we add indexes on every column?
**NO.** 

**Why?**
- Every index takes wxtra storage
- INSERT/UPDATE/DELETE operations gets slow
  because on every write index also updates
- Only apply index on frequently queried columns 

---

### Find all students who got Placement notification in last 7 days:
```sql
SELECT DISTINCT studentID
FROM notifications
WHERE notificationType = 'Placement'
AND createdAt >= NOW() - INTERVAL '7 days';
```
# Stage 4

## Performance Optimization — Notifications Fetching

### Problem:
On every page load notifications are fetched from DB
For 50,000 students DB is overwhelming

---

### Solutions:

### 1. Caching (Redis)
**Strategy:**  Firstly fetch from Db and store on Redis 
Next time serve from Redis directly.
```
Request → Check Redis Cache
↓ HIT → Return cached data (fast!)
↓ MISS → Fetch from DB → Store in Redis → Return
```
**Tradeoffs:**
- DB load will drastically get slower
- Response time will be very fast
- Cache invalidation is very tricky
if new notification will come cahce will stale
  naya notification aaya toh cache stale ho jayega
-  Extra infrastructure (Redis server)

**Cache Invalidation:**
-  When new notification comes delete student cache
-  Set TTL (Time To Live)  — e.g. 60 seconds

---

### 2. Pagination
Dont't fetch all the notifications at same time
Fetch in groups of 20 
```
GET /api/v1/notifications?page=1&limit=20
```
**Tradeoffs:**
- ✅ There will be less load on DB
- ✅ Response size will get small
- ❌ In Frontend we will have to implement pagination logic 

---

### 3. Database Read Replicas
Write operations primary on DB , read operations on
replica DB.

**Tradeoffs:**
- ✅ Primary DB load will get low 
- ✅ High availability
- ❌ Replication lag 
- ❌ Complex setup

---

### 4. CDN / Edge Caching
chache Static or semi-static notifications on CDN

**Tradeoffs:**
- ✅ Geographically fast delivery
- ❌  Not suitable for Dynamic per user data 

---

### Recommended Approach:
**Redis Caching + Pagination** combination