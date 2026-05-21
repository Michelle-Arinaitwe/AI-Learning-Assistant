import express from 'express';
import protect from '../middleware/auth.js';
import {
    getFlashcardsByDocument,
    getAllFlashcards,
    reviewFlashcard,
    toggleFavorite,
    deleteFlashcard,
    deleteFlashcardCard,
    getStarredFlashcards
} from '../controllers/flashcardController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get flashcards
router.get('/', getAllFlashcards);
router.get('/starred/all', getStarredFlashcards);
router.get('/document/:documentId', getFlashcardsByDocument);

// Update flashcards
router.put('/:flashcardId/review/:cardIndex', reviewFlashcard);
router.put('/:flashcardId/toggle-favorite/:cardIndex', toggleFavorite);

// Delete flashcards
router.delete('/:flashcardId', deleteFlashcard);
router.delete('/:flashcardId/card/:cardIndex', deleteFlashcardCard);

export default router;
