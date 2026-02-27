require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const errorHandler = require('./middleware/errorHandler');
const initSocket = require('./socket/socket');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const startupRoutes = require('./routes/startupRoutes');
const postRoutes = require('./routes/postRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || '*',
        methods: ['GET', 'POST'],
    },
});

// Initialize socket handlers
initSocket(io);

// =============================================
// MIDDLEWARE
// =============================================

// Security headers
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        success: false,
        message: 'Juda ko\'p so\'rov. 15 daqiqadan so\'ng qayta urinib ko\'ring.',
    },
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// =============================================
// STATIC FILES - Serve frontend
// =============================================
app.use(express.static(path.join(__dirname, '..', 'client')));

// =============================================
// API ROUTES
// =============================================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/startups', startupRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);

// API health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'BirgaQil API ishlayapti! 🚀',
        timestamp: new Date().toISOString(),
    });
});

// =============================================
// FRONTEND ROUTES - Serve HTML pages
// =============================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'pages', 'index.html'));
});

const pages = [
    'login', 'register', 'dashboard', 'profile', 'edit-profile',
    'developers', 'startup-detail', 'create-startup', 'chat',
    'notifications', 'settings', '404'
];

pages.forEach((page) => {
    app.get(`/${page}`, (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'client', 'pages', `${page}.html`));
    });
});

// Catch-all: 404
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            success: false,
            message: 'API endpoint topilmadi',
        });
    }
    res.status(404).sendFile(path.join(__dirname, '..', 'client', 'pages', '404.html'));
});

// Error handler
app.use(errorHandler);

// =============================================
// START SERVER
// =============================================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════╗
  ║                                          ║
  ║   🚀 BirgaQil Server                    ║
  ║   📡 Port: ${PORT}                         ║
  ║   🌍 http://localhost:${PORT}              ║
  ║   📊 Environment: ${process.env.NODE_ENV || 'development'}       ║
  ║                                          ║
  ╚══════════════════════════════════════════╝
  `);
});

module.exports = { app, server, io };
