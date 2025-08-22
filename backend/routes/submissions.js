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
  getAdminStats,
  getSubmissions
} from "../Controllers/submissionsController.js";
import Submission from "../modals/Submission.js";

const submissionsRouter = express.Router();

// POST /api/submissions -> form field name "file"
submissionsRouter.post("/", upload.single("file"), handleSubmissionImmediate);

// GET /api/submissions/:id/status -> Check status (for polling)
submissionsRouter.get("/:id/status", getSubmissionStatus);
// GET /api/submissions/:id/status -> Check status (for polling)
submissionsRouter.get("/allSub", getAllSubmissions);
submissionsRouter.get("/allSubmissions", getSubmissions);
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

// total submissions
submissionsRouter.get("/total/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const total = await Submission.countDocuments({ userId: id });
    console.log(total)
    res.json({ total });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// AI-flagged
submissionsRouter.get("/aitotal/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const aitotal = await Submission.countDocuments({
      userId: id,
      "analysis.metrics.aiDetection.indicators.0": { $exists: true }
    });
    console.log(aitotal)
    res.json({ aitotal });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Watermark/Plagiarism
submissionsRouter.get("/ptotal/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const ptotal = await Submission.countDocuments({
      userId: id,
      "analysis.metrics.watermark.type": null
    });
    console.log(ptotal)
    res.json({ ptotal });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// routes/submissions.js
// src/routes/submissions.js

submissionsRouter.get("/clean/:Id", async (req, res) => {
  try {
    const { userId } = req.params;
    const cleanCount = await Submission.countCleanPapers(userId);
    res.json({ cleanCount });
  } catch (err) {
    console.error("Error fetching clean papers:", err);
    res.status(500).json({ error: "Server error" });
  }
});



submissionsRouter.get("/user/:id", async (req, res) => {
  console.log('hi')
  try {
    const { id } = req.params;
    // console.log(id)
    const submissions = await Submission.find({ userId: id });
    // console.log(submissions)
    res.json({ success: true, submissions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

submissionsRouter.get('/download/:id', async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission || !submission.fileUrl) {
      return res.status(404).send('File not found');
    }

    // Stream the file from Cloudinary
    const response = await axios.get(submission.fileUrl, { responseType: 'stream' });

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${submission.title}.pdf"`);

    // Pipe to client
    response.data.pipe(res);

  } catch (err) {
    console.error('Download error:', err.message);
    res.status(500).send('Server error while downloading PDF');
  }
});


export default submissionsRouter;