const { verifyAccessToken } = require('../utils/token');
const Message = require('../models/Message');

const onlineUsers = new Map();

const initSocket = (io) => {
    // Auth middleware for socket
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication required'));
            }
            const decoded = verifyAccessToken(token);
            socket.user = decoded;
            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.user.id;
        console.log(`🟢 User connected: ${socket.user.username}`);

        // Add to online users
        onlineUsers.set(userId, {
            socketId: socket.id,
            username: socket.user.username,
        });

        // Broadcast online users
        io.emit('users:online', Array.from(onlineUsers.entries()).map(([id, data]) => ({
            id,
            username: data.username,
        })));

        // Private message
        socket.on('message:send', async (data) => {
            try {
                const { receiverId, message } = data;

                // Save to database
                const savedMessage = await Message.create({
                    sender_id: userId,
                    receiver_id: receiverId,
                    message,
                });

                // Send to receiver if online
                const receiver = onlineUsers.get(receiverId);
                if (receiver) {
                    io.to(receiver.socketId).emit('message:receive', {
                        ...savedMessage,
                        sender_username: socket.user.username,
                    });
                }

                // Confirm to sender
                socket.emit('message:sent', savedMessage);
            } catch (error) {
                socket.emit('message:error', { error: error.message });
            }
        });

        // Typing indicator
        socket.on('typing:start', (data) => {
            const receiver = onlineUsers.get(data.receiverId);
            if (receiver) {
                io.to(receiver.socketId).emit('typing:show', {
                    userId,
                    username: socket.user.username,
                });
            }
        });

        socket.on('typing:stop', (data) => {
            const receiver = onlineUsers.get(data.receiverId);
            if (receiver) {
                io.to(receiver.socketId).emit('typing:hide', {
                    userId,
                });
            }
        });

        // Mark messages as read
        socket.on('messages:read', async (data) => {
            try {
                await Message.markAsRead(data.senderId, userId);
                const sender = onlineUsers.get(data.senderId);
                if (sender) {
                    io.to(sender.socketId).emit('messages:read:confirm', { readBy: userId });
                }
            } catch (error) {
                console.error('Error marking messages as read:', error);
            }
        });

        // Disconnect
        socket.on('disconnect', () => {
            console.log(`🔴 User disconnected: ${socket.user.username}`);
            onlineUsers.delete(userId);

            io.emit('users:online', Array.from(onlineUsers.entries()).map(([id, data]) => ({
                id,
                username: data.username,
            })));
        });
    });
};

module.exports = initSocket;
