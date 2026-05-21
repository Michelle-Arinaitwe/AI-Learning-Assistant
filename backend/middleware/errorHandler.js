const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Server Error';

    // Google Gemini / GenAI SDK errors — parse the JSON body they embed in message
    if (err.name === 'ApiError' || (err.constructor && err.constructor.name === 'ApiError')) {
        try {
            const body = typeof err.message === 'string' ? JSON.parse(err.message) : err.message;
            const code = body?.error?.code;
            if (code === 429) {
                statusCode = 429;
                message = 'AI quota exceeded. You have hit the Gemini API rate limit. Please wait and try again.';
            } else if (code === 400) {
                statusCode = 400;
                message = body?.error?.message || 'AI request was invalid.';
            } else if (code === 404) {
                statusCode = 503;
                message = 'The configured AI model is unavailable. Contact the administrator.';
            } else {
                statusCode = code || 502;
                message = body?.error?.message || message;
            }
        } catch { /* leave message as-is if not parseable JSON */ }
    }

    //Mongoose bad ObjectId
    if (err.name === 'CastError') {
        message = 'Resource not found';
        statusCode = 404;
    }

    //Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        message = `${field} already exists`;
        statusCode = 400;
    }

    //Mongoose validation error
    if (err.name === 'ValidationError') {
        message = Object.values(err.errors).map(val => val.message).join(', ');
        statusCode = 400;
    }

    //multer file size error;
    if (err.code === 'LIMIT_FILE_SIZE') {
        message ='File Size exceeds the maximum limit of 10MB';
        statusCode = 400;
    }

    //JET errors
    if (err.name === 'JsonWebTokenError') {
        message = 'Invalid token';
        statusCode = 401;
    }
     if (err.name === 'TokenExpiredError') {
        message = 'Token expired';
        statusCode = 401;
    }

    console.error('Error:',{
    message:err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
});

res.status(statusCode).json({
    success: false,
    error: message,
    statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack})
});
};

export default errorHandler;
