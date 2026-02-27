const pool = require('../config/db');

class User {
    static async create({ username, email, password }) {
        const result = await pool.query(
            `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, bio, skills, avatar, role, is_premium, is_verified, created_at`,
            [username, email, password]
        );
        return result.rows[0];
    }

    static async findByEmail(email) {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    }

    static async findById(id) {
        const result = await pool.query(
            'SELECT id, username, email, bio, skills, avatar, role, is_premium, is_verified, created_at FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    static async findAll({ page = 1, limit = 12, search = '', skill = '' }) {
        const offset = (page - 1) * limit;
        let query = `SELECT id, username, email, bio, skills, avatar, role, is_premium, is_verified, created_at FROM users WHERE 1=1`;
        const params = [];
        let paramCount = 0;

        if (search) {
            paramCount++;
            query += ` AND (username ILIKE $${paramCount} OR bio ILIKE $${paramCount})`;
            params.push(`%${search}%`);
        }

        if (skill) {
            paramCount++;
            query += ` AND $${paramCount} = ANY(skills)`;
            params.push(skill);
        }

        // Count total
        const countResult = await pool.query(
            query.replace(/SELECT .+ FROM/, 'SELECT COUNT(*) FROM'),
            params
        );
        const total = parseInt(countResult.rows[0].count);

        // Get paginated results
        paramCount++;
        params.push(limit);
        query += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
        paramCount++;
        params.push(offset);
        query += ` OFFSET $${paramCount}`;

        const result = await pool.query(query, params);

        return {
            users: result.rows,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
        };
    }

    static async update(id, fields) {
        const allowedFields = ['username', 'bio', 'skills', 'avatar'];
        const updates = [];
        const params = [];
        let paramCount = 0;

        for (const [key, value] of Object.entries(fields)) {
            if (allowedFields.includes(key) && value !== undefined) {
                paramCount++;
                updates.push(`${key} = $${paramCount}`);
                params.push(key === 'skills' ? value : value);
            }
        }

        if (updates.length === 0) return null;

        paramCount++;
        params.push(id);
        updates.push(`updated_at = NOW()`);

        const result = await pool.query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, username, email, bio, skills, avatar, role, is_premium, is_verified, created_at`,
            params
        );
        return result.rows[0];
    }

    static async updateRefreshToken(id, token) {
        await pool.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [token, id]);
    }

    static async findByRefreshToken(token) {
        const result = await pool.query('SELECT * FROM users WHERE refresh_token = $1', [token]);
        return result.rows[0];
    }
}

module.exports = User;
