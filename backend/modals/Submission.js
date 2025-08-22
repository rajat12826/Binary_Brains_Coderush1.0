import mongoose from "mongoose";

const SourceMatchSchema = new mongoose.Schema({
  title: String,
  url: String,
  overlap: { type: Number, min: 0, max: 100 }
}, { _id: false });

const HeatmapSchema = new mongoose.Schema({
  idx: Number,
  score: { type: Number, min: 0, max: 1 }
}, { _id: false });

const ReportSchema = new mongoose.Schema({
  status: { type: String, enum: ["queued","processing","done","error"], default: "queued" },

  plagiarism: {
    score: { type: Number, min: 0, max: 100, default: 0 },
    sources: [SourceMatchSchema],
    rephrasedDetected: { type: Boolean, default: false }
  },

  aiGenerated: {
    probability: { type: Number, min: 0, max: 1, default: 0 },
    entropy: Number,
    perplexity: Number,
    watermarkDetected: { type: Boolean, default: false }
  },

  stylometry: {
    consistencyScore: { type: Number, min: 0, max: 1, default: null },
    anomalyDetected: { type: Boolean, default: false },
    previousMatches: [String]
  },

  heatmap: [HeatmapSchema],
  language: { type: String },
  finalVerdict: { type: String, enum: ["Safe","Review Needed","High Risk"], default: "Review Needed" },
  error: { type: String, default: null }
}, { _id: false });

const FileSchema = new mongoose.Schema({
  publicId: { type: String, required: true },
  url: { type: String, required: true },
  bytes: Number,
  format: String
}, { _id: false });

const SubmissionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, default: "Untitled" },
  topics: [String],
  file: FileSchema,
  textExcerpt: { type: String, default: "" },
  report: ReportSchema
}, { timestamps: true });

SubmissionSchema.index({ "report.status": 1, createdAt: -1 });

export default mongoose.model("Submission", SubmissionSchema);
