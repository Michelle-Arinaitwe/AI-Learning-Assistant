import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Service
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the dashboard overview.
 * Returns counts for documents, flashcard sets, quizzes, and recent activity.
 */
export const getOverview = async () => {
  const response = await axiosInstance.get(API_PATHS.DASHBOARD.OVERVIEW);
  return response.data;
};

/**
 * Get detailed learning statistics.
 * Returns total pages read, cards reviewed, quiz scores, etc.
 */
export const getStats = async () => {
  const response = await axiosInstance.get(API_PATHS.DASHBOARD.STATS);
  return response.data;
};

/**
 * Get progress broken down by difficulty level (easy / medium / hard).
 */
export const getProgress = async () => {
  const response = await axiosInstance.get(API_PATHS.DASHBOARD.PROGRESS);
  return response.data;
};
