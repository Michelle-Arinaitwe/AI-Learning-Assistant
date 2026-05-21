import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the uploads directory exists at startup
const uploadDir = path.join(__dirname, '../uploads/documents');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ── Storage ───────────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${uniqueSuffix}${ext}`);
    }
});

// ── File filter — PDF only ─────────────────────────────────────────────────
const fileFilter = (_req, file, cb) => {
    const isPDF =
        file.mimetype === 'application/pdf' ||
        path.extname(file.originalname).toLowerCase() === '.pdf';

    if (isPDF) {
        cb(null, true);
    } else {
        cb(
            Object.assign(new Error('Only PDF files are allowed. Please upload a .pdf file.'), {
                code: 'INVALID_FILE_TYPE'
            }),
            false
        );
    }
};

// ── Multer instance ────────────────────────────────────────────────────────
const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10 MB

const multerUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_SIZE }
});

// ── uploadPDF ──────────────────────────────────────────────────────────────
// Wraps multer.single('file') and converts multer errors into clean JSON so
// the frontend never sees an Express HTML error page.
export const uploadPDF = (req, res, next) => {
    multerUpload.single('file')(req, res, (err) => {
        if (!err) return next();

        let message = 'File upload failed';
        let statusCode = 400;

        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                message = `File too large. Maximum allowed size is ${MAX_SIZE / 1024 / 1024}MB`;
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                message = 'Unexpected field name. Use "file" as the multipart field key';
                break;
            case 'LIMIT_FILE_COUNT':
                message = 'Too many files. Upload one PDF at a time';
                break;
            case 'INVALID_FILE_TYPE':
                message = err.message;
                break;
            default:
                message = err.message || message;
        }

        return res.status(statusCode).json({ success: false, error: message, statusCode });
    });
};

// Export the raw multer instance in case other routes need it
export { uploadDir };
export default multerUpload;
