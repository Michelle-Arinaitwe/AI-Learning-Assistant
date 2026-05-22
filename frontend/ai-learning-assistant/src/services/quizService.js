import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

// ─────────────────────────────────────────────────────────────────────────────
// Quiz Service
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all quizzes for the logged-in user.
 */
export const getAllQuizzes = async () => {
  const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_ALL);
  return response.data;
};

/**
 * Get all quizzes for a specific document.
 * @param {string} documentId
 */
export const getQuizzesByDocument = async (documentId) => {
  const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_BY_DOCUMENT(documentId));
  return response.data;
};

/**
 * Get a single quiz by ID (questions shown, correct answers hidden).
 * @param {string} quizId
 */
export const getQuizById = async (quizId) => {
  const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_BY_ID(quizId));
  return response.data;
};

/**
 * Submit answers for a quiz.
 * Accepts a plain string array ["A","B","C"] or object array [{selectedAnswer:"A"}].
 * @param {string}   quizId
 * @param {string[]} userAnswers
 */
export const submitQuiz = async (quizId, userAnswers) => {
  const response = await axiosInstance.post(API_PATHS.QUIZZES.SUBMIT(quizId), { userAnswers });
  return response.data;
};

/**
 * Retrieve the detailed results of a completed quiz.
 * Returns 400 if the quiz has not been submitted yet.
 * @param {string} quizId
 */
export const getQuizResults = async (quizId) => {
  const response = await axiosInstance.get(API_PATHS.QUIZZES.RESULTS(quizId));
  return response.data;
};

/**
 * Delete a quiz.
 * @param {string} quizId
 */
export const deleteQuiz = async (quizId) => {
  const response = await axiosInstance.delete(API_PATHS.QUIZZES.DELETE(quizId));
  return response.data;
};
