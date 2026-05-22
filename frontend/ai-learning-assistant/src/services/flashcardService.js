import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

// ─────────────────────────────────────────────────────────────────────────────
// Flashcard Service
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all flashcard sets for the logged-in user.
 */
export const getAllFlashcards = async () => {
  const response = await axiosInstance.get(API_PATHS.FLASHCARDS.GET_ALL);
  return response.data;
};

/**
 * Get the flashcard set for a specific document.
 * @param {string} documentId
 */
export const getFlashcardsByDocument = async (documentId) => {
  const response = await axiosInstance.get(API_PATHS.FLASHCARDS.GET_BY_DOCUMENT(documentId));
  return response.data;
};

/**
 * Get all cards the user has starred across all sets.
 */
export const getStarredFlashcards = async () => {
  const response = await axiosInstance.get(API_PATHS.FLASHCARDS.GET_STARRED);
  return response.data;
};

/**
 * Mark a card as reviewed (increments reviewCount + sets lastReviewed).
 * @param {string} flashcardId  - ID of the flashcard set
 * @param {number} cardIndex    - 0-based index of the card
 */
export const reviewCard = async (flashcardId, cardIndex) => {
  const response = await axiosInstance.put(API_PATHS.FLASHCARDS.REVIEW(flashcardId, cardIndex));
  return response.data;
};

/**
 * Toggle a card's starred (favourite) status.
 * @param {string} flashcardId
 * @param {number} cardIndex
 */
export const toggleFavorite = async (flashcardId, cardIndex) => {
  const response = await axiosInstance.put(API_PATHS.FLASHCARDS.TOGGLE_FAVORITE(flashcardId, cardIndex));
  return response.data;
};

/**
 * Toggle a card's read status (isRead true ↔ false).
 * @param {string} flashcardId
 * @param {number} cardIndex
 */
export const markCardAsRead = async (flashcardId, cardIndex) => {
  const response = await axiosInstance.put(API_PATHS.FLASHCARDS.MARK_READ(flashcardId, cardIndex));
  return response.data;
};

/**
 * Delete a single card from a flashcard set.
 * @param {string} flashcardId
 * @param {number} cardIndex
 */
export const deleteCard = async (flashcardId, cardIndex) => {
  const response = await axiosInstance.delete(API_PATHS.FLASHCARDS.DELETE_CARD(flashcardId, cardIndex));
  return response.data;
};

/**
 * Delete an entire flashcard set.
 * @param {string} flashcardId
 */
export const deleteFlashcardSet = async (flashcardId) => {
  const response = await axiosInstance.delete(API_PATHS.FLASHCARDS.DELETE_SET(flashcardId));
  return response.data;
};
