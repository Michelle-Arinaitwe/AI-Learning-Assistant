import path from 'path';
import { fileURLToPath } from 'url';
import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import ChatHistory from '../models/ChatHistory.js';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { chunkText } from '../utils/textChunker.js';
import fs from 'fs/promises';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Upload a document
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Please upload a PDF file',
                statusCode: 400
            });
        }

        const { title } = req.body;

        if (!title) {
            await fs.unlink(req.file.path);
            return res.status(400).json({
                success: false,
                error: 'Please provide a title for the document',
                statusCode: 400
            });
        }

        const baseUrl = `http://localhost:${process.env.PORT || 8000}`;
        const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

        const document = await Document.create({
            userId: req.user._id,
            title,
            fileName: req.file.originalname,
            filePath: fileUrl,
            localPath: req.file.path,   // store the disk path for deletion
            fileSize: req.file.size,
            status: 'processing'
        });

        processPDF(document._id, req.file.path).catch((err) => {
            console.error('Background PDF processing error:', err);
        });

        res.status(201).json({
            success: true,
            data: document,
            message: 'Document uploaded successfully. Processing in progress...'
        });

    } catch (error) {
        if (req.file) {
            await fs.unlink(req.file.path).catch(() => {});
        }
        next(error);
    }
};

const processPDF = async (documentId, filePath) => {
    try {
        console.log(`[Document Processor] Processing document: ${documentId}`);

        const { text, numPages, info } = await extractTextFromPDF(filePath);
        console.log(`[Document Processor] Extracted ${text.length} chars from ${numPages} pages`);

        const chunks = chunkText(text, 500, 50);
        console.log(`[Document Processor] Created ${chunks.length} chunks`);

        await Document.findByIdAndUpdate(documentId, {
            extractedText: text,
            numPages,
            chunks,
            status: 'processed'
        });

        console.log(`✅ [Document Processor] Document ${documentId} processed successfully`);
    } catch (error) {
        console.error(`❌ [Document Processor] Failed to process ${documentId}:`, error.message);
        await Document.findByIdAndUpdate(documentId, { status: 'failed' }).catch(() => {});
    }
};

// @desc    Get all documents for the authenticated user
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res, next) => {
    try {
        const documents = await Document.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.user._id) } },
            {
                $lookup: {
                    from: 'flashcards',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'flashcards'
                }
            },
            {
                $lookup: {
                    from: 'quizzes',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'quizzes'
                }
            },
            {
                $addFields: {
                    flashcardCount: { $size: '$flashcards' },
                    quizCount: { $size: '$quizzes' }
                }
            },
            {
                $project: {
                    extractedText: 0,
                    chunks: 0,
                    flashcards: 0,
                    quizzes: 0,
                    localPath: 0
                }
            },
            { $sort: { uploadDate: -1 } }
        ]);

        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a single document
// @route   GET /api/documents/:id
// @access  Private
export const getDocument = async (req, res, next) => {
    try {
        const document = await Document.findById(req.params.id).select('-localPath');

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        if (document.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to access this document',
                statusCode: 403
            });
        }

        res.status(200).json({ success: true, data: document });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res, next) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        if (document.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this document',
                statusCode: 403
            });
        }

        // Delete the actual file from disk using localPath; fall back to
        // extracting the filename from the stored URL if localPath is absent.
        let filePath = document.localPath;
        if (!filePath) {
            const filename = path.basename(document.filePath);
            filePath = path.join(__dirname, '../uploads/documents', filename);
        }

        await fs.unlink(filePath).catch((err) => {
            console.warn('Could not delete file from disk:', err.message);
        });

        await Document.findByIdAndDelete(req.params.id);
        await Flashcard.deleteMany({ documentId: req.params.id });
        await Quiz.deleteMany({ documentId: req.params.id });
        await ChatHistory.deleteMany({ documentId: req.params.id });

        res.status(200).json({
            success: true,
            message: 'Document and all associated data deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a document title
// @route   PUT /api/documents/:id
// @access  Private
export const updateDocument = async (req, res, next) => {
    try {
        const { title } = req.body;

        let document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        if (document.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this document',
                statusCode: 403
            });
        }

        if (title) document.title = title;

        document = await document.save();

        res.status(200).json({ success: true, data: document });
    } catch (error) {
        next(error);
    }
};
