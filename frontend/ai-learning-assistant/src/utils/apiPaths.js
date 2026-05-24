
// API Paths — single source of truth for every backend endpoint.
// Import from here instead of hard-coding URLs in services or components.

export const API_PATHS = {
//Authentication & User Management
  AUTH: {
    REGISTER:  '/auth/register',
    LOGIN:     '/auth/login',
    PROFILE:   '/auth/profile',
    LOGOUT:    '/auth/logout',
  },

  //Documents & File Management
  DOCUMENTS: {
    GET_ALL:   '/documents',
    UPLOAD:    '/documents',
    GET_BY_ID: (id)       => `/documents/${id}`,
    DELETE:    (id)       => `/documents/${id}`,
  },

  //Flashcards
  FLASHCARDS: {
    GET_ALL:        '/flashcards',
    GET_STARRED:    '/flashcards/starred/all',
    GET_BY_DOCUMENT:(documentId)              => `/flashcards/document/${documentId}`,
    REVIEW:         (flashcardId, cardIndex)  => `/flashcards/${flashcardId}/review/${cardIndex}`,
    TOGGLE_FAVORITE:(flashcardId, cardIndex)  => `/flashcards/${flashcardId}/toggle-favorite/${cardIndex}`,
    MARK_READ:      (flashcardId, cardIndex)  => `/flashcards/${flashcardId}/mark-read/${cardIndex}`,
    DELETE_CARD:    (flashcardId, cardIndex)  => `/flashcards/${flashcardId}/card/${cardIndex}`,
    DELETE_SET:     (flashcardId)             => `/flashcards/${flashcardId}`,
  },

  //Quizzes
  QUIZZES: {
    GET_ALL:        '/quizzes',
    GET_BY_DOCUMENT:(documentId) => `/quizzes/document/${documentId}`,
    GET_BY_ID:      (quizId)     => `/quizzes/${quizId}`,
    SUBMIT:         (quizId)     => `/quizzes/${quizId}/submit`,
    RESULTS:        (quizId)     => `/quizzes/${quizId}/results`,
    DELETE:         (quizId)     => `/quizzes/${quizId}`,
  },

  //ai
  AI: {
    GENERATE_FLASHCARDS:(documentId) => `/ai/generate-flashcards/${documentId}`,
    GENERATE_QUIZ:      (documentId) => `/ai/generate-quiz/${documentId}`,
    GENERATE_SUMMARY:   (documentId) => `/ai/generate-summary/${documentId}`,
    CHAT:               (documentId) => `/ai/chat/${documentId}`,
    EXPLAIN_CONCEPT:    (documentId) => `/ai/explain-concept/${documentId}`,
    CHAT_HISTORY:       (documentId) => `/ai/chat-history/${documentId}`,
  },

  //Dashboard & Analytics
  DASHBOARD: {
    OVERVIEW: '/dashboard/overview',
    STATS:    '/dashboard/stats',
    PROGRESS: '/dashboard/progress',
  },
};
