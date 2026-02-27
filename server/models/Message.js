const pool = require('../config/db');

class Message {
    static async create({ sender_id, receiver_id, message }) {
        const result = await pool.query(
            `INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3) RETURNING *`,
            [sender_id, receiver_id, message]
        );
        return result.rows[0];
    }

    static async getConversation(userId1, userId2, { page = 1, limit = 50 }) {
        const offset = (page - 1) * limit;
        const result = await pool.query(
            `SELECT m.*, 
        su.username as sender_username, su.avatar as sender_avatar,
        ru.username as receiver_username, ru.avatar as receiver_avatar
       FROM messages m
       JOIN users su ON m.sender_id = su.id
       JOIN users ru ON m.receiver_id = ru.id
       WHERE (m.sender_id = $1 AND m.receiver_id = $2)
          OR (m.sender_id = $2 AND m.receiver_id = $1)
       ORDER BY m.created_at ASC
       LIMIT $3 OFFSET $4`,
            [userId1, userId2, limit, offset]
        );
        return result.rows;
    }

    static async getConversationList(userId) {
        const result = await pool.query(
            `SELECT DISTINCT ON (partner_id) 
        partner_id, partner_username, partner_avatar, message, created_at, is_read
       FROM (
         SELECT 
           CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END as partner_id,
           CASE WHEN sender_id = $1 THEN ru.username ELSE su.username END as partner_username,
           CASE WHEN sender_id = $1 THEN ru.avatar ELSE su.avatar END as partner_avatar,
           m.message, m.created_at, m.is_read
         FROM messages m
         JOIN users su ON m.sender_id = su.id
         JOIN users ru ON m.receiver_id = ru.id
         WHERE m.sender_id = $1 OR m.receiver_id = $1
         ORDER BY m.created_at DESC
       ) sub
       ORDER BY partner_id, created_at DESC`,
            [userId]
        );
        return result.rows;
    }

    static async markAsRead(senderId, receiverId) {
        await pool.query(
            `UPDATE messages SET is_read = TRUE WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE`,
            [senderId, receiverId]
        );
    }
}

module.exports = Message;
