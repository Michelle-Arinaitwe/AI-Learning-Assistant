import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import ChatHistory from '../models/ChatHistory.js';
import {
    generateFlashcards,
    generateQuiz,
    generateSummary,
    explainConcept,
    chatWithDocument
} from '../services/aiService.js';

// @desc    Generate flashcards from document
// @route   POST /api/ai/generate-flashcards/:documentId
// @access  Private
export const generateFlashcardsAPI = async (req, res, next) => {
    try {
        const { documentId } = req.params;
        const { count = 10 } = req.body;

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
                error: 'Not authorized to generate flashcards for this document',
                statusCode: 403
            });
        }

        if (document.status !== 'processed' || !document.extractedText) {
            return res.status(400).json({
                success: false,
                error: 'Document must be processed before generating flashcards',
                statusCode: 400
            });
        }

        console.log(`[AI] Generating ${count} flashcards for document ${documentId}`);
        const cards = await generateFlashcards(document.extractedText, count);

        // Save flashcards to database
        let flashcard = await Flashcard.findOne({ userId: req.user._id, documentId });
        if (!flashcard) {
            flashcard = new Flashcard({
                userId: req.user._id,
                documentId,
                cards: []
            });
        }

        flashcard.cards = cards;
        await flashcard.save();

        res.status(201).json({
            success: true,
            data: flashcard,
            message: `Generated ${cards.length} flashcards successfully`
        });
    } catch (error) {
        console.error('Error generating flashcards:', error);
        next(error);
    }
};

// @desc    Generate quiz from document
// @route   POST /api/ai/generate-quiz/:documentId
// @access  Private
export const generateQuizAPI = async (req, res, next) => {
    try {
        const { documentId } = req.params;
        const { questionCount = 5, title } = req.body;

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
                error: 'Not authorized to generate quiz for this document',
                statusCode: 403
            });
        }

        if (document.status !== 'processed' || !document.extractedText) {
            return res.status(400).json({
                success: false,
                error: 'Document must be processed before generating quiz',
                statusCode: 400
            });
        }

        console.log(`[AI] Generating quiz with ${questionCount} questions for document ${documentId}`);
        const questions = await generateQuiz(document.extractedText, questionCount);

        const quiz = await Quiz.create({
            userId: req.user._id,
            documentId,
            title: title || `Quiz - ${document.title}`,
            questions,
            totalQuestions: questions.length
        });

        res.status(201).json({
            success: true,
            data: quiz,
            message: `Generated quiz with ${questions.length} questions successfully`
        });
    } catch (error) {
        console.error('Error generating quiz:', error);
        next(error);
    }
};

// @desc    Generate document summary
// @route   POST /api/ai/generate-summary/:documentId
// @access  Private
export const generateSummaryAPI = async (req, res, next) => {
    try {
        const { documentId } = req.params;

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
                error: 'Not authorized to summarize this document',
                statusCode: 403
            });
        }

        if (document.status !== 'processed' || !document.extractedText) {
            return res.status(400).json({
                success: false,
                error: 'Document must be processed before generating summary',
                statusCode: 400
            });
        }

        console.log(`[AI] Generating summary for document ${documentId}`);
        const summary = await generateSummary(document.extractedText);

        res.status(200).json({
            success: true,
            data: { summary },
            message: 'Summary generated successfully'
        });
    } catch (error) {
        console.error('Error generating summary:', error);
        next(error);
    }
};

// @desc    Explain a concept from document
// @route   POST /api/ai/explain-concept/:documentId
// @access  Private
export const explainConceptAPI = async (req, res, next) => {
    try {
        const { documentId } = req.params;
        const { concept } = req.body;

        if (!concept) {
            return res.status(400).json({
                success: false,
                error: 'Concept field is required',
                statusCode: 400
            });
        }

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
                error: 'Not authorized to access this document',
                statusCode: 403
            });
        }

        if (document.status !== 'processed' || !document.extractedText) {
            return res.status(400).json({
                success: false,
                error: 'Document must be processed before explaining concepts',
                statusCode: 400
            });
        }

        console.log(`[AI] Explaining concept "${concept}" for document ${documentId}`);
        const explanation = await explainConcept(concept, document.extractedText);

        res.status(200).json({
            success: true,
            data: { concept, explanation },
            message: 'Explanation generated successfully'
        });
    } catch (error) {
        console.error('Error explaining concept:', error);
        next(error);
    }
};

// @desc    Chat with AI about document
// @route   POST /api/ai/chat/:documentId
// @access  Private
export const chatWithAI = async (req, res, next) => {
    try {
        const { documentId } = req.params;
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({
                success: false,
                error: 'Question field is required',
                statusCode: 400
            });
        }

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
                error: 'Not authorized to access this document',
                statusCode: 403
            });
        }

        if (document.status !== 'processed' || !document.extractedText) {
            return res.status(400).json({
                success: false,
                error: 'Document must be processed before chatting',
                statusCode: 400
            });
        }

        // Get chat history
        let chatHistory = await ChatHistory.findOne({ userId: req.user._id, documentId });
        if (!chatHistory) {
            chatHistory = new ChatHistory({
                userId: req.user._id,
                documentId,
                messages: []
            });
        }

        const conversationHistory = chatHistory.messages.map((msg) => ({
            role: msg.role,
            content: msg.content
        }));

        console.log(`[AI] Answering question for document ${documentId}`);
        const answer = await chatWithDocument(question, document.extractedText, conversationHistory);

        // Save to chat history
        chatHistory.messages.push({
            role: 'user',
            content: question,
            relevantChunks: document.chunks ? document.chunks.map((_, i) => i) : []
        });

        chatHistory.messages.push({
            role: 'assistant',
            content: answer
        });

        await chatHistory.save();

        res.status(200).json({
            success: true,
            data: { question, answer, chatHistoryId: chatHistory._id },
            message: 'Response generated successfully'
        });
    } catch (error) {
        console.error('Error in chat:', error);
        next(error);
    }
};

// @desc    Get chat history for a document
// @route   GET /api/ai/chat-history/:documentId
// @access  Private
export const getChatHistory = async (req, res, next) => {
    try {
        const { documentId } = req.params;

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
                error: 'Not authorized to access this chat history',
                statusCode: 403
            });
        }

        const chatHistory = await ChatHistory.findOne({ userId: req.user._id, documentId });

        res.status(200).json({
            success: true,
            data: chatHistory || { messages: [] },
            message: 'Chat history retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};
