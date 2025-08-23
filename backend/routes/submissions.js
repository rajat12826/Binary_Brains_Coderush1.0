// src/routes/submissions.js
import express from "express";
import axios from "axios"
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

// submissionsRouter.get('/download/:id', async (req, res) => {
//   try {
//     const submission = await Submission.findById(req.params.id);
//     if (!submission || !submission.fileUrl) {
//       return res.status(404).send('File not found');
//     }

//     // Stream the file from Cloudinary
//     const response = await axios.get(submission.fileUrl, { responseType: 'stream' });

//     // Set headers for PDF download
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename="${submission.title}.pdf"`);

//     // Pipe to client
//     response.data.pipe(res);

//   } catch (err) {
//     console.error('Download error:', err.message);
//     res.status(500).send('Server error while downloading PDF');
//   }
// });

// Step 1: Add this debug route to your router to check submission data
submissionsRouter.get('/debug/:id', async (req, res) => {
  try {
    console.log('=== DEBUG SUBMISSION ===');
    console.log('Requested ID:', req.params.id);
    
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      console.log('❌ Submission not found');
      return res.json({
        found: false,
        id: req.params.id,
        message: 'Submission not found in database'
      });
    }

    console.log('✅ Submission found');
    console.log('Title:', submission.title);
    console.log('FileURL exists:', !!submission.fileUrl);
    console.log('FileURL value:', submission.fileUrl);

    res.json({
      found: true,
      submission: {
        id: submission._id,
        title: submission.title,
        userId: submission.userId,
        hasFileUrl: !!submission.fileUrl,
        fileUrl: submission.fileUrl,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt
      },
      debug: {
        fileUrlType: typeof submission.fileUrl,
        fileUrlLength: submission.fileUrl?.length || 0,
        isValidUrl: submission.fileUrl?.startsWith('http') || false
      }
    });

  } catch (err) {
    console.error('❌ Debug route error:', err);
    res.status(500).json({
      error: 'Debug failed',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Step 2: Enhanced download route with extensive logging
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
}
);

submissionsRouter.get("/assigned/:userId", async (req, res) => {
  console.log(req.params.userId)
  try {
   const submissions = await Submission.find({ "analysis.Appointed": req.params.userId })

      .sort({ createdAt: -1 });
    res.json({ submissions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch assigned submissions" });
  }
});
// PUT /api/submissions/:id/review
submissionsRouter.put("/review/:id", async (req, res) => {
  try {
    const { reviewStatus } = req.body;
    if (!["APPROVED", "REJECTED"].includes(reviewStatus)) {
      return res.status(400).json({ message: "Invalid review status" });
    }

    const updated = await Submission.findByIdAndUpdate(
      req.params.id,
      { "analysis.reviewStatus": reviewStatus },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.json({ submission: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update review status" });
  }
});


submissionsRouter.put("/:id/assign", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  console.log(userId);
  console.log(id);

  try {
    const submission = await Submission.findById(id);
if (!submission) return res.status(404).json({ error: "Submission not found" });

// Ensure analysis object exists
if (!submission.analysis) {
  submission.analysis = {
    Appointed: userId,
    reviewStatus: "PENDING"
  };
} else {
  submission.analysis.Appointed = userId;
  submission.analysis.reviewStatus = submission.analysis.reviewStatus || "PENDING";
}

await submission.save();
console.log(submission.analysis.Appointed);
res.json({ success: true,submissions: submission.analysis.Appointed });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});



export default submissionsRouter;