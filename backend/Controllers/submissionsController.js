// src/controllers/submissionsController.js
import cloudinary from "../config/cloudinary.js"; // now exports cloudinary object
import Submission from "../modals/Submission.js";
import { runPython } from "../utils/runPython.js";
import { unlink } from "fs/promises";

/**
 * uploadFileLocal -> Cloudinary -> call python analyzer -> persist report
 * Expects req.file to exist (Multer local file)
 */
export async function handleSubmission(req, res) {
  const userId = req.body.userId || "anonymous";
  const title = req.body.title || req.file?.originalname || "Untitled";
  const topics = (req.body.topics || "").split(",").map(s => s.trim()).filter(Boolean);

  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const submission = await Submission.create({
    userId,
    title,
    topics,
    file: { publicId: "", url: "", bytes: req.file.size, format: "pdf" },
    report: { status: "queued" }
  });

  // Upload to Cloudinary as raw (PDF)
  try {
    const uploadRes = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "raw",
      folder: "cmt-pdfs",
      public_id: `sub_${submission._id}_${Date.now()}`
    });

    submission.file.publicId = uploadRes.public_id;
    submission.file.url = uploadRes.secure_url;
    submission.file.bytes = uploadRes.bytes;
    await submission.save();
  } catch (err) {
    await Submission.findByIdAndUpdate(submission._id, { "report.status": "error", "report.error": "Cloudinary upload failed" });
    await unlink(req.file.path).catch(()=>{});
    return res.status(500).json({ error: "Cloudinary upload failed", details: err.message });
  }

  // mark processing
  await Submission.findByIdAndUpdate(submission._id, { "report.status": "processing" });

  // Run Python analyzer on the local file path
  try {
    const scriptPath = process.env.PYTHON_SCRIPT_PATH;
    const pythonResult = await runPython(scriptPath, [req.file.path, submission._id.toString()]);

    const normalized = normalizeReport(pythonResult);

    await Submission.findByIdAndUpdate(submission._id, { report: normalized }, { new: true });

    await unlink(req.file.path).catch(()=>{});

    const updated = await Submission.findById(submission._id);
    return res.status(201).json(updated);
  } catch (err) {
    await Submission.findByIdAndUpdate(submission._id, {
      "report.status": "error",
      "report.error": err.message
    });
    await unlink(req.file.path).catch(()=>{});
    return res.status(500).json({ error: "Analysis failed", details: err.message });
  }
}

function normalizeReport(an) {
  const plagiarismScoreRaw = (an?.plagiarismScore ?? an?.plagiarism ?? 0);
  const plagiarismScore = (plagiarismScoreRaw <= 1 ? plagiarismScoreRaw * 100 : plagiarismScoreRaw);

  const aiProbability = Number(an?.aiLikelihood ?? an?.aiProbability ?? an?.aiGenerated?.probability ?? 0);

  return {
    status: "done",
    plagiarism: {
      score: isNaN(plagiarismScore) ? 0 : Math.round(plagiarismScore),
      sources: (an?.sources || []).map(s => ({
        title: s.title || s.sourceTitle || "Unknown",
        url: s.url || s.sourceUrl || "",
        overlap: Number(s.overlap ?? s.overlapPct ?? 0)
      })),
      rephrasedDetected: !!an?.rephrasedDetected
    },
    aiGenerated: {
      probability: isNaN(aiProbability) ? 0 : aiProbability,
      entropy: an?.entropy ?? null,
      perplexity: an?.perplexity ?? null,
      watermarkDetected: !!an?.watermarkDetected
    },
    stylometry: {
      consistencyScore: an?.stylometry?.consistencyScore ?? null,
      anomalyDetected: !!an?.stylometry?.anomalyDetected,
      previousMatches: an?.stylometry?.previousMatches || []
    },
    heatmap: Array.isArray(an?.heatmap) ? an.heatmap.map(h => ({ idx: h.idx, score: Number(h.score) })) : [],
    language: an?.language || "en",
    finalVerdict: an?.verdict || an?.finalVerdict || "Review Needed",
    error: null
  };
}
