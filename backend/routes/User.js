import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../modals/User.js";
import { adminLogin } from "../Controllers/user.controller.js";
import { getAllUsersAnalytics, getUserAnalytics, getUserSubmissions } from "../Controllers/submissionsController.js";
import { users } from "@clerk/clerk-sdk-node";
const router = express.Router();




router.post("/adminlogin", adminLogin);
router.get('/:userId', getUserAnalytics);

// Get user submissions with pagination and filters
// GET /api/analytics/user/:userId/submissions?page=1&limit=10&status=PENDING
router.get('/:userId/submissions', getUserSubmissions);

// Get analytics for all users (admin endpoint)
// GET /api/analytics/overview?period=30
router.get('/overview', getAllUsersAnalytics);

router.get("/", async (req, res) => {
  try {
    // List users from Clerk
    const allUsers = await users.getUserList({ limit: 100 }); // adjust limit as needed

    // Map to minimal info you want
    const result = allUsers.map(u => ({
      _id: u.id,
      name: u.firstName + " " + (u.lastName || ""),
      email: u.emailAddresses[0]?.emailAddress || ""
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});


export default router;