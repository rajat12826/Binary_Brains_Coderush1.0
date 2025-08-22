// src/routes/submissions.js
import express from "express";
import { upload } from "../middleware/multer.js";
import { 
  handleSubmissionImmediate, 
  getSubmissionStatus, 
  getSubmissionReport,
  listSubmissions, 
  getAllSubmissions,
  getStudentProfiles,
  getAdminStats
} from "../Controllers/submissionsController.js";
import Submission from "../modals/Submission.js";

const submissionsRouter = express.Router();

// POST /api/submissions -> form field name "file"
submissionsRouter.post("/", upload.single("file"), handleSubmissionImmediate);

// GET /api/submissions/:id/status -> Check status (for polling)
submissionsRouter.get("/:id/status", getSubmissionStatus);
// GET /api/submissions/:id/status -> Check status (for polling)
submissionsRouter.get("/allSub", getAllSubmissions);
submissionsRouter.get("/getAdminStats", getAdminStats);
submissionsRouter.get("/studentSub", getStudentProfiles);
// GET /api/submissions/:id/report -> Get detailed report
submissionsRouter.get("/:id/report", getSubmissionReport);

// GET /api/submissions -> List submissions (optionally ?userId=)
submissionsRouter.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.userId) filter.userId = req.query.userId;
    
    const subs = await Submission.find(filter)
      .select('title analysis.assessment userId createdAt')
      .sort({ createdAt: -1 })
      .limit(200);
    
    const formattedSubs = subs.map(sub => ({
      id: sub._id,
      title: sub.title,
      userId: sub.userId,
      verdict: sub.analysis?.assessment?.verdict || 'UNKNOWN',
      riskLevel: sub.analysis?.assessment?.riskLevel || 'UNKNOWN',
      aiProbability: sub.analysis?.assessment?.aiProbability || 0,
      analyzedAt: sub.createdAt
    }));
    
    res.json({
      success: true,
      submissions: formattedSubs,
      total: formattedSubs.length
    });
  } catch (error) {
    console.error("Error listing submissions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to list submissions"
    });
  }
});

// GET /api/submissions/:id -> Get single submission
submissionsRouter.get("/:id", async (req, res) => {
  try {
    const sub = await Submission.findById(req.params.id);
    if (!sub) {
      return res.status(404).json({ 
        success: false,
        error: "Submission not found" 
      });
    }
    
    res.json({
      success: true,
      submission: {
        id: sub._id,
        title: sub.title,
        description: sub.description,
        userId: sub.userId,
        analysis: sub.analysis,
        createdAt: sub.createdAt
      }
    });
  } catch (error) {
    console.error("Error fetching submission:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch submission"
    });
  }
});

// Analytics endpoint
submissionsRouter.get("/analytics/summary", async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const total = await Submission.countDocuments({ createdAt: { $gte: cutoff } });
    const humanWritten = await Submission.countDocuments({ 
      createdAt: { $gte: cutoff },
      'analysis.assessment.verdict': 'HUMAN_WRITTEN'
    });
    const aiGenerated = await Submission.countDocuments({ 
      createdAt: { $gte: cutoff },
      'analysis.assessment.verdict': { $in: ['LIKELY_AI', 'AI_GENERATED'] }
    });
    
    res.json({
      success: true,
      analytics: {
        total,
        humanWritten,
        aiGenerated,
        suspicious: total - humanWritten - aiGenerated,
        period: `Last ${days} days`,
        aiDetectionRate: total > 0 ? Math.round((aiGenerated / total) * 100) : 0
      }
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
});

export default submissionsRouter;