import Flashcard from '../models/Flashcard.js';
import Document from '../models/Document.js';
import mongoose from 'mongoose';

// @desc    Get all flashcards for a document
// @route   GET /api/flashcards/document/:documentId
// @access  Private
export const getFlashcardsByDocument = async (req, res, next) => {
    try {
        const { documentId } = req.params;

        // Verify document exists and user owns it
        const document = await Document.findById(documentId);
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
                error: 'Not authorized to access these flashcards',
                statusCode: 403
            });
        }

        const flashcard = await Flashcard.findOne({
            userId: req.user._id,
            documentId: documentId
        });

        if (!flashcard) {
            return res.status(200).json({
                success: true,
                data: { cards: [] },
                message: 'No flashcards found for this document'
            });
        }

        res.status(200).json({
            success: true,
            count: flashcard.cards.length,
            data: flashcard
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all flashcards for current user
// @route   GET /api/flashcards
// @access  Private
export const getAllFlashcards = async (req, res, next) => {
    try {
        const flashcards = await Flashcard.find({ userId: req.user._id })
            .populate('documentId', 'title fileName')
            .sort({ createdAt: -1 });

        const totalCards = flashcards.reduce((sum, fc) => sum + fc.cards.length, 0);

        res.status(200).json({
            success: true,
            count: flashcards.length,
            totalCards: totalCards,
            data: flashcards
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark flashcard as reviewed
// @route   PUT /api/flashcards/:flashcardId/review/:cardIndex
// @access  Private
export const reviewFlashcard = async (req, res, next) => {
    try {
        const { flashcardId, cardIndex } = req.params;

        const flashcard = await Flashcard.findById(flashcardId);

        if (!flashcard) {
            return res.status(404).json({
                success: false,
                error: 'Flashcard set not found',
                statusCode: 404
            });
        }

        if (flashcard.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to review this flashcard',
                statusCode: 403
            });
        }

        const card = flashcard.cards[cardIndex];
        if (!card) {
            return res.status(404).json({
                success: false,
                error: 'Card not found',
                statusCode: 404
            });
        }

        card.lastReviewed = new Date();
        card.reviewCount += 1;

        await flashcard.save();

        res.status(200).json({
            success: true,
            data: flashcard,
            message: 'Flashcard reviewed successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle flashcard as favorite
// @route   PUT /api/flashcards/:flashcardId/toggle-favorite/:cardIndex
// @access  Private
export const toggleFavorite = async (req, res, next) => {
    try {
        const { flashcardId, cardIndex } = req.params;

        const flashcard = await Flashcard.findById(flashcardId);

        if (!flashcard) {
            return res.status(404).json({
                success: false,
                error: 'Flashcard set not found',
                statusCode: 404
            });
        }

        if (flashcard.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to modify this flashcard',
                statusCode: 403
            });
        }

        const card = flashcard.cards[cardIndex];
        if (!card) {
            return res.status(404).json({
                success: false,
                error: 'Card not found',
                statusCode: 404
            });
        }

        card.isStarred = !card.isStarred;
        await flashcard.save();

        res.status(200).json({
            success: true,
            data: flashcard,
            message: `Flashcard ${card.isStarred ? 'added to' : 'removed from'} favorites`
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a flashcard set
// @route   DELETE /api/flashcards/:flashcardId
// @access  Private
export const deleteFlashcard = async (req, res, next) => {
    try {
        const flashcard = await Flashcard.findById(req.params.flashcardId);

        if (!flashcard) {
            return res.status(404).json({
                success: false,
                error: 'Flashcard set not found',
                statusCode: 404
            });
        }

        if (flashcard.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this flashcard',
                statusCode: 403
            });
        }

        await Flashcard.findByIdAndDelete(req.params.flashcardId);

        res.status(200).json({
            success: true,
            message: 'Flashcard set deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a single card from flashcard set
// @route   DELETE /api/flashcards/:flashcardId/card/:cardIndex
// @access  Private
export const deleteFlashcardCard = async (req, res, next) => {
    try {
        const { flashcardId, cardIndex } = req.params;

        const flashcard = await Flashcard.findById(flashcardId);

        if (!flashcard) {
            return res.status(404).json({
                success: false,
                error: 'Flashcard set not found',
                statusCode: 404
            });
        }

        if (flashcard.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to modify this flashcard',
                statusCode: 403
            });
        }

        if (cardIndex < 0 || cardIndex >= flashcard.cards.length) {
            return res.status(404).json({
                success: false,
                error: 'Card not found',
                statusCode: 404
            });
        }

        flashcard.cards.splice(cardIndex, 1);
        await flashcard.save();

        res.status(200).json({
            success: true,
            data: flashcard,
            message: 'Card deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark a single card as read / unread (toggle)
// @route   PUT /api/flashcards/:flashcardId/mark-read/:cardIndex
// @access  Private
export const markCardAsRead = async (req, res, next) => {
    try {
        const { flashcardId, cardIndex } = req.params;

        const flashcard = await Flashcard.findById(flashcardId);

        if (!flashcard) {
            return res.status(404).json({
                success: false,
                error: 'Flashcard set not found',
                statusCode: 404
            });
        }

        if (flashcard.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to modify this flashcard',
                statusCode: 403
            });
        }

        const card = flashcard.cards[cardIndex];
        if (!card) {
            return res.status(404).json({
                success: false,
                error: 'Card not found',
                statusCode: 404
            });
        }

        card.isRead = !card.isRead;
        await flashcard.save();

        res.status(200).json({
            success: true,
            data: flashcard,
            message: `Card marked as ${card.isRead ? 'read' : 'unread'}`
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get starred flashcards
// @route   GET /api/flashcards/starred/all
// @access  Private
export const getStarredFlashcards = async (req, res, next) => {
    try {
        const flashcards = await Flashcard.find({ userId: req.user._id })
            .populate('documentId', 'title fileName');

        // Filter to only starred cards
        const starredCards = [];
        flashcards.forEach((fc) => {
            const starred = fc.cards.filter((card) => card.isStarred);
            if (starred.length > 0) {
                starredCards.push({
                    flashcardSetId: fc._id,
                    documentId: fc.documentId,
                    cards: starred
                });
            }
        });

        res.status(200).json({
            success: true,
            count: starredCards.length,
            data: starredCards
        });
    } catch (error) {
        next(error);
    }
};
