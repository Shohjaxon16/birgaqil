const router = require('express').Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// Get conversation with specific user
router.get('/:userId', auth, async (req, res, next) => {
    try {
        const { page, limit } = req.query;
        const messages = await Message.getConversation(req.user.id, req.params.userId, { page, limit });

        // Mark messages from other user as read
        await Message.markAsRead(req.params.userId, req.user.id);

        res.json({
            success: true,
            data: messages,
        });
    } catch (error) {
        next(error);
    }
});

// Get conversation list
router.get('/', auth, async (req, res, next) => {
    try {
        const conversations = await Message.getConversationList(req.user.id);
        res.json({
            success: true,
            data: conversations,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
