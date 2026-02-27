const User = require('../models/User');

// Get all users
exports.getUsers = async (req, res, next) => {
    try {
        const { page, limit, search, skill } = req.query;
        const result = await User.findAll({ page, limit, search, skill });

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Foydalanuvchi topilmadi',
            });
        }

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

// Update user
exports.updateUser = async (req, res, next) => {
    try {
        // Only allow users to update their own profile
        if (req.user.id !== req.params.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Siz faqat o\'z profilingizni tahrirlashingiz mumkin',
            });
        }

        const updatedUser = await User.update(req.params.id, req.body);
        if (!updatedUser) {
            return res.status(400).json({
                success: false,
                message: 'Yangilanadigan ma\'lumot topilmadi',
            });
        }

        res.json({
            success: true,
            message: 'Profil muvaffaqiyatli yangilandi',
            data: updatedUser,
        });
    } catch (error) {
        next(error);
    }
};
