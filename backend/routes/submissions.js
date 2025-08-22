// src/routes/submissions.js
import express from "express";
import { upload } from "../middleware/multer.js";
import { handleSubmission } from "../Controllers/submissionsController.js";
import Submission from "../modals/Submission.js";

const submissionsRouter = express.Router();

// POST /api/submissions  -> form field name "file"
submissionsRouter.post("/", upload.single("file"), handleSubmission);

// GET list (optionally ?userId=)
submissionsRouter.get("/", async (req, res) => {
  const filter = {};
  if (req.query.userId) filter.userId = req.query.userId;
  const subs = await Submission.find(filter).sort({ createdAt: -1 }).limit(200);
  res.json(subs);
});

// GET /:id
submissionsRouter.get("/:id", async (req, res) => {
  const sub = await Submission.findById(req.params.id);
  if (!sub) return res.status(404).json({ error: "Not found" });
  res.json(sub);
});

export default submissionsRouter;
