  // src/controllers/submissionsController.js
  import cloudinary from "../config/cloudinary.js"; // now exports cloudinary object
  import Submission from "../modals/Submission.js";
  import { runPython } from "../utils/runPython.js";
  import { unlink } from "fs/promises";

  /**
   * uploadFileLocal -> Cloudinary -> call python analyzer -> persist report
   * Expects req.file to exist (Multer local file)
   */
import { Readable } from "stream";

function bufferToStream(buffer) {
  return Readable.from(buffer);
}

export async function handleSubmission(req, res) {
  const userId = req.body.userId || "anonymous";
  const title = req.body.title || req.file?.originalname || "Untitled";
  const topics = (req.body.topics || "").split(",").map(s => s.trim()).filter(Boolean);

  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  let submission;
  try {
    submission = await Submission.create({
      userId,
      title,
      topics,
      report: { status: "queued" }
    });
  } catch (err) {
    console.error("Error creating submission doc:", err);
    return res.status(500).json({ error: "Failed to create submission", details: err.message });
  }

  // Upload buffer to Cloudinary
  try {
    const uploadRes = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "cmt-pdfs",
          public_id: `sub_${submission._id}_${Date.now()}`
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );

      bufferToStream(req.file.buffer).pipe(uploadStream);
    });

    submission.file = {
      publicId: uploadRes.public_id,
      url: uploadRes.secure_url,
      bytes: uploadRes.bytes,
      format: uploadRes.format || req.file.mimetype.split("/")[1]
    };
    await submission.save();
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    await Submission.findByIdAndUpdate(submission._id, { "report.status": "error", "report.error": "Cloudinary upload failed" }).catch(()=>{});
    return res.status(500).json({ error: "Cloudinary upload failed", details: err.message });
  }

  // Mark processing
  await Submission.findByIdAndUpdate(submission._id, { "report.status": "processing" });

  // Run Python analyzer (send Cloudinary URL instead of local path)
  try {
    const scriptPath = process.env.PYTHON_SCRIPT_PATH;
    const pythonResult = await runPython(scriptPath, [submission.file.url, submission._id.toString()]);

    const normalized = normalizeReport(pythonResult);
    await Submission.findByIdAndUpdate(submission._id, { report: normalized }, { new: true });

    const updated = await Submission.findById(submission._id);
    return res.status(201).json({ success: true, submission: updated, message: "Analysis completed" });
  } catch (err) {
    console.error("Analysis failed:", err);
    await Submission.findByIdAndUpdate(submission._id, {
      "report.status": "error",
      "report.error": err.message
    });
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
