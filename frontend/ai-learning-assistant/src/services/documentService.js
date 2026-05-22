import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

// ─────────────────────────────────────────────────────────────────────────────
// Document Service
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all documents belonging to the logged-in user.
 */
export const getAllDocuments = async () => {
  const response = await axiosInstance.get(API_PATHS.DOCUMENTS.GET_ALL);
  return response.data;
};

/**
 * Fetch a single document by ID.
 * @param {string} id
 */
export const getDocumentById = async (id) => {
  const response = await axiosInstance.get(API_PATHS.DOCUMENTS.GET_BY_ID(id));
  return response.data;
};

/**
 * Upload a PDF document.
 * @param {FormData} formData  Must contain the `document` file field and optionally `title`.
 */
export const uploadDocument = async (formData) => {
  const response = await axiosInstance.post(API_PATHS.DOCUMENTS.UPLOAD, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Delete a document by ID.
 * @param {string} id
 */
export const deleteDocument = async (id) => {
  const response = await axiosInstance.delete(API_PATHS.DOCUMENTS.DELETE(id));
  return response.data;
};
