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
