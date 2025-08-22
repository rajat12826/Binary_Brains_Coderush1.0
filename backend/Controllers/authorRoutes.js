import express from "express";
import Submission from "../modals/Submission.js";

const router = express.Router();

router.get("/total/:authorId", async (req, res) => {
  try {
    const { authorId } = req.params;
    const total = await Submission.countDocuments({ userId: authorId });
    res.json({ total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});




export default router;
