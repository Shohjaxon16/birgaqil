const Notification = require('../models/Notification');

// Get user notifications
exports.getNotifications = async (req, res, next) => {
    try {
        const { page, limit } = req.query;
        const result = await Notification.findByUser(req.user.id, { page, limit });
        const unreadCount = await Notification.getUnreadCount(req.user.id);

        res.json({
            success: true,
            data: { ...result, unreadCount },
        });
    } catch (error) {
        next(error);
    }
};

// Mark notification as read
exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.markAsRead(req.params.id, req.user.id);
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Bildirishnoma topilmadi',
            });
        }

        res.json({
            success: true,
            data: notification,
        });
    } catch (error) {
        next(error);
    }
};

// Mark all as read
exports.markAllAsRead = async (req, res, next) => {
    try {
        await Notification.markAllAsRead(req.user.id);
        res.json({
            success: true,
            message: 'Barcha bildirishnomalar o\'qilgan deb belgilandi',
        });
    } catch (error) {
        next(error);
    }
};
