const Post = require('../models/Post');

// Create post
exports.createPost = async (req, res, next) => {
    try {
        const { content, image } = req.body;
        const post = await Post.create({
            content,
            image,
            user_id: req.user.id,
        });

        res.status(201).json({
            success: true,
            message: 'Post muvaffaqiyatli yaratildi!',
            data: post,
        });
    } catch (error) {
        next(error);
    }
};

// Get all posts
exports.getPosts = async (req, res, next) => {
    try {
        const { page, limit } = req.query;
        const result = await Post.findAll({ page, limit });

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// Delete post
exports.deletePost = async (req, res, next) => {
    try {
        const post = await Post.delete(req.params.id, req.user.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post topilmadi yoki sizga tegishli emas',
            });
        }

        res.json({
            success: true,
            message: 'Post o\'chirildi',
        });
    } catch (error) {
        next(error);
    }
};
