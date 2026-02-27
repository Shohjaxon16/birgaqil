const router = require('express').Router();
const { createStartup, getStartups, getStartupById, joinStartup, getMyStartups } = require('../controllers/startupController');
const { validate, startupSchema } = require('../middleware/validate');
const auth = require('../middleware/auth');

router.post('/', auth, validate(startupSchema), createStartup);
router.get('/', getStartups);
router.get('/my', auth, getMyStartups);
router.get('/:id', getStartupById);
router.post('/:id/join', auth, joinStartup);

module.exports = router;
