/**
 * DEV-ONLY routes  —  never expose in production
 * Used exclusively by the automated test suite.
 */
import express from 'express';
import jwt from 'jsonwebtoken';
import protect from '../middleware/auth.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import Document from '../models/Document.js';
import User from '../models/User.js';

const router = express.Router();

// POST /api/dev/register-or-login
// Body: { username, email, password }
// Idempotent: deletes existing user with that email then re-creates, returns token
router.post('/register-or-login', async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        await User.deleteOne({ email });
        // Pass plain password — User model's pre-save hook handles hashing
        const user = await User.create({ username, email, password });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE || '7d'
        });
        res.status(201).json({ success: true, data: { userId: user._id, token } });
    } catch (err) { next(err); }
});

// POST /api/dev/adopt-document
// Picks any processed document and creates a copy owned by the authenticated user
router.post('/adopt-document', protect, async (req, res, next) => {
    try {
        const source = await Document.findOne({
            status: 'processed',
            extractedText: { $exists: true, $ne: '' }
        }).lean();
        if (!source) return res.status(404).json({ success: false, error: 'No processed document to adopt' });

        const { _id, __v, ...rest } = source;
        const copy = await Document.create({
            ...rest,
            userId: req.user._id,
            title: source.title + ' [test]'
        });
        res.status(201).json({ success: true, data: { documentId: copy._id } });
    } catch (err) { next(err); }
});

// POST /api/dev/seed-flashcards
// Body: { documentId }
router.post('/seed-flashcards', protect, async (req, res, next) => {
    try {
        const { documentId } = req.body;
        if (!documentId) return res.status(400).json({ success: false, error: 'documentId required' });

        await Flashcard.deleteMany({ userId: req.user._id, documentId });

        const fc = await Flashcard.create({
            userId: req.user._id,
            documentId,
            cards: [
                { question: 'What is a linked list?',             answer: 'A linear data structure where nodes link to the next', difficulty: 'easy' },
                { question: 'What does a node contain?',          answer: 'Data and a pointer to the next node',                  difficulty: 'medium' },
                { question: 'Insertion at head — complexity?',    answer: 'O(1)',                                                 difficulty: 'hard' }
            ]
        });
        res.status(201).json({ success: true, data: { flashcardId: fc._id } });
    } catch (err) { next(err); }
});

// POST /api/dev/seed-quiz
// Body: { documentId }
router.post('/seed-quiz', protect, async (req, res, next) => {
    try {
        const { documentId } = req.body;
        if (!documentId) return res.status(400).json({ success: false, error: 'documentId required' });

        const quiz = await Quiz.create({
            userId: req.user._id,
            documentId,
            title: 'Test Quiz — Linked Lists',
            totalQuestions: 3,
            questions: [
                {
                    question: 'Which is a linear data structure?',
                    options: ['Linked List', 'Tree', 'Graph', 'Heap'],
                    correctAnswer: 'Linked List',
                    explanation: 'A linked list is a linear data structure.',
                    difficulty: 'easy'
                },
                {
                    question: 'A singly-linked-list node contains:',
                    options: ['Data + next pointer', 'Only data', 'Only pointer', 'Two pointers'],
                    correctAnswer: 'Data + next pointer',
                    explanation: 'Each node holds its data and one pointer to the next.',
                    difficulty: 'medium'
                },
                {
                    question: 'Traversal time complexity of a linked list?',
                    options: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'],
                    correctAnswer: 'O(n)',
                    explanation: 'You visit every node exactly once.',
                    difficulty: 'medium'
                }
            ]
        });
        res.status(201).json({ success: true, data: { quizId: quiz._id } });
    } catch (err) { next(err); }
});

// POST /api/dev/full-seed
// Creates 2 documents + flashcards + a completed quiz for the authenticated user
router.post('/full-seed', protect, async (req, res, next) => {
    try {
        const uid = req.user._id;

        // Clear existing demo data for this user
        await Document.deleteMany({ userId: uid });
        await Flashcard.deleteMany({ userId: uid });
        await Quiz.deleteMany({ userId: uid });

        // Document 1
        const doc1 = await Document.create({
            userId: uid,
            title: 'Introduction to Machine Learning',
            fileName: 'intro_ml.pdf',
            filePath: 'uploads/intro_ml.pdf',
            fileSize: 204800,
            numPages: 12,
            extractedText: 'Machine learning is a subset of artificial intelligence that enables systems to learn from data.',
            chunks: [
                { content: 'Machine learning is a subset of AI that enables computers to learn from data.', pageNumber: 1, chunkIndex: 0 },
                { content: 'Supervised learning uses labelled datasets to train algorithms.', pageNumber: 2, chunkIndex: 1 },
            ],
            status: 'processed',
            uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            lastAccessed: new Date(Date.now() - 60 * 60 * 1000),
        });

        // Document 2
        const doc2 = await Document.create({
            userId: uid,
            title: 'Data Structures and Algorithms',
            fileName: 'dsa_notes.pdf',
            filePath: 'uploads/dsa_notes.pdf',
            fileSize: 153600,
            numPages: 8,
            extractedText: 'A data structure is a way of organising data in memory for efficient access and modification.',
            chunks: [
                { content: 'Arrays store elements in contiguous memory locations.', pageNumber: 1, chunkIndex: 0 },
                { content: 'Linked lists allow dynamic memory allocation with nodes pointing to each other.', pageNumber: 2, chunkIndex: 1 },
            ],
            status: 'processed',
            uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            lastAccessed: new Date(Date.now() - 30 * 60 * 1000),
        });

        // Flashcards for doc1
        await Flashcard.create({
            userId: uid, documentId: doc1._id,
            cards: [
                { question: 'What is machine learning?',           answer: 'A subset of AI that enables systems to learn from data without being explicitly programmed.', difficulty: 'easy',   isStarred: true,  isRead: true,  reviewCount: 3 },
                { question: 'What is supervised learning?',        answer: 'A type of ML where the model is trained on labelled data to predict outcomes.',              difficulty: 'medium', isStarred: false, isRead: true,  reviewCount: 2 },
                { question: 'What is overfitting?',                answer: 'When a model learns the training data too well and performs poorly on new data.',             difficulty: 'hard',   isStarred: true,  isRead: false, reviewCount: 1 },
                { question: 'Define a neural network.',            answer: 'A computing system inspired by the human brain, made of interconnected layers of nodes.',     difficulty: 'medium', isStarred: false, isRead: false, reviewCount: 0 },
                { question: 'What is the bias-variance tradeoff?', answer: 'The balance between a model too simple (high bias) and too complex (high variance).',         difficulty: 'hard',   isStarred: true,  isRead: false, reviewCount: 0 },
            ]
        });

        // Flashcards for doc2
        await Flashcard.create({
            userId: uid, documentId: doc2._id,
            cards: [
                { question: 'What is an array?',             answer: 'A data structure storing elements of the same type in contiguous memory.',                    difficulty: 'easy',   isStarred: false, isRead: true,  reviewCount: 4 },
                { question: 'What is a linked list?',        answer: 'A linear structure where each node contains data and a pointer to the next node.',           difficulty: 'easy',   isStarred: true,  isRead: true,  reviewCount: 3 },
                { question: 'What is O(n) complexity?',      answer: 'Linear time — runtime grows in proportion to the input size.',                               difficulty: 'medium', isStarred: false, isRead: true,  reviewCount: 2 },
                { question: 'What is a binary search tree?', answer: 'A tree where left child is smaller and right child is larger than the parent.',              difficulty: 'hard',   isStarred: true,  isRead: false, reviewCount: 1 },
            ]
        });

        // Completed quiz for doc1
        await Quiz.create({
            userId: uid, documentId: doc1._id,
            title: 'Introduction to Machine Learning — Quiz',
            totalQuestions: 3,
            score: 2,
            completedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
            questions: [
                { question: 'What does ML stand for?', options: ['Machine Language','Machine Learning','Meta Logic','Model Learning'], correctAnswer: 'Machine Learning', explanation: 'ML = Machine Learning, a branch of AI.', difficulty: 'easy' },
                { question: 'Which is a supervised learning algorithm?', options: ['K-Means','PCA','Linear Regression','DBSCAN'], correctAnswer: 'Linear Regression', explanation: 'Linear Regression is supervised — it uses labelled data.', difficulty: 'medium' },
                { question: 'What causes overfitting?', options: ['Too little data','Too simple a model','Too much regularisation','Too many epochs on a complex model'], correctAnswer: 'Too many epochs on a complex model', explanation: 'Overfitting happens when a model memorises training data including noise.', difficulty: 'hard' },
            ],
            userAnswers: [
                { questionIndex: 0, selectedAnswer: 'Machine Learning',                  isCorrect: true,  answeredAt: new Date(Date.now() - 3 * 60 * 60 * 1000) },
                { questionIndex: 1, selectedAnswer: 'Linear Regression',                 isCorrect: true,  answeredAt: new Date(Date.now() - 3 * 60 * 60 * 1000) },
                { questionIndex: 2, selectedAnswer: 'Too little data',                   isCorrect: false, answeredAt: new Date(Date.now() - 3 * 60 * 60 * 1000) },
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Full seed complete',
            data: { documents: 2, flashcardSets: 2, quizzes: 1 }
        });
    } catch (err) { next(err); }
});

// DELETE /api/dev/cleanup
// Removes all data owned by the authenticated user and deletes the user account
router.delete('/cleanup', protect, async (req, res, next) => {
    try {
        const uid = req.user._id;
        await Flashcard.deleteMany({ userId: uid });
        await Quiz.deleteMany({ userId: uid });
        await Document.deleteMany({ userId: uid });
        await User.findByIdAndDelete(uid);
        res.status(200).json({ success: true, message: 'Test data cleaned up' });
    } catch (err) { next(err); }
});

export default router;
