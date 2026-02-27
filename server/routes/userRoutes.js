const router = require('express').Router();
const { getUsers, getUserById, updateUser } = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', auth, updateUser);

module.exports = router;
