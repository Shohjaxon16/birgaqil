const router = require('express').Router();
const { createPost, getPosts, deletePost } = require('../controllers/postController');
const { validate, postSchema } = require('../middleware/validate');
const auth = require('../middleware/auth');

router.post('/', auth, validate(postSchema), createPost);
router.get('/', getPosts);
router.delete('/:id', auth, deletePost);

module.exports = router;
