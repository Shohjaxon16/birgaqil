const router = require('express').Router();
const { register, login, refresh, me } = require('../controllers/authController');
const { validate, registerSchema, loginSchema } = require('../middleware/validate');
const auth = require('../middleware/auth');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.get('/me', auth, me);

module.exports = router;
