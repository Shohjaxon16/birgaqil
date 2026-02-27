const pool = require('../config/db');

class Startup {
    static async create({ title, description, tech_stack, category, owner_id }) {
        const result = await pool.query(
            `INSERT INTO startups (title, description, tech_stack, category, owner_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
            [title, description, tech_stack || [], category || 'other', owner_id]
        );
        return result.rows[0];
    }

    static async findById(id) {
        const result = await pool.query(
            `SELECT s.*, u.username as owner_username, u.avatar as owner_avatar,
       (SELECT COUNT(*) FROM startup_members WHERE startup_id = s.id AND status = 'accepted') as member_count
       FROM startups s
       JOIN users u ON s.owner_id = u.id
       WHERE s.id = $1`,
            [id]
        );
        return result.rows[0];
    }

    static async findAll({ page = 1, limit = 12, search = '', tech = '', status = '', category = '' }) {
        const offset = (page - 1) * limit;
        let query = `SELECT s.*, u.username as owner_username, u.avatar as owner_avatar,
       (SELECT COUNT(*) FROM startup_members WHERE startup_id = s.id AND status = 'accepted') as member_count
       FROM startups s
       JOIN users u ON s.owner_id = u.id
       WHERE 1=1`;
        const params = [];
        let paramCount = 0;

        if (search) {
            paramCount++;
            query += ` AND (s.title ILIKE $${paramCount} OR s.description ILIKE $${paramCount})`;
            params.push(`%${search}%`);
        }

        if (tech) {
            paramCount++;
            query += ` AND $${paramCount} = ANY(s.tech_stack)`;
            params.push(tech);
        }

        if (status) {
            paramCount++;
            query += ` AND s.status = $${paramCount}`;
            params.push(status);
        }

        if (category) {
            paramCount++;
            query += ` AND s.category = $${paramCount}`;
            params.push(category);
        }

        // Count
        const countQuery = query.replace(/SELECT .+ FROM/, 'SELECT COUNT(*) FROM');
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        // Paginate
        paramCount++;
        params.push(limit);
        query += ` ORDER BY s.is_highlighted DESC, s.created_at DESC LIMIT $${paramCount}`;
        paramCount++;
        params.push(offset);
        query += ` OFFSET $${paramCount}`;

        const result = await pool.query(query, params);

        return {
            startups: result.rows,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
        };
    }

    static async getMembers(startupId) {
        const result = await pool.query(
            `SELECT sm.*, u.username, u.avatar, u.skills
       FROM startup_members sm
       JOIN users u ON sm.user_id = u.id
       WHERE sm.startup_id = $1
       ORDER BY sm.joined_at ASC`,
            [startupId]
        );
        return result.rows;
    }

    static async addMember(startupId, userId, role = 'member') {
        const result = await pool.query(
            `INSERT INTO startup_members (startup_id, user_id, role)
       VALUES ($1, $2, $3)
       RETURNING *`,
            [startupId, userId, role]
        );
        return result.rows[0];
    }

    static async updateMemberStatus(startupId, userId, status) {
        const result = await pool.query(
            `UPDATE startup_members SET status = $1 WHERE startup_id = $2 AND user_id = $3 RETURNING *`,
            [status, startupId, userId]
        );
        return result.rows[0];
    }

    static async findByOwner(ownerId) {
        const result = await pool.query(
            `SELECT s.*, (SELECT COUNT(*) FROM startup_members WHERE startup_id = s.id AND status = 'accepted') as member_count
       FROM startups s WHERE s.owner_id = $1 ORDER BY s.created_at DESC`,
            [ownerId]
        );
        return result.rows;
    }
}

module.exports = Startup;
