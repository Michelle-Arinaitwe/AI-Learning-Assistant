import { validationResult } from 'express-validator';

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: errors.array().map((e) => e.msg).join(', '),
            statusCode: 400
        });
    }
    next();
};

export default validate;
