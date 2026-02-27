const Startup = require('../models/Startup');
const Notification = require('../models/Notification');

// Create startup
exports.createStartup = async (req, res, next) => {
    try {
        const { title, description, tech_stack, category } = req.body;
        const startup = await Startup.create({
            title,
            description,
            tech_stack,
            category,
            owner_id: req.user.id,
        });

        res.status(201).json({
            success: true,
            message: 'Startup muvaffaqiyatli yaratildi!',
            data: startup,
        });
    } catch (error) {
        next(error);
    }
};

// Get all startups
exports.getStartups = async (req, res, next) => {
    try {
        const { page, limit, search, tech, status, category } = req.query;
        const result = await Startup.findAll({ page, limit, search, tech, status, category });

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// Get startup by ID
exports.getStartupById = async (req, res, next) => {
    try {
        const startup = await Startup.findById(req.params.id);
        if (!startup) {
            return res.status(404).json({
                success: false,
                message: 'Startup topilmadi',
            });
        }

        // Get members
        const members = await Startup.getMembers(req.params.id);

        res.json({
            success: true,
            data: { ...startup, members },
        });
    } catch (error) {
        next(error);
    }
};

// Join startup
exports.joinStartup = async (req, res, next) => {
    try {
        const startupId = req.params.id;
        const userId = req.user.id;

        // Check if startup exists
        const startup = await Startup.findById(startupId);
        if (!startup) {
            return res.status(404).json({
                success: false,
                message: 'Startup topilmadi',
            });
        }

        // Can't join own startup
        if (startup.owner_id === userId) {
            return res.status(400).json({
                success: false,
                message: 'Siz o\'z startupingizga qo\'shila olmaysiz',
            });
        }

        // Add member
        const member = await Startup.addMember(startupId, userId, req.body.role || 'member');

        // Notify startup owner
        await Notification.create({
            user_id: startup.owner_id,
            type: 'join_request',
            content: `${req.user.username} "${startup.title}" startupingizga qo'shilishni xohlaydi`,
            reference_id: startupId,
        });

        res.status(201).json({
            success: true,
            message: 'Arizangiz yuborildi!',
            data: member,
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'Siz allaqachon ariza yuborgansiz',
            });
        }
        next(error);
    }
};

// Get user's startups
exports.getMyStartups = async (req, res, next) => {
    try {
        const startups = await Startup.findByOwner(req.user.id);
        res.json({
            success: true,
            data: startups,
        });
    } catch (error) {
        next(error);
    }
};
