
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../modals/User.js";
import { adminLogin } from "../Controllers/user.controller.js";
import { getAllUsersAnalytics, getUserAnalytics, getUserSubmissions } from "../Controllers/submissionsController.js";

const router = express.Router();




router.post("/adminlogin", adminLogin);
router.get('/:userId', getUserAnalytics);

// Get user submissions with pagination and filters
// GET /api/analytics/user/:userId/submissions?page=1&limit=10&status=PENDING
router.get('/:userId/submissions', getUserSubmissions);

// Get analytics for all users (admin endpoint)
// GET /api/analytics/overview?period=30
router.get('/overview', getAllUsersAnalytics);



export default router;