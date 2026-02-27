const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Avtorizatsiya talab qilinadi',
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Sizda bu amalni bajarish uchun ruxsat yo\'q',
            });
        }

        next();
    };
};

module.exports = roleMiddleware;
