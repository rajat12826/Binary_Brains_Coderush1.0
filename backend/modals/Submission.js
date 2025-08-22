// src/models/Submission.js
import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  // Basic info
  userId:{
type: String,
    required: true,
    
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  
  description: {
    type: String,
    default: '',
    maxLength: 500
  },
  
  // Content identifier (to prevent duplicate analysis)
  contentHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // File storage
  fileUrl: {
    type: String,
    default: null
  },
  
  // Analysis results
  analysis: {
    // Document metadata
    documentInfo: {
      wordCount: { type: Number, default: 0 },
      sentenceCount: { type: Number, default: 0 },
      title: String,
      description: String
    },
    
    // Core metrics
    metrics: {
      // Perplexity score (lower = more predictable/AI-like)
      perplexity: {
        type: Number,
        min: 0,
        max: 1000,
        default: 0
      },
      
      // Character entropy (measure of randomness)
      entropy: {
        type: Number,
        min: 0,
        max: 10,
        default: 0
      },
      
      // Writing style analysis
      stylometry: {
        avgSentenceLength: { type: Number, default: 0 },
        lexicalDiversity: { type: Number, min: 0, max: 1, default: 0 },
        consistencyScore: { type: Number, min: 0, max: 1, default: 0 }
      },
      
      // AI detection results
      aiDetection: {
        probability: { type: Number, min: 0, max: 1, default: 0 },
        confidence: { type: Number, min: 0, max: 1, default: 0 },
        indicators: [String]
      },
      
      // Watermark detection
      watermark: {
        detected: { type: Boolean, default: false },
        type: { type: String, default: null },
        confidence: { type: Number, min: 0, max: 1, default: 0 }
      }
    },
    
    // Overall assessment
    assessment: {
      aiProbability: { type: Number, min: 0, max: 1, required: true },
      humanProbability: { type: Number, min: 0, max: 1, required: true },
      riskLevel: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        required: true
      },
      verdict: {
        type: String,
        enum: ['HUMAN_WRITTEN', 'SUSPICIOUS', 'LIKELY_AI', 'AI_GENERATED'],
        required: true
      }
    },
    Appointed:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
    reviewStatus:{type:String,default:"PENDING",enum:["PENDING","APPROVED","REJECTED"]},

    
    // Processing metadata
    processingTime: { type: Number, default: 0 } // milliseconds
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'submissions'
});

// Indexes for better query performance
submissionSchema.index({ createdAt: -1 });
submissionSchema.index({ 'analysis.assessment.verdict': 1 });
submissionSchema.index({ 'analysis.assessment.riskLevel': 1 });

// Virtual for human-readable risk level
submissionSchema.virtual('riskDescription').get(function() {
  const risk = this.analysis?.assessment?.riskLevel;
  switch (risk) {
    case 'HIGH': return 'High risk of AI generation detected';
    case 'MEDIUM': return 'Moderate AI indicators present';
    case 'LOW': return 'Low AI risk - appears human-written';
    default: return 'Analysis pending';
  }
});

// Method to get summary data
submissionSchema.methods.getSummary = function() {
  return {
    id: this._id,
    title: this.title,
    verdict: this.analysis?.assessment?.verdict,
    aiProbability: this.analysis?.assessment?.aiProbability,
    riskLevel: this.analysis?.assessment?.riskLevel,
    wordCount: this.analysis?.documentInfo?.wordCount,
    analyzedAt: this.createdAt
  };
};

// Static method to get analytics
submissionSchema.statics.getAnalytics = async function(days = 30) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const pipeline = [
    { $match: { createdAt: { $gte: cutoff } } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        humanWritten: { 
          $sum: { $cond: [{ $eq: ["$analysis.assessment.verdict", "HUMAN_WRITTEN"] }, 1, 0] }
        },
        suspicious: { 
          $sum: { $cond: [{ $eq: ["$analysis.assessment.verdict", "SUSPICIOUS"] }, 1, 0] }
        },
        likelyAI: { 
          $sum: { $cond: [{ $eq: ["$analysis.assessment.verdict", "LIKELY_AI"] }, 1, 0] }
        },
        aiGenerated: { 
          $sum: { $cond: [{ $eq: ["$analysis.assessment.verdict", "AI_GENERATED"] }, 1, 0] }
        },
        avgAIProbability: { $avg: "$analysis.assessment.aiProbability" },
        avgPerplexity: { $avg: "$analysis.metrics.perplexity" },
        avgEntropy: { $avg: "$analysis.metrics.entropy" }
      }
    }
  ];
  
  const [result] = await this.aggregate(pipeline);
  return result || {
    total: 0,
    humanWritten: 0,
    suspicious: 0,
    likelyAI: 0,
    aiGenerated: 0,
    avgAIProbability: 0,
    avgPerplexity: 0,
    avgEntropy: 0
  };
};

// src/models/Submission.js
submissionSchema.statics.countCleanPapers = async function(userId = null) {
  const filter = {
    "analysis.assessment.verdict": "HUMAN_WRITTEN",
    "analysis.metrics.watermark.type": null,
    $or: [
      { "analysis.metrics.aiDetection.indicators": { $exists: false } },
      { "analysis.metrics.aiDetection.indicators": { $size: 0 } }
    ]
  };

  if (userId) filter.userId = userId;

  const count = await this.countDocuments(filter);
  return count;
};



const Submission = mongoose.model('Submission', submissionSchema);


export default Submission;

