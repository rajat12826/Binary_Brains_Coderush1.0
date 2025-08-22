// src/models/Submission.js
import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: 'anonymous'
  },
  title: {
    type: String,
    required: true
  },
  topics: [{
    type: String
  }],
  file: {
    publicId: String,
    url: String,
    bytes: Number,
    format: String
  },
  report: {
    status: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'error'],
      default: 'queued'
    },
    timestamp: Date,
    error: String,
    
    // Document Information
    documentInfo: {
      title: String,
      topics: [String],
      wordCount: Number,
      pageEstimate: Number
    },
    
    // Overall Integrity Analysis
    integrityAnalysis: {
      overallScore: {
        type: Number,
        min: 0,
        max: 100
      },
      riskLevel: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH']
      },
      summary: String
    },
    
    // AI Detection Results
    aiDetection: {
      probabilityScore: {
        type: Number,
        min: 0,
        max: 100
      },
      riskLevel: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH']
      },
      detectedPatterns: [String],
      sentenceAnalysis: {
        averageLength: Number,
        lengthVariance: Number
      }
    },
    
    // Plagiarism Detection
    plagiarismDetection: {
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      riskLevel: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH']
      },
      suspiciousSentences: [{
        sentence: String,
        index: Number,
        similarity: Number,
        source: String
      }],
      recommendations: [String]
    },
    
    // Stylometric Fingerprinting
    stylometricFingerprint: {
      writingStyle: {
        averageSentenceLength: Number,
        averageWordsPerParagraph: Number,
        lexicalDiversity: Number,
        functionWordRatio: Number
      },
      readability: {
        fleschScore: Number,
        complexity: String
      }
    },
    
    // Entropy Analysis
    entropyAnalysis: {
      characterEntropy: Number,
      wordEntropy: Number,
      uniquenessRatio: Number,
      repetitionRatio: Number
    },
    
    // Watermark Detection
    watermarkDetection: {
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      detected: [{
        type: String,
        matches: Number,
        pattern: String
      }]
    },
    
    // AI Analysis from Gemini
    geminiAnalysis: String,
    
    // Final Recommendations
    recommendations: [String]
  }
}, {
  timestamps: true
});

// Index for efficient queries
submissionSchema.index({ userId: 1, createdAt: -1 });
submissionSchema.index({ 'report.status': 1 });
submissionSchema.index({ 'report.integrityAnalysis.overallScore': 1 });
submissionSchema.index({ 'report.aiDetection.probabilityScore': 1 });
submissionSchema.index({ 'report.plagiarismDetection.score': 1 });

export default mongoose.model('Submission', submissionSchema);