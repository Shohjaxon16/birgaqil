const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err.stack);

    if (err.code === '23505') {
        // PostgreSQL unique violation
        return res.status(409).json({
            success: false,
            message: 'Bu ma\'lumot allaqachon mavjud',
        });
    }

    if (err.code === '23503') {
        // PostgreSQL foreign key violation
        return res.status(400).json({
            success: false,
            message: 'Bog\'liq ma\'lumot topilmadi',
        });
    }

    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            success: false,
            message: 'JSON formati noto\'g\'ri',
        });
    }

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Server xatosi yuz berdi',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;
