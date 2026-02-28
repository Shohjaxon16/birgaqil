require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function clearDatabase() {
    try {
        console.log('🚀 Ma\'lumotlar bazasini tozalash boshlandi...');

        // Jadvallarni o'chirish tartibi muhim (Foreign keylar sababli)
        const tables = [
            'notifications',
            'messages',
            'subscriptions',
            'posts',
            'startup_members',
            'startups',
            'users'
        ];

        for (const table of tables) {
            console.log(`🧹 ${table} jadvali tozalanmoqda...`);
            await pool.query(`TRUNCATE ${table} RESTART IDENTITY CASCADE`);
        }

        console.log('✅ Barcha ma\'lumotlar muvaffaqiyatli o\'chirildi!');
    } catch (err) {
        console.error('❌ Xatolik yuz berdi:', err);
    } finally {
        await pool.end();
    }
}

clearDatabase();
