const jwt = require('jsonwebtoken');

// JWT Secrets with fallbacks for development/missing config
const JWT_SECRET = process.env.JWT_SECRET || 'birgaqil_default_secret_key_2024';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'birgaqil_default_refresh_key_2024';

// Generate access token
const generateAccessToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '1h',
    });
};

// Generate refresh token
const generateRefreshToken = (payload) => {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
    });
};

// Verify access token
const verifyAccessToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

// Verify refresh token
const verifyRefreshToken = (token) => {
    return jwt.verify(token, JWT_REFRESH_SECRET);
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
};
