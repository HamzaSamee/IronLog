const { Client } = require('pg');
require('dotenv').config();

const seedSpecificUsers = async () => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connected to PostgreSQL');

        // 1. Specific Demo Users requested by USER
        const demoUsers = [
            { username: 'Ali', email: 'ali@demo.com', clerk_id: 'demo_ali', logs: 35 },
            { username: 'Ahmad', email: 'ahmad@demo.com', clerk_id: 'demo_ahmad', logs: 28 },
            { username: 'Farhan', email: 'farhan@demo.com', clerk_id: 'demo_farhan', logs: 25 },
            { username: 'Hamza', email: 'hamza@demo.com', clerk_id: 'demo_hamza', logs: 18 },
            { username: 'Jawad', email: 'jawad@demo.com', clerk_id: 'demo_jawad', logs: 12 }
        ];

        // Optional: Clear old demo users that aren't in this list to keep it clean
        await client.query("DELETE FROM users WHERE clerk_id LIKE 'demo_%' AND clerk_id NOT IN ($1, $2, $3, $4, $5)", 
            demoUsers.map(u => u.clerk_id));

        console.log('Seeding specific demo users...');

        for (const user of demoUsers) {
            const userRes = await client.query(
                "INSERT INTO users (username, email, clerk_id, goal_type) VALUES ($1, $2, $3, $4) ON CONFLICT (clerk_id) DO UPDATE SET username = $1 RETURNING id",
                [user.username, user.email, user.clerk_id, 'weight_gain']
            );
            const userId = userRes.rows[0].id;

            await client.query("DELETE FROM activity_logs WHERE user_id = $1", [userId]);

            for (let i = 0; i < user.logs; i++) {
                await client.query(
                    "INSERT INTO activity_logs (user_id, activity_name, intensity, start_time) VALUES ($1, $2, $3, $4)",
                    [userId, 'Iron Session', Math.floor(Math.random() * 5) + 5, new Date(Date.now() - (i * 24 * 60 * 60 * 1000))]
                );
            }
        }

        console.log('✅ Arena updated with exactly 5 Warriors: Ali, Ahmad, Abdus, Hamza, and Jawad.');
    } catch (err) {
        console.error('❌ Seeding Error:', err);
    } finally {
        await client.end();
    }
};

seedSpecificUsers();
