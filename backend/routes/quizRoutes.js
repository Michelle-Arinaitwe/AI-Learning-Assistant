import express from 'express';
import protect from '../middleware/auth.js';
import {
    getAllQuizzes,
    getQuizzesByDocument,
    getQuizById,
    submitQuiz,
    getQuizResults,
    deleteQuiz
} from '../controllers/quizController.js';

const router = express.Router();

router.use(protect);

// Specific routes MUST come before dynamic /:quizId to avoid route hijacking
router.get('/', getAllQuizzes);
router.get('/document/:documentId', getQuizzesByDocument);
router.get('/:quizId', getQuizById);
router.get('/:quizId/results', getQuizResults);

router.post('/:quizId/submit', submitQuiz);

router.delete('/:quizId', deleteQuiz);

export default router;
