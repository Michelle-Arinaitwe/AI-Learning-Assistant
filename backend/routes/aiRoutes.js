import express from 'express';
import protect from '../middleware/auth.js';
import {
    generateFlashcardsAPI,
    generateQuizAPI,
    generateSummaryAPI,
    explainConceptAPI,
    chatWithAI,
    getChatHistory
} from '../controllers/aiController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Generate endpoints
router.post('/generate-flashcards/:documentId', generateFlashcardsAPI);
router.post('/generate-quiz/:documentId', generateQuizAPI);
router.post('/generate-summary/:documentId', generateSummaryAPI);

// Explain and chat endpoints
router.post('/explain-concept/:documentId', explainConceptAPI);
router.post('/chat/:documentId', chatWithAI);
router.get('/chat-history/:documentId', getChatHistory);

export default router;
