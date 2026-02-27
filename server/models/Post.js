const pool = require('../config/db');

class Post {
    static async create({ content, image, user_id }) {
        const result = await pool.query(
            `INSERT INTO posts (content, image, user_id) VALUES ($1, $2, $3) RETURNING *`,
            [content, image || null, user_id]
        );
        return result.rows[0];
    }

    static async findAll({ page = 1, limit = 20 }) {
        const offset = (page - 1) * limit;

        const countResult = await pool.query('SELECT COUNT(*) FROM posts');
        const total = parseInt(countResult.rows[0].count);

        const result = await pool.query(
            `SELECT p.*, u.username, u.avatar, u.is_verified
       FROM posts p
       JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        return {
            posts: result.rows,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
        };
    }

    static async findByUser(userId) {
        const result = await pool.query(
            `SELECT p.*, u.username, u.avatar FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
            [userId]
        );
        return result.rows;
    }

    static async delete(id, userId) {
        const result = await pool.query(
            'DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );
        return result.rows[0];
    }
}

module.exports = Post;
