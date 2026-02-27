const validate = (schema) => {
    return (req, res, next) => {
        const errors = [];

        for (const [field, rules] of Object.entries(schema)) {
            const value = req.body[field];

            if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
                errors.push(`${field} maydoni to'ldirilishi shart`);
                continue;
            }

            if (!value && !rules.required) continue;

            if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
                errors.push(`${field} kamida ${rules.minLength} ta belgidan iborat bo'lishi kerak`);
            }

            if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
                errors.push(`${field} ko'pi bilan ${rules.maxLength} ta belgidan iborat bo'lishi kerak`);
            }

            if (rules.isEmail && typeof value === 'string') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    errors.push('Email formati noto\'g\'ri');
                }
            }

            if (rules.isArray && !Array.isArray(value)) {
                errors.push(`${field} massiv bo'lishi kerak`);
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validatsiya xatosi',
                errors,
            });
        }

        next();
    };
};

// Validation schemas
const registerSchema = {
    username: { required: true, minLength: 3, maxLength: 50 },
    email: { required: true, isEmail: true },
    password: { required: true, minLength: 6 },
};

const loginSchema = {
    email: { required: true, isEmail: true },
    password: { required: true },
};

const startupSchema = {
    title: { required: true, minLength: 3, maxLength: 200 },
    description: { required: true, minLength: 10 },
    tech_stack: { required: false, isArray: true },
};

const postSchema = {
    content: { required: true, minLength: 1 },
};

module.exports = {
    validate,
    registerSchema,
    loginSchema,
    startupSchema,
    postSchema,
};
