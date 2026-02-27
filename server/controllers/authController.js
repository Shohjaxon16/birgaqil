const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/token');

// Register
exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Bu email allaqachon ro\'yxatdan o\'tgan',
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        // Generate tokens
        const tokenPayload = { id: user.id, username: user.username, role: user.role };
        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        // Save refresh token
        await User.updateRefreshToken(user.id, refreshToken);

        res.status(201).json({
            success: true,
            message: 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz!',
            data: {
                user,
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email yoki parol noto\'g\'ri',
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Email yoki parol noto\'g\'ri',
            });
        }

        // Generate tokens
        const tokenPayload = { id: user.id, username: user.username, role: user.role };
        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        // Save refresh token
        await User.updateRefreshToken(user.id, refreshToken);

        // Remove password from response
        const { password: _, refresh_token: __, ...userData } = user;

        res.json({
            success: true,
            message: 'Muvaffaqiyatli tizimga kirdingiz!',
            data: {
                user: userData,
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Refresh Token
exports.refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token talab qilinadi',
            });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Find user with this refresh token
        const user = await User.findByRefreshToken(refreshToken);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Noto\'g\'ri refresh token',
            });
        }

        // Generate new tokens
        const tokenPayload = { id: user.id, username: user.username, role: user.role };
        const newAccessToken = generateAccessToken(tokenPayload);
        const newRefreshToken = generateRefreshToken(tokenPayload);

        // Update refresh token
        await User.updateRefreshToken(user.id, newRefreshToken);

        res.json({
            success: true,
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            },
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Refresh token muddati tugagan. Qayta tizimga kiring.',
            });
        }
        next(error);
    }
};

// Get current user
exports.me = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
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
