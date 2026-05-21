import express from 'express';
import protect from '../middleware/auth.js';
import { uploadPDF } from '../middleware/uploadMiddleware.js';
import {
    uploadDocument,
    getDocuments,
    getDocument,
    deleteDocument,
    updateDocument
} from '../controllers/documentController.js';

const router = express.Router();

// All document routes require authentication
router.use(protect);

// POST   /api/documents/upload   — upload a PDF (multipart/form-data, field: "file")
router.post('/upload', uploadPDF, uploadDocument);

// GET    /api/documents          — list all documents for the current user
router.get('/', getDocuments);

// GET    /api/documents/:id      — get a single document
router.get('/:id', getDocument);

// PUT    /api/documents/:id      — rename a document
router.put('/:id', updateDocument);

// DELETE /api/documents/:id      — delete document + file + all related data
router.delete('/:id', deleteDocument);

export default router;
