const { verifyAccessToken } = require('../utils/token');

const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Avtorizatsiya tokeni topilmadi',
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyAccessToken(token);

        req.user = {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role,
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token muddati tugagan',
                expired: true,
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Noto\'g\'ri token',
        });
    }
};

module.exports = auth;
