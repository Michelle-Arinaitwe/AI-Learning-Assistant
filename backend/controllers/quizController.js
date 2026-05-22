import Quiz from '../models/Quiz.js';
import Document from '../models/Document.js';

// @desc    Get all quizzes for current user
// @route   GET /api/quizzes
// @access  Private
export const getAllQuizzes = async (req, res, next) => {
    try {
        const quizzes = await Quiz.find({ userId: req.user._id })
            .populate('documentId', 'title fileName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: quizzes.length,
            data: quizzes
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get quizzes for a specific document
// @route   GET /api/quizzes/document/:documentId
// @access  Private
export const getQuizzesByDocument = async (req, res, next) => {
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
                error: 'Not authorized to access these quizzes',
                statusCode: 403
            });
        }

        const quizzes = await Quiz.find({ userId: req.user._id, documentId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: quizzes.length,
            data: quizzes
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a single quiz by ID
// @route   GET /api/quizzes/:quizId
// @access  Private
export const getQuizById = async (req, res, next) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz not found',
                statusCode: 404
            });
        }

        if (quiz.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to access this quiz',
                statusCode: 403
            });
        }

        res.status(200).json({
            success: true,
            data: quiz
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Submit quiz answers and get results
// @route   POST /api/quizzes/:quizId/submit
// @access  Private
export const submitQuiz = async (req, res, next) => {
    try {
        const { userAnswers } = req.body;

        if (!userAnswers || !Array.isArray(userAnswers)) {
            return res.status(400).json({
                success: false,
                error: 'userAnswers array is required',
                statusCode: 400
            });
        }

        const quiz = await Quiz.findById(req.params.quizId);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz not found',
                statusCode: 404
            });
        }

        if (quiz.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to submit this quiz',
                statusCode: 403
            });
        }

        // Process answers — accept plain strings ["A","B"] or objects [{selectedAnswer:"A"}]
        let correctCount = 0;
        const processedAnswers = userAnswers.map((answer, index) => {
            const question = quiz.questions[index];
            const selectedAnswer = typeof answer === 'string' ? answer : answer.selectedAnswer;
            const isCorrect = question && selectedAnswer === question.correctAnswer;

            if (isCorrect) {
                correctCount++;
            }

            return {
                questionIndex: index,
                selectedAnswer,
                isCorrect
            };
        });

        // Calculate score
        const score = Math.round((correctCount / quiz.totalQuestions) * 100);

        // Update quiz
        quiz.userAnswers = processedAnswers;
        quiz.score = score;
        quiz.completedAt = new Date();

        await quiz.save();

        res.status(200).json({
            success: true,
            data: {
                quizId: quiz._id,
                score,
                totalQuestions: quiz.totalQuestions,
                correctAnswers: correctCount,
                completedAt: quiz.completedAt
            },
            message: 'Quiz submitted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get quiz results
// @route   GET /api/quizzes/:quizId/results
// @access  Private
export const getQuizResults = async (req, res, next) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz not found',
                statusCode: 404
            });
        }

        if (quiz.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view these results',
                statusCode: 403
            });
        }

        if (!quiz.completedAt) {
            return res.status(400).json({
                success: false,
                error: 'Quiz has not been completed yet',
                statusCode: 400
            });
        }

        // Build detailed results
        const results = {
            quizId: quiz._id,
            title: quiz.title,
            score: quiz.score,
            totalQuestions: quiz.totalQuestions,
            correctAnswers: quiz.userAnswers.filter((a) => a.isCorrect).length,
            completedAt: quiz.completedAt,
            questions: quiz.questions.map((question, index) => ({
                questionIndex: index,
                question: question.question,
                options: question.options,
                correctAnswer: question.correctAnswer,
                explanation: question.explanation,
                userAnswer: quiz.userAnswers[index]?.selectedAnswer || null,
                isCorrect: quiz.userAnswers[index]?.isCorrect || false,
                difficulty: question.difficulty
            }))
        };

        res.status(200).json({
            success: true,
            data: results
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:quizId
// @access  Private
export const deleteQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz not found',
                statusCode: 404
            });
        }

        if (quiz.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this quiz',
                statusCode: 403
            });
        }

        await Quiz.findByIdAndDelete(req.params.quizId);

        res.status(200).json({
            success: true,
            message: 'Quiz deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
