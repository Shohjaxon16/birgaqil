const pool = require('../config/db');

class Notification {
    static async create({ user_id, type, content, reference_id }) {
        const result = await pool.query(
            `INSERT INTO notifications (user_id, type, content, reference_id) VALUES ($1, $2, $3, $4) RETURNING *`,
            [user_id, type, content, reference_id || null]
        );
        return result.rows[0];
    }

    static async findByUser(userId, { page = 1, limit = 20 }) {
        const offset = (page - 1) * limit;

        const countResult = await pool.query(
            'SELECT COUNT(*) FROM notifications WHERE user_id = $1',
            [userId]
        );
        const total = parseInt(countResult.rows[0].count);

        const result = await pool.query(
            `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        return {
            notifications: result.rows,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
        };
    }

    static async markAsRead(id, userId) {
        const result = await pool.query(
            `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *`,
            [id, userId]
        );
        return result.rows[0];
    }

    static async markAllAsRead(userId) {
        await pool.query(
            `UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`,
            [userId]
        );
    }

    static async getUnreadCount(userId) {
        const result = await pool.query(
            'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE',
            [userId]
        );
        return parseInt(result.rows[0].count);
    }
}

module.exports = Notification;
