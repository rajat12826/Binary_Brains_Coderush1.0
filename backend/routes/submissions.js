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
  console.log('\n=== DOWNLOAD REQUEST START ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Requested ID:', req.params.id);
  
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('❌ Invalid ObjectId format');
      return res.status(400).send('Invalid submission ID format');
    }

    // Find submission
    console.log('🔍 Looking up submission in database...');
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      console.log('❌ Submission not found in database');
      return res.status(404).send('Submission not found');
    }

    console.log('✅ Submission found:', {
      id: submission._id,
      title: submission.title,
      hasFileUrl: !!submission.fileUrl
    });

    if (!submission.fileUrl) {
      console.log('❌ No fileUrl in submission');
      return res.status(404).send('File URL not found - file may not have been uploaded to cloud storage');
    }

    console.log('🔗 FileURL:', submission.fileUrl);

    // Test if URL is accessible
    console.log('🌐 Testing Cloudinary URL accessibility...');
    
    try {
      // First, try a HEAD request to test if the URL is accessible
      const headResponse = await axios.head(submission.fileUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'PlagioGuard-Server/1.0'
        }
      });
      
      console.log('✅ HEAD request successful:', {
        status: headResponse.status,
        contentType: headResponse.headers['content-type'],
        contentLength: headResponse.headers['content-length']
      });
    } catch (headError) {
      console.log('❌ HEAD request failed:', {
        message: headError.message,
        status: headError.response?.status,
        statusText: headError.response?.statusText
      });
      
      return res.status(503).send(`File not accessible: ${headError.message}`);
    }

    // Now try to stream the file
    console.log('📥 Starting file stream from Cloudinary...');
    const response = await axios.get(submission.fileUrl, {
      responseType: 'stream',
      timeout: 30000,
      headers: {
        'User-Agent': 'PlagioGuard-Server/1.0'
      }
    });

    console.log('✅ Stream started successfully:', {
      status: response.status,
      contentType: response.headers['content-type']
    });

    // Set download headers
    const filename = `${submission.title || 'document'}.pdf`;
    console.log('📄 Setting download headers for:', filename);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');

    // Handle stream events
    response.data.on('error', (streamError) => {
      console.error('❌ Stream error:', streamError);
      if (!res.headersSent) {
        res.status(500).send('Stream error while downloading');
      }
    });

    response.data.on('end', () => {
      console.log('✅ Download completed successfully');
      console.log('=== DOWNLOAD REQUEST END ===\n');
    });

    // Pipe to response
    response.data.pipe(res);

  } catch (error) {
    console.error('❌ Download error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url
    });
    console.log('=== DOWNLOAD REQUEST FAILED ===\n');

    if (!res.headersSent) {
      if (error.code === 'ENOTFOUND') {
        res.status(503).send('Cloudinary service not reachable');
      } else if (error.response?.status === 404) {
        res.status(404).send('File not found in Cloudinary storage');
      } else if (error.code === 'ECONNABORTED') {
        res.status(504).send('Download timeout - file too large or connection slow');
      } else {
        res.status(500).send(`Server error while downloading PDF: ${error.message}`);
      }
    }
  }
});

// Step 3: Simple direct redirect route (fallback option)
submissionsRouter.get('/redirect/:id', async (req, res) => {
  try {
    console.log('Direct redirect request for:', req.params.id);
    
    const submission = await Submission.findById(req.params.id);
    
    if (!submission || !submission.fileUrl) {
      return res.status(404).send('File not found');
    }

    console.log('Redirecting to:', submission.fileUrl);
    res.redirect(submission.fileUrl);
    
  } catch (err) {
    console.error('Redirect error:', err);
    res.status(500).send('Redirect failed');
  }
});


export default submissionsRouter;