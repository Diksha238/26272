const axios = require('axios');

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJkaWtzaGEuMjYyNzJAZ2duaW5kaWEuZHJvbmFjaGFyeWEuaW5mbyIsImV4cCI6MTc3Nzg3MzAwMywiaWF0IjoxNzc3ODcyMTAzLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiYTJiYzAxNzMtNjI5ZC00MGJhLTgyYWMtNWMyZTBmZjI4MjJkIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiZGlrc2hhIG5hZ3BhbCIsInN1YiI6Ijc2YmVkN2RjLWVlNGMtNDE5Zi04YTdjLTA5MThjZDI0OWUwZiJ9LCJlbWFpbCI6ImRpa3NoYS4yNjI3MkBnZ25pbmRpYS5kcm9uYWNoYXJ5YS5pbmZvIiwibmFtZSI6ImRpa3NoYSBuYWdwYWwiLCJyb2xsTm8iOiIyNjI3MiIsImFjY2Vzc0NvZGUiOiJ1a3NkV1QiLCJjbGllbnRJRCI6Ijc2YmVkN2RjLWVlNGMtNDE5Zi04YTdjLTA5MThjZDI0OWUwZiIsImNsaWVudFNlY3JldCI6Imp3Y2Rod0NVR0FwRG1rUXEifQ.xbLxszWy-A30QtIqn7hGZv4h8J-xyz3HlUJgnk7uMYE"; 

async function Log(stack, level, package_name, message) {
    try {
        const response = await axios.post(
            "http://20.207.122.201/evaluation-service/logs",
            {
                stack: stack,
                level: level,
                package: package_name,
                message: message
            },
            {
                headers: {
                    "Authorization": `Bearer ${TOKEN}`
                }
            }
        );
        console.log("Log created:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error:", error.response?.data);
    }
}

Log("backend", "error", "handler", "received string, expected bool");

module.exports = { Log };