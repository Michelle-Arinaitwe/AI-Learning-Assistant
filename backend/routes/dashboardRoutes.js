import express from 'express';
import protect from '../middleware/auth.js';
import {
    getDashboardOverview,
    getLearningStats,
    getProgressByDifficulty
} from '../controllers/dashboardController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Dashboard endpoints
router.get('/overview', getDashboardOverview);
router.get('/stats', getLearningStats);
router.get('/progress', getProgressByDifficulty);

export default router;
