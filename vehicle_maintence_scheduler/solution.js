const axios = require('axios');

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJkaWtzaGEuMjYyNzJAZ2duaW5kaWEuZHJvbmFjaGFyeWEuaW5mbyIsImV4cCI6MTc3Nzg3MzAwMywiaWF0IjoxNzc3ODcyMTAzLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiYTJiYzAxNzMtNjI5ZC00MGJhLTgyYWMtNWMyZTBmZjI4MjJkIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiZGlrc2hhIG5hZ3BhbCIsInN1YiI6Ijc2YmVkN2RjLWVlNGMtNDE5Zi04YTdjLTA5MThjZDI0OWUwZiJ9LCJlbWFpbCI6ImRpa3NoYS4yNjI3MkBnZ25pbmRpYS5kcm9uYWNoYXJ5YS5pbmZvIiwibmFtZSI6ImRpa3NoYSBuYWdwYWwiLCJyb2xsTm8iOiIyNjI3MiIsImFjY2Vzc0NvZGUiOiJ1a3NkV1QiLCJjbGllbnRJRCI6Ijc2YmVkN2RjLWVlNGMtNDE5Zi04YTdjLTA5MThjZDI0OWUwZiIsImNsaWVudFNlY3JldCI6Imp3Y2Rod0NVR0FwRG1rUXEifQ.xbLxszWy-A30QtIqn7hGZv4h8J-xyz3HlUJgnk7uMYE";

const headers = {
    "Authorization": `Bearer ${TOKEN}`
};

function knapsack(vehicles, maxHours) {
    const n = vehicles.length;
    const dp = Array(n + 1).fill(null).map(() => Array(maxHours + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        const { Duration, Impact } = vehicles[i - 1];
        for (let w = 0; w <= maxHours; w++) {
            dp[i][w] = dp[i - 1][w];
            if (Duration <= w) {
                dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - Duration] + Impact);
            }
        }
    }

    let w = maxHours;
    const selected = [];
    for (let i = n; i > 0; i--) {
        if (dp[i][w] !== dp[i - 1][w]) {
            selected.push(vehicles[i - 1]);
            w -= vehicles[i - 1].Duration;
        }
    }

    return {
        maxImpact: dp[n][maxHours],
        selectedTasks: selected
    };
}

async function main() {
    try {
        
        console.log("Fetching depots...");
        const depotsRes = await axios.get(
            "http://20.207.122.201/evaluation-service/depots",
            { headers }
        );
        const depots = depotsRes.data.depots;
        console.log(`Found ${depots.length} depots\n`);

        
        console.log("Fetching vehicles...");
        const vehiclesRes = await axios.get(
            "http://20.207.122.201/evaluation-service/vehicles",
            { headers }
        );
        const vehicles = vehiclesRes.data.vehicles;
        console.log(`Found ${vehicles.length} vehicles\n`);

        
        console.log("=".repeat(60));
        depots.forEach(depot => {
            console.log(`\nDepot ID: ${depot.ID} | MechanicHours: ${depot.MechanicHours}`);
            
            const result = knapsack(vehicles, depot.MechanicHours);
            
            console.log(`Max Impact Score: ${result.maxImpact}`);
            console.log(`Tasks Selected: ${result.selectedTasks.length}`);
            console.log("Selected Tasks:");
            result.selectedTasks.forEach(task => {
                console.log(`  - TaskID: ${task.TaskID} | Duration: ${task.Duration}h | Impact: ${task.Impact}`);
            });
            console.log("-".repeat(60));
        });

    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
    }
}

main();