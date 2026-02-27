const router = require('express').Router();
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const auth = require('../middleware/auth');

router.get('/', auth, getNotifications);
router.put('/:id/read', auth, markAsRead);
router.put('/read-all', auth, markAllAsRead);

module.exports = router;
