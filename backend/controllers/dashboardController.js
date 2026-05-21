import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import mongoose from 'mongoose';

// @desc    Get dashboard overview
// @route   GET /api/dashboard/overview
// @access  Private
export const getDashboardOverview = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // Get total counts
        const totalDocuments = await Document.countDocuments({ userId });
        const totalFlashcardSets = await Flashcard.countDocuments({ userId });
        const totalQuizzes = await Quiz.countDocuments({ userId });

        // Get total flashcards
        const flashcardSets = await Flashcard.find({ userId });
        const totalFlashcards = flashcardSets.reduce((sum, set) => sum + set.cards.length, 0);

        // Get total storage used
        const documents = await Document.find({ userId });
        const totalStorageUsed = documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);

        // Get recent activity
        const recentDocuments = await Document.find({ userId })
            .sort({ uploadDate: -1 })
            .limit(5)
            .select('_id title fileName uploadDate status');

        const recentQuizzes = await Quiz.find({ userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('_id title score totalQuestions completedAt createdAt')
            .populate('documentId', 'title');

        // Get quiz statistics
        const completedQuizzes = await Quiz.find({ userId, completedAt: { $ne: null } });
        const avgScore = completedQuizzes.length > 0
            ? completedQuizzes.reduce((sum, q) => sum + q.score, 0) / completedQuizzes.length
            : 0;

        // Get most reviewed flashcards
        const mostReviewedFlashcards = [];
        flashcardSets.forEach((set) => {
            set.cards.forEach((card, index) => {
                if (card.reviewCount > 0) {
                    mostReviewedFlashcards.push({
                        question: card.question,
                        reviewCount: card.reviewCount,
                        difficulty: card.difficulty,
                        setId: set._id
                    });
                }
            });
        });

        mostReviewedFlashcards.sort((a, b) => b.reviewCount - a.reviewCount);
        const topReviewedFlashcards = mostReviewedFlashcards.slice(0, 5);

        // Get processed documents count
        const processedDocuments = documents.filter((doc) => doc.status === 'processed').length;
        const failedDocuments = documents.filter((doc) => doc.status === 'failed').length;

        const overview = {
            summary: {
                totalDocuments,
                totalFlashcardSets,
                totalFlashcards,
                totalQuizzes,
                completedQuizzes: completedQuizzes.length,
                totalStorageUsed: Math.round(totalStorageUsed / 1024 / 1024 * 100) / 100, // in MB
                averageQuizScore: Math.round(avgScore * 100) / 100
            },
            documentStats: {
                processed: processedDocuments,
                failed: failedDocuments,
                total: totalDocuments
            },
            recentActivity: {
                documents: recentDocuments,
                quizzes: recentQuizzes
            },
            topPerformers: {
                reviewedFlashcards: topReviewedFlashcards
            }
        };

        res.status(200).json({
            success: true,
            data: overview
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user learning statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getLearningStats = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // Get documents
        const documents = await Document.find({ userId });
        const totalDocuments = documents.length;
        const totalPages = documents.reduce((sum, doc) => sum + (doc.numPages || 0), 0);
        const processedDocuments = documents.filter((doc) => doc.status === 'processed').length;

        // Get flashcard stats
        const flashcardSets = await Flashcard.find({ userId });
        const totalFlashcards = flashcardSets.reduce((sum, set) => sum + set.cards.length, 0);
        const starredFlashcards = flashcardSets.reduce((sum, set) => {
            return sum + set.cards.filter((card) => card.isStarred).length;
        }, 0);
        const reviewedFlashcards = flashcardSets.reduce((sum, set) => {
            return sum + set.cards.filter((card) => card.reviewCount > 0).length;
        }, 0);

        // Get quiz stats
        const allQuizzes = await Quiz.find({ userId });
        const completedQuizzes = allQuizzes.filter((q) => q.completedAt);
        const avgScore = completedQuizzes.length > 0
            ? completedQuizzes.reduce((sum, q) => sum + q.score, 0) / completedQuizzes.length
            : 0;

        // Get streak (days with activity)
        const activity = {};
        [...documents, ...allQuizzes, ...flashcardSets].forEach((item) => {
            const date = new Date(item.createdAt || item.uploadDate || item.completedAt);
            const dateKey = date.toISOString().split('T')[0];
            activity[dateKey] = (activity[dateKey] || 0) + 1;
        });

        const stats = {
            documents: {
                total: totalDocuments,
                processed: processedDocuments,
                totalPages
            },
            flashcards: {
                total: totalFlashcards,
                sets: flashcardSets.length,
                starred: starredFlashcards,
                reviewed: reviewedFlashcards
            },
            quizzes: {
                total: allQuizzes.length,
                completed: completedQuizzes.length,
                averageScore: Math.round(avgScore * 100) / 100
            },
            activity
        };

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get progress by difficulty
// @route   GET /api/dashboard/progress
// @access  Private
export const getProgressByDifficulty = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // Get flashcard difficulty breakdown
        const flashcardSets = await Flashcard.find({ userId });
        const flashcardsByDifficulty = { easy: 0, medium: 0, hard: 0 };
        const reviewedByDifficulty = { easy: 0, medium: 0, hard: 0 };

        flashcardSets.forEach((set) => {
            set.cards.forEach((card) => {
                flashcardsByDifficulty[card.difficulty]++;
                if (card.reviewCount > 0) {
                    reviewedByDifficulty[card.difficulty]++;
                }
            });
        });

        // Get quiz difficulty breakdown
        const allQuizzes = await Quiz.find({ userId });
        const quizzesByDifficulty = { easy: 0, medium: 0, hard: 0 };
        const correctByDifficulty = { easy: 0, medium: 0, hard: 0 };

        allQuizzes.forEach((quiz) => {
            if (quiz.questions && quiz.userAnswers) {
                quiz.questions.forEach((question, index) => {
                    const difficulty = question.difficulty || 'medium';
                    quizzesByDifficulty[difficulty]++;
                    if (quiz.userAnswers[index]?.isCorrect) {
                        correctByDifficulty[difficulty]++;
                    }
                });
            }
        });

        const progress = {
            flashcards: {
                byDifficulty: flashcardsByDifficulty,
                reviewedByDifficulty
            },
            quizzes: {
                byDifficulty: quizzesByDifficulty,
                correctByDifficulty
            }
        };

        res.status(200).json({
            success: true,
            data: progress
        });
    } catch (error) {
        next(error);
    }
};
