const axios = require('axios');

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJkaWtzaGEuMjYyNzJAZ2duaW5kaWEuZHJvbmFjaGFyeWEuaW5mbyIsImV4cCI6MTc3Nzg3NjQ1MiwiaWF0IjoxNzc3ODc1NTUyLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiNGM0YTA4NjAtZWQzYy00ZTZkLTk0NDgtYzQ2MTNjM2VhOGY0IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiZGlrc2hhIG5hZ3BhbCIsInN1YiI6Ijc2YmVkN2RjLWVlNGMtNDE5Zi04YTdjLTA5MThjZDI0OWUwZiJ9LCJlbWFpbCI6ImRpa3NoYS4yNjI3MkBnZ25pbmRpYS5kcm9uYWNoYXJ5YS5pbmZvIiwibmFtZSI6ImRpa3NoYSBuYWdwYWwiLCJyb2xsTm8iOiIyNjI3MiIsImFjY2Vzc0NvZGUiOiJ1a3NkV1QiLCJjbGllbnRJRCI6Ijc2YmVkN2RjLWVlNGMtNDE5Zi04YTdjLTA5MThjZDI0OWUwZiIsImNsaWVudFNlY3JldCI6Imp3Y2Rod0NVR0FwRG1rUXEifQ.vy0dNPBbaIIJFF9hGwrX1RB8Nsv90YF8XRaeemZuysA";

const headers = {
    "Authorization": `Bearer ${TOKEN}`
};

// Priority weights as per document
// Placement > Result > Event
const PRIORITY_WEIGHTS = {
    "Placement": 3,
    "Result": 2,
    "Event": 1
};

// Score calculate karo — weight + recency combined
function calculateScore(notification) {
    const weight = PRIORITY_WEIGHTS[notification.Type] || 0;
    const timestamp = new Date(notification.Timestamp).getTime();
    // Normalize timestamp to 0-1 range (recency score)
    const recencyScore = timestamp / Date.now();
    // Final score = weight (main factor) + recency (tiebreaker)
    return weight + recencyScore;
}

// Top N notifications fetch karo by priority
function getTopN(notifications, n) {
    return notifications
        .map(notif => ({
            ...notif,
            priorityScore: calculateScore(notif)
        }))
        .sort((a, b) => b.priorityScore - a.priorityScore)
        .slice(0, n);
}

async function main() {
    try {
        console.log("Fetching notifications...");
        const res = await axios.get(
            "http://20.207.122.201/evaluation-service/notifications",
            { headers }
        );

        const notifications = res.data.notifications;
        console.log(`Total notifications: ${notifications.length}\n`);

        const TOP_N = 10;
        const topNotifications = getTopN(notifications, TOP_N);

        console.log(`=== TOP ${TOP_N} PRIORITY NOTIFICATIONS ===\n`);
        topNotifications.forEach((notif, index) => {
            console.log(`${index + 1}. [${notif.Type}] ${notif.Message}`);
            console.log(`   ID: ${notif.ID}`);
            console.log(`   Timestamp: ${notif.Timestamp}`);
            console.log(`   Priority Score: ${notif.priorityScore.toFixed(6)}`);
            console.log();
        });

    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
    }
}

main();