import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

// ─────────────────────────────────────────────────────────────────────────────
// AI Service
// All endpoints require the document to have status: 'processed'.
// Responses may take 3–15 s depending on document length.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate AI flashcards for a document.
 * @param {string} documentId
 * @param {number} [count=10]  Number of flashcards to generate (max ~20).
 */
export const generateFlashcards = async (documentId, count = 10) => {
  const response = await axiosInstance.post(
    API_PATHS.AI.GENERATE_FLASHCARDS(documentId),
    { count },
  );
  return response.data;
};

/**
 * Generate an AI multiple-choice quiz for a document.
 * @param {string} documentId
 * @param {number} [questionCount=5]
 * @param {string} [title]           Optional quiz title.
 */
export const generateQuiz = async (documentId, questionCount = 5, title) => {
  const response = await axiosInstance.post(
    API_PATHS.AI.GENERATE_QUIZ(documentId),
    { questionCount, ...(title && { title }) },
  );
  return response.data;
};

/**
 * Generate a plain-text summary of a document.
 * @param {string} documentId
 */
export const generateSummary = async (documentId) => {
  const response = await axiosInstance.post(API_PATHS.AI.GENERATE_SUMMARY(documentId));
  return response.data;
};

/**
 * Send a chat message grounded in a document.
 * @param {string} documentId
 * @param {string} question
 */
export const chat = async (documentId, question) => {
  const response = await axiosInstance.post(
    API_PATHS.AI.CHAT(documentId),
    { question },
  );
  return response.data;
};

/**
 * Ask the AI to explain a concept using the document as context.
 * @param {string} documentId
 * @param {string} concept     The term or idea to explain.
 */
export const explainConcept = async (documentId, concept) => {
  const response = await axiosInstance.post(
    API_PATHS.AI.EXPLAIN_CONCEPT(documentId),
    { concept },
  );
  return response.data;
};

/**
 * Retrieve the full chat history for a document.
 * @param {string} documentId
 */
export const getChatHistory = async (documentId) => {
  const response = await axiosInstance.get(API_PATHS.AI.CHAT_HISTORY(documentId));
  return response.data;
};
