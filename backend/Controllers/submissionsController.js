// src/controllers/submissionController.js
import { promises as fs } from "fs";
import { createHash } from "crypto";
import pdf from "pdf-to-text";
import Submission from '../modals/Submission.js';
import cloudinary from "../config/cloudinary.js";
import { chatSession } from "../modals/GeminiAIModel.js";
import mongoose from "mongoose";

/**
 * Core Analysis Engine
 */
class DocumentAnalyzer {
  
  // Text processing utilities
  static tokenizeWords(text) {
    return text.toLowerCase().match(/\b\w+\b/g) || [];
  }
  
  static segmentSentences(text) {
    return text.match(/[^\.!?]+[\.!?]+/g)?.map(s => s.trim()).filter(s => s.length > 5) || [];
  }

  // Calculate perplexity score
  static calculatePerplexity(text) {
    const words = this.tokenizeWords(text);
    if (words.length < 10) return 0;
    
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    let logProb = 0;
    words.forEach(word => {
      const prob = wordFreq[word] / words.length;
      logProb += Math.log2(prob);
    });
    
    return Math.round(Math.pow(2, -logProb / words.length) * 100) / 100;
  }

  // Calculate entropy
  static calculateEntropy(text) {
    const chars = text.toLowerCase().replace(/[^a-z]/g, '');
    const charFreq = {};
    
    for (const char of chars) {
      charFreq[char] = (charFreq[char] || 0) + 1;
    }
    
    let entropy = 0;
    for (const char in charFreq) {
      const prob = charFreq[char] / chars.length;
      if (prob > 0) entropy -= prob * Math.log2(prob);
    }
    
    return Math.round(entropy * 100) / 100;
  }

  // Stylometric analysis
  static analyzeStyle(text) {
    const sentences = this.segmentSentences(text);
    const words = this.tokenizeWords(text);
    
    if (sentences.length === 0 || words.length === 0) {
      return { avgSentenceLength: 0, lexicalDiversity: 0, consistencyScore: 0 };
    }
    
    const avgSentenceLength = words.length / sentences.length;
    const uniqueWords = new Set(words).size;
    const lexicalDiversity = uniqueWords / words.length;
    
    // Simple consistency measure based on sentence length variance
    const sentenceLengths = sentences.map(s => s.split(' ').length);
    const mean = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / sentenceLengths.length;
    const consistencyScore = Math.max(0, 1 - (Math.sqrt(variance) / 20)); // Normalize to 0-1
    
    return {
      avgSentenceLength: Math.round(avgSentenceLength * 100) / 100,
      lexicalDiversity: Math.round(lexicalDiversity * 1000) / 1000,
      consistencyScore: Math.round(consistencyScore * 100) / 100
    };
  }

  // Enhanced AI detection with more comprehensive patterns
  static detectAI(text) {
    let aiScore = 0;
    const indicators = [];
    
    // Check for AI-typical phrases (more comprehensive)
    const aiPhrases = [
      { pattern: /\b(furthermore|moreover|additionally|consequently)\b/gi, weight: 0.15, name: "Formal transitions" },
      { pattern: /\b(it is important to note|it should be noted|it is worth noting)\b/gi, weight: 0.2, name: "Formal qualifiers" },
      { pattern: /\b(in conclusion|to summarize|in summary|overall)\b/gi, weight: 0.1, name: "Summary phrases" },
      { pattern: /\b(comprehensive|substantial|significant|considerable)\b/gi, weight: 0.08, name: "Academic intensifiers" },
      { pattern: /\b(utilize|implement|facilitate|optimize|enhance)\b/gi, weight: 0.12, name: "Formal verbs" },
      { pattern: /\b(various|numerous|multiple|several)\b/gi, weight: 0.05, name: "Vague quantifiers" }
    ];
    
    aiPhrases.forEach(({ pattern, weight, name }) => {
      const matches = text.match(pattern);
      if (matches) {
        const score = matches.length * weight;
        aiScore += score;
        indicators.push(`${name}: ${matches.length} occurrences`);
      }
    });
    
    // Check sentence uniformity
    const sentences = this.segmentSentences(text);
    const lengths = sentences.map(s => s.split(' ').length);
    if (lengths.length > 5) {
      const variance = this.calculateVariance(lengths);
      if (variance < 8) { // More sensitive threshold
        aiScore += 0.25;
        indicators.push("Uniform sentence structure");
      }
    }
    
    // Check for repetitive sentence starters
    const starters = sentences.map(s => s.trim().split(' ')[0]?.toLowerCase()).filter(Boolean);
    const starterFreq = {};
    starters.forEach(starter => {
      starterFreq[starter] = (starterFreq[starter] || 0) + 1;
    });
    
    const maxRepeats = Math.max(...Object.values(starterFreq));
    if (maxRepeats > sentences.length * 0.3) {
      aiScore += 0.2;
      indicators.push("Repetitive sentence patterns");
    }
    
    // Check for overly perfect grammar/punctuation
    const punctuationPattern = /[.!?]$/;
    const properlyEnded = sentences.filter(s => punctuationPattern.test(s.trim())).length;
    if (properlyEnded === sentences.length && sentences.length > 5) {
      aiScore += 0.1;
      indicators.push("Perfect punctuation consistency");
    }
    
    // Ensure minimum score if indicators found
    const probability = Math.min(1, Math.max(aiScore, indicators.length > 0 ? 0.1 : 0));
    
    return {
      probability: Math.round(probability * 100) / 100,
      confidence: probability > 0.5 ? 0.85 : probability > 0.2 ? 0.75 : 0.65,
      indicators
    };
  }

  // Watermark detection (simple pattern matching)
  static detectWatermark(text) {
    const watermarkPatterns = [
      /generated by|created with|produced by.*ai/gi,
      /chatgpt|gpt-|claude|gemini/gi,
      /as an ai|i'm an ai|artificial intelligence/gi
    ];
    
    for (const pattern of watermarkPatterns) {
      if (pattern.test(text)) {
        return { detected: true, type: "text_pattern", confidence: 0.9 };
      }
    }
    
    return { detected: false, type: null, confidence: 0 };
  }

  // NEW: Advanced AI Analysis using Gemini
  static async performGeminiAnalysis(text, basicAnalysis) {
    try {
      // Truncate text if too long (Gemini has token limits)
      const truncatedText = text.length > 4000 ? text.substring(0, 4000) + "..." : text;
      
      const prompt = `
You are an expert AI content detection system. Analyze the following text for AI-generated content indicators.

TEXT TO ANALYZE:
"${truncatedText}"

CURRENT METRICS:
- Perplexity: ${basicAnalysis.perplexity}
- Entropy: ${basicAnalysis.entropy} 
- Style Consistency: ${basicAnalysis.stylometry.consistencyScore}
- Basic AI Score: ${basicAnalysis.aiDetection.probability}

Analyze the text for:
1. Writing naturalness and human-like variation
2. Sentence structure patterns and complexity
3. Vocabulary sophistication vs authenticity
4. Logical flow and topic transitions
5. Emotional authenticity and personal voice
6. Technical knowledge depth and accuracy

Respond with ONLY a valid JSON object in this exact format:
{
  "aiProbability": 0.75,
  "confidence": 0.85,
  "reasoning": "Detailed explanation of findings",
  "indicators": ["specific indicator 1", "specific indicator 2"],
  "languagePattern": {
    "naturalness": 0.6,
    "complexity": 0.8,
    "humanVariability": 0.4
  },
  "recommendation": "LIKELY_AI"
}

Recommendation must be one of: HUMAN_WRITTEN, POSSIBLY_AI, LIKELY_AI, AI_GENERATED`;

      console.log("Sending request to Gemini AI...");
      const result = await chatSession.sendMessage(prompt);
      const response = await result.response;
      const analysisText = response.text();
      
      console.log("Gemini raw response:", analysisText);
      
      // Clean and parse the JSON response
      let cleanResponse = analysisText.trim();
      
      // Remove any markdown code blocks if present
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\s*/, '').replace(/```\s*$/, '');
      }
      
      // Parse the JSON response
      const geminiAnalysis = JSON.parse(cleanResponse);
      
      // Validate the response structure
      if (typeof geminiAnalysis.aiProbability !== 'number' || 
          typeof geminiAnalysis.confidence !== 'number') {
        throw new Error("Invalid response structure from Gemini");
      }
      
      console.log("Gemini analysis successful:", geminiAnalysis);
      
      return {
        success: true,
        analysis: {
          aiProbability: Math.max(0, Math.min(1, geminiAnalysis.aiProbability)),
          confidence: Math.max(0, Math.min(1, geminiAnalysis.confidence)),
          reasoning: geminiAnalysis.reasoning || "Gemini analysis completed",
          indicators: geminiAnalysis.indicators || [],
          languagePattern: geminiAnalysis.languagePattern || {
            naturalness: 0.5,
            complexity: 0.5,
            humanVariability: 0.5
          },
          recommendation: geminiAnalysis.recommendation || "ANALYSIS_COMPLETED"
        }
      };
      
    } catch (error) {
      console.error("Gemini analysis failed:", error);
      console.error("Error details:", error.message);
      
      // Provide more intelligent fallback based on basic analysis
      const fallbackProbability = Math.min(0.6, basicAnalysis.aiDetection.probability + 0.2);
      
      return {
        success: false,
        error: error.message,
        analysis: {
          aiProbability: fallbackProbability,
          confidence: 0.6,
          reasoning: `Gemini AI unavailable. Basic analysis suggests ${Math.round(fallbackProbability * 100)}% AI probability based on detected patterns.`,
          indicators: basicAnalysis.aiDetection.indicators,
          languagePattern: {
            naturalness: 0.5,
            complexity: 0.5,
            humanVariability: 0.5
          },
          recommendation: fallbackProbability > 0.5 ? "LIKELY_AI" : "POSSIBLY_AI"
        }
      };
    }
  }

  // Helper method
  static calculateVariance(numbers) {
    if (numbers.length === 0) return 0;
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    return numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
  }
}

/**
 * Extract text from PDF
 */
async function extractTextFromPDF(buffer) {
  const tempPath = `./temp/temp_${Date.now()}.pdf`;
  await fs.mkdir('./temp', { recursive: true });
  await fs.writeFile(tempPath, buffer);
  
  try {
    const text = await new Promise((resolve, reject) => {
      pdf.pdfToText(tempPath, { layout: "maintain" }, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
    
    await fs.unlink(tempPath);
    return text;
  } catch (error) {
    await fs.unlink(tempPath).catch(() => {});
    throw error;
  }
}

/**
 * Generate content hash
 */
function generateContentHash(text) {
  return createHash('sha256').update(text.trim()).digest('hex');
}

/**
 * Main submission handler (Enhanced with Gemini AI) - FIXED userId handling
 */
export async function handleSubmissionImmediate(req, res) {
  const startTime = Date.now();
  
  try {
    // FIXED: Proper userId extraction and validation
    const { title = "Untitled Document", description = "", userId } = req.body;
    
    // Validate required fields
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: "No PDF file provided" 
      });
    }

    // FIXED: Validate userId is provided
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "Valid userId is required" 
      });
    }

    console.log(`Starting analysis for: ${title} (User: ${userId})`);
    
    // Extract text from PDF
    const extractedText = await extractTextFromPDF(req.file.buffer);
    
    if (!extractedText || extractedText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        error: "Could not extract sufficient text from PDF"
      });
    }

    // Generate unique hash for this content
    const contentHash = generateContentHash(extractedText);
    
    // Check if this exact content was already analyzed BY THIS USER
    const existingSubmission = await Submission.findOne({ 
      contentHash,
      userId: userId.trim() // Check for same user
    });
    
    if (existingSubmission) {
      console.log("Found cached analysis for this user, but re-running Gemini for enhanced results");
      
      // If Gemini wasn't run before, run it now for better results
      if (!existingSubmission.analysis?.geminiStatus || existingSubmission.analysis.geminiStatus !== "SUCCESS") {
        console.log("Re-analyzing with Gemini AI...");
        
        // Get basic metrics from cache
        const cachedMetrics = existingSubmission.analysis.metrics;
        const basicAnalysis = {
          perplexity: cachedMetrics.perplexity,
          entropy: cachedMetrics.entropy,
          stylometry: cachedMetrics.stylometry,
          aiDetection: cachedMetrics.aiDetection
        };
        
        // Run Gemini analysis
        const geminiResult = await DocumentAnalyzer.performGeminiAnalysis(extractedText, basicAnalysis);
        
        if (geminiResult.success) {
          // Update the existing submission with Gemini results
          const watermarkAdjustment = cachedMetrics.watermark?.detected ? 0.3 : 0;
          const finalAiProbability = Math.min(1, (geminiResult.analysis.aiProbability * 0.7) + ((cachedMetrics.aiDetection.probability + watermarkAdjustment) * 0.3));
          
          existingSubmission.analysis.metrics.aiDetection = {
            ...cachedMetrics.aiDetection,
            finalProbability: finalAiProbability,
            finalConfidence: Math.max(geminiResult.analysis.confidence, cachedMetrics.aiDetection.confidence),
            geminiAnalysis: geminiResult.analysis,
            detailedReasoning: geminiResult.analysis.reasoning,
            advancedIndicators: geminiResult.analysis.indicators,
            languagePattern: geminiResult.analysis.languagePattern
          };
          
          existingSubmission.analysis.assessment.aiProbability = finalAiProbability;
          existingSubmission.analysis.assessment.humanProbability = 1 - finalAiProbability;
          existingSubmission.analysis.assessment.riskLevel = finalAiProbability > 0.7 ? "HIGH" : finalAiProbability > 0.4 ? "MEDIUM" : "LOW";
          existingSubmission.analysis.assessment.verdict = finalAiProbability > 0.8 ? "AI_GENERATED" : 
                    finalAiProbability > 0.5 ? "LIKELY_AI" : 
                    finalAiProbability > 0.3 ? "SUSPICIOUS" : "HUMAN_WRITTEN";
          existingSubmission.analysis.assessment.geminiRecommendation = geminiResult.analysis.recommendation;
          existingSubmission.analysis.geminiStatus = "SUCCESS";
          
          await existingSubmission.save();
        }
      }
      
      // Return the enhanced cached analysis
      const analysis = existingSubmission.analysis;
      const aiDetection = analysis.metrics.aiDetection;
      const finalProbability = aiDetection.finalProbability || aiDetection.probability;
      const finalConfidence = aiDetection.finalConfidence || aiDetection.confidence;
      
      return res.json({
        success: true,
        cached: true,
        enhanced: analysis.geminiStatus === "SUCCESS",
        submissionId: existingSubmission._id,
        status: "COMPLETED",
        geminiStatus: analysis.geminiStatus || "NOT_RUN",
        report: {
          submissionInfo: {
            id: existingSubmission._id,
            title: existingSubmission.title,
            description: existingSubmission.description,
            processedAt: existingSubmission.createdAt,
            processingTime: `${Math.round((analysis.processingTime || 0)/1000)}s`,
            geminiEnabled: analysis.geminiStatus === "SUCCESS"
          },
          documentInfo: {
            wordCount: analysis.documentInfo.wordCount,
            sentenceCount: analysis.documentInfo.sentenceCount,
            language: 'en',
            pageEstimate: Math.ceil(analysis.documentInfo.wordCount / 250)
          },
          integrityAssessment: {
            overallScore: Math.round((1 - analysis.assessment.aiProbability) * 100),
            riskLevel: analysis.assessment.riskLevel,
            verdict: analysis.assessment.verdict === 'HUMAN_WRITTEN' ? 'AUTHENTIC' : 
                     analysis.assessment.verdict === 'SUSPICIOUS' ? 'SUSPICIOUS' : 'VIOLATION',
            confidence: finalConfidence,
            geminiRecommendation: analysis.assessment.geminiRecommendation || "BASIC_ANALYSIS_ONLY"
          },
          detailedAnalysis: {
            plagiarismAnalysis: {
              overallScore: Math.round(analysis.assessment.aiProbability * 30),
              riskLevel: analysis.assessment.riskLevel,
              sources: []
            },
            aiDetection: {
              probabilityScore: finalProbability,
              confidenceLevel: finalConfidence,
              riskLevel: analysis.assessment.riskLevel,
              geminiInsights: aiDetection.geminiAnalysis ? {
                reasoning: aiDetection.detailedReasoning,
                indicators: aiDetection.advancedIndicators || [],
                languagePattern: aiDetection.languagePattern
              } : null
            },
            stylometricAnalysis: {
              consistencyScore: analysis.metrics.stylometry.consistencyScore,
              riskLevel: analysis.assessment.riskLevel
            }
          },
          insights: {
            summary: aiDetection.geminiAnalysis ? 
              `Enhanced analysis: ${aiDetection.detailedReasoning}` :
              `Document analyzed. AI probability: ${Math.round(analysis.assessment.aiProbability * 100)}%. Writing shows ${analysis.metrics.stylometry.consistencyScore > 0.7 ? 'consistent' : 'inconsistent'} style patterns.`,
            keyFindings: [
              `AI Probability: ${Math.round(finalProbability * 100)}%`,
              `Confidence Level: ${Math.round(finalConfidence * 100)}%`,
              `Perplexity score: ${analysis.metrics.perplexity}`,
              `Entropy level: ${analysis.metrics.entropy}`,
              `Style consistency: ${Math.round(analysis.metrics.stylometry.consistencyScore * 100)}%`,
              ...(aiDetection.advancedIndicators ? aiDetection.advancedIndicators.slice(0, 2) : [])
            ],
            geminiStatus: analysis.geminiStatus || "NOT_RUN"
          }
        },
        message: analysis.geminiStatus === "SUCCESS" ? 
          "Enhanced analysis retrieved from cache" : 
          "Analysis enhanced with Gemini AI"
      });
    }

    // Perform basic analysis
    console.log("Performing document analysis...");
    const perplexity = DocumentAnalyzer.calculatePerplexity(extractedText);
    const entropy = DocumentAnalyzer.calculateEntropy(extractedText);
    const stylometry = DocumentAnalyzer.analyzeStyle(extractedText);
    const aiDetection = DocumentAnalyzer.detectAI(extractedText);
    const watermark = DocumentAnalyzer.detectWatermark(extractedText);
    
    // Perform advanced Gemini analysis
    console.log("Performing Gemini AI analysis...");
    const basicAnalysis = { perplexity, entropy, stylometry, aiDetection };
    const geminiResult = await DocumentAnalyzer.performGeminiAnalysis(extractedText, basicAnalysis);
    
    // Factor in watermark detection
    let watermarkAdjustment = 0;
    if (watermark.detected) {
      watermarkAdjustment = 0.3; // Significant boost if watermark found
    }
    
    // Combine analyses for final verdict
    let finalAiProbability = Math.min(1, aiDetection.probability + watermarkAdjustment);
    let finalConfidence = aiDetection.confidence;
    let detailedReasoning = `Basic analysis completed. ${watermark.detected ? 'AI watermark detected. ' : ''}`;
    let advancedIndicators = [...aiDetection.indicators];
    let languagePattern = null;
    
    if (geminiResult.success) {
      // Weight Gemini analysis more heavily (70%) vs basic analysis (30%)
      const geminiProbability = geminiResult.analysis.aiProbability;
      finalAiProbability = Math.min(1, (geminiProbability * 0.7) + ((aiDetection.probability + watermarkAdjustment) * 0.3));
      finalConfidence = Math.max(geminiResult.analysis.confidence, aiDetection.confidence);
      detailedReasoning = geminiResult.analysis.reasoning;
      advancedIndicators = [...(geminiResult.analysis.indicators || []), ...aiDetection.indicators];
      languagePattern = geminiResult.analysis.languagePattern;
      
      if (watermark.detected) {
        detailedReasoning += " Note: AI watermark patterns were also detected in the text.";
      }
    } else {
      // Enhanced basic analysis reasoning
      if (watermark.detected) {
        detailedReasoning += `AI watermark detected (${watermark.type}). `;
      }
      if (aiDetection.indicators.length > 0) {
        detailedReasoning += `Found ${aiDetection.indicators.length} AI indicators: ${aiDetection.indicators.slice(0, 2).join(', ')}.`;
      }
      detailedReasoning += ` Style consistency: ${Math.round(stylometry.consistencyScore * 100)}%.`;
    }
    
    const humanProbability = 1 - finalAiProbability;
    const overallRisk = finalAiProbability > 0.7 ? "HIGH" : finalAiProbability > 0.4 ? "MEDIUM" : "LOW";
    
    const analysis = {
      documentInfo: {
        wordCount: DocumentAnalyzer.tokenizeWords(extractedText).length,
        sentenceCount: DocumentAnalyzer.segmentSentences(extractedText).length,
        title,
        description
      },
      metrics: {
        perplexity,
        entropy,
        stylometry,
        aiDetection: {
          ...aiDetection,
          // Enhanced with Gemini results
          finalProbability: finalAiProbability,
          finalConfidence: finalConfidence,
          geminiAnalysis: geminiResult.success ? geminiResult.analysis : null,
          detailedReasoning,
          advancedIndicators,
          languagePattern
        },
        watermark
      },
      assessment: {
        aiProbability: finalAiProbability,
        humanProbability,
        riskLevel: overallRisk,
        verdict: finalAiProbability > 0.8 ? "AI_GENERATED" : 
                finalAiProbability > 0.5 ? "LIKELY_AI" : 
                finalAiProbability > 0.3 ? "SUSPICIOUS" : "HUMAN_WRITTEN",
        geminiRecommendation: geminiResult.success ? geminiResult.analysis.recommendation : "BASIC_ANALYSIS_ONLY"
      },
      processingTime: Date.now() - startTime,
      geminiStatus: geminiResult.success ? "SUCCESS" : "FAILED"
    };

    // Upload to cloudinary (optional, for record keeping)
    let fileUrl = null;
    try {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "raw",
            folder: "submissions",
            public_id: `doc_${Date.now()}`
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });
      fileUrl = uploadResult.secure_url;
    } catch (uploadError) {
      console.warn("File upload failed:", uploadError.message);
    }

    // FIXED: Save to database with proper userId handling
    console.log(`Saving submission for user: ${userId}`);
    
    const submission = await Submission.create({
      userId: userId.trim(), // Use the userId from request body, properly trimmed
      title,
      description,
      contentHash,
      fileUrl,
      analysis,
      createdAt: new Date()
    });
      
    console.log(`Analysis completed for ${title} (User: ${userId}) in ${Date.now() - startTime}ms`);
    
    // Enhanced response format with Gemini insights
    res.json({
      success: true,
      message: "Document processed successfully",
      status: "COMPLETED",
      userId: userId, // Return the userId for confirmation
      submissionId: submission._id,
      geminiStatus: analysis.geminiStatus,
      report: {
        submissionInfo: {
          id: submission._id,
          title: submission.title,
          description: submission.description,
          processedAt: new Date(),
          processingTime: `${Math.round((Date.now() - startTime)/1000)}s`,
          geminiEnabled: geminiResult.success
        },
        documentInfo: {
          wordCount: analysis.documentInfo.wordCount,
          sentenceCount: analysis.documentInfo.sentenceCount,
          language: 'en',
          pageEstimate: Math.ceil(analysis.documentInfo.wordCount / 250)
        },
        integrityAssessment: {
          overallScore: Math.round((1 - analysis.assessment.aiProbability) * 100),
          riskLevel: analysis.assessment.riskLevel,
          verdict: analysis.assessment.verdict === 'HUMAN_WRITTEN' ? 'AUTHENTIC' : 
                   analysis.assessment.verdict === 'SUSPICIOUS' ? 'SUSPICIOUS' : 'VIOLATION',
          confidence: analysis.metrics.aiDetection.finalConfidence,
          geminiRecommendation: analysis.assessment.geminiRecommendation
        },
        detailedAnalysis: {
          plagiarismAnalysis: {
            overallScore: Math.round(analysis.assessment.aiProbability * 30), // Mock plagiarism score
            riskLevel: analysis.assessment.riskLevel,
            sources: []
          },
          aiDetection: {
            probabilityScore: analysis.metrics.aiDetection.finalProbability,
            confidenceLevel: analysis.metrics.aiDetection.finalConfidence,
            riskLevel: analysis.assessment.riskLevel,
            geminiInsights: {
              reasoning: analysis.metrics.aiDetection.detailedReasoning,
              indicators: analysis.metrics.aiDetection.advancedIndicators,
              languagePattern: analysis.metrics.aiDetection.languagePattern
            }
          },
          stylometricAnalysis: {
            consistencyScore: analysis.metrics.stylometry.consistencyScore,
            riskLevel: analysis.assessment.riskLevel
          }
        },
        insights: {
          summary: geminiResult.success ? 
            `Advanced AI analysis completed. ${analysis.metrics.aiDetection.detailedReasoning}` :
            `Document analyzed. AI probability: ${Math.round(analysis.assessment.aiProbability * 100)}%. Writing shows ${analysis.metrics.stylometry.consistencyScore > 0.7 ? 'consistent' : 'inconsistent'} style patterns.`,
          keyFindings: [
            `AI Probability: ${Math.round(analysis.assessment.aiProbability * 100)}%`,
            `Confidence Level: ${Math.round(analysis.metrics.aiDetection.finalConfidence * 100)}%`,
            `Perplexity score: ${analysis.metrics.perplexity}`,
            `Entropy level: ${analysis.metrics.entropy}`,
            `Style consistency: ${Math.round(analysis.metrics.stylometry.consistencyScore * 100)}%`,
            ...(geminiResult.success && analysis.metrics.aiDetection.advancedIndicators ? 
               analysis.metrics.aiDetection.advancedIndicators.slice(0, 3) : [])
          ],
          geminiStatus: analysis.geminiStatus
        }
      }
    });

  } catch (error) {
    console.error("Analysis failed:", error);
    
    res.status(500).json({
      success: false,
      error: "Document processing failed",
      code: "PROCESSING_ERROR",
      details: error.message
    });
  }
}

/**
 * Get submission status endpoint - FIXED with userId validation
 */
export async function getSubmissionStatus(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.query; // Get userId from query params
    
    // Validate userId if provided
    let query = { _id: id };
    if (userId) {
      query.userId = userId.trim();
    }
    
    const submission = await Submission.findOne(query);
    if (!submission) {
      return res.status(404).json({ 
        error: "Submission not found", 
        code: "SUBMISSION_NOT_FOUND" 
      });
    }

    res.json({
      id: submission._id,
      status: "COMPLETED", // Since we process immediately
      title: submission.title,
      userId: submission.userId,
      submittedAt: submission.createdAt,
      lastUpdated: submission.updatedAt,
      
      processingInfo: {
        status: "COMPLETED",
        processedAt: submission.createdAt,
        processingTimeMs: submission.analysis?.processingTime || 0,
        geminiEnabled: submission.analysis?.geminiStatus === "SUCCESS"
      },
      
      results: {
        overallScore: Math.round((1 - submission.analysis.assessment.aiProbability) * 100),
        riskLevel: submission.analysis.assessment.riskLevel,
        verdict: submission.analysis.assessment.verdict,
        geminiRecommendation: submission.analysis.assessment.geminiRecommendation
      },
      
      fileInfo: {
        originalName: submission.title,
        size: 'Unknown',
        uploadedAt: submission.createdAt
      }
    });

  } catch (error) {
    console.error("Error fetching submission status:", error);
    res.status(500).json({ 
      error: "Failed to fetch submission status", 
      code: "STATUS_FETCH_ERROR" 
    });
  }
}

/**
 * Get detailed submission report - FIXED with userId validation
 */
export async function getSubmissionReport(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.query; // Get userId from query params
    
    // Validate userId if provided
    let query = { _id: id };
    if (userId) {
      query.userId = userId.trim();
    }
    
    const submission = await Submission.findOne(query);
    if (!submission) {
      return res.status(404).json({ 
        error: "Submission not found", 
        code: "SUBMISSION_NOT_FOUND" 
      });
    }

    // Extract enhanced metrics
    const aiDetection = submission.analysis.metrics.aiDetection;
    const finalProbability = aiDetection.finalProbability || aiDetection.probability;
    const finalConfidence = aiDetection.finalConfidence || aiDetection.confidence;

    // Return comprehensive report matching frontend expectations
    const report = {
      submissionInfo: {
        id: submission._id,
        title: submission.title,
        description: submission.description,
        userId: submission.userId,
        processedAt: submission.createdAt,
        processingTime: `${Math.round((submission.analysis?.processingTime || 0)/1000)}s`,
        geminiEnabled: submission.analysis?.geminiStatus === "SUCCESS"
      },
      
      documentInfo: {
        wordCount: submission.analysis.documentInfo.wordCount,
        sentenceCount: submission.analysis.documentInfo.sentenceCount,
        language: 'en',
        pageEstimate: Math.ceil(submission.analysis.documentInfo.wordCount / 250)
      },

      integrityAssessment: {
        overallScore: Math.round((1 - submission.analysis.assessment.aiProbability) * 100),
        riskLevel: submission.analysis.assessment.riskLevel,
        verdict: submission.analysis.assessment.verdict === 'HUMAN_WRITTEN' ? 'AUTHENTIC' : 
                 submission.analysis.assessment.verdict === 'SUSPICIOUS' ? 'SUSPICIOUS' : 'VIOLATION',
        confidence: finalConfidence,
        geminiRecommendation: submission.analysis.assessment.geminiRecommendation
      },

      detailedAnalysis: {
        plagiarismAnalysis: {
          overallScore: Math.round(submission.analysis.assessment.aiProbability * 30),
          riskLevel: submission.analysis.assessment.riskLevel,
          sources: []
        },
        
        aiDetection: {
          probabilityScore: finalProbability,
          confidenceLevel: finalConfidence,
          riskLevel: submission.analysis.assessment.riskLevel,
          geminiInsights: aiDetection.geminiAnalysis ? {
            reasoning: aiDetection.detailedReasoning,
            indicators: aiDetection.advancedIndicators || [],
            languagePattern: aiDetection.languagePattern
          } : null
        },
        
        stylometricAnalysis: {
          consistencyScore: submission.analysis.metrics.stylometry.consistencyScore,
          riskLevel: submission.analysis.assessment.riskLevel
        }
      },

      insights: {
        summary: aiDetection.geminiAnalysis ? 
          `Advanced AI analysis: ${aiDetection.detailedReasoning}` :
          `Document analyzed. AI probability: ${Math.round(submission.analysis.assessment.aiProbability * 100)}%. Writing shows ${submission.analysis.metrics.stylometry.consistencyScore > 0.7 ? 'consistent' : 'inconsistent'} style patterns.`,
        keyFindings: [
          `AI Probability: ${Math.round(finalProbability * 100)}%`,
          `Confidence: ${Math.round(finalConfidence * 100)}%`,
          `Perplexity score: ${submission.analysis.metrics.perplexity}`,
          `Entropy level: ${submission.analysis.metrics.entropy}`,
          `Style consistency: ${Math.round(submission.analysis.metrics.stylometry.consistencyScore * 100)}%`,
          ...(aiDetection.advancedIndicators ? aiDetection.advancedIndicators.slice(0, 2) : [])
        ],
        geminiStatus: submission.analysis.geminiStatus
      }
    };

    res.json(report);

  } catch (error) {
    console.error("Error fetching submission report:", error);
    res.status(500).json({ 
      error: "Failed to fetch submission report", 
      code: "REPORT_FETCH_ERROR" 
    });
  }
}

/**
 * List recent submissions - FIXED with userId filtering
 */
export async function listSubmissions(req, res) {
  try {
    const { limit = 10, page = 1, userId } = req.query;
    
    // Build query with optional userId filter
    let query = {};
    if (userId && userId.trim().length > 0) {
      query.userId = userId.trim();
    }
    
    const submissions = await Submission.find(query)
      .select('title userId analysis.assessment.verdict analysis.assessment.riskLevel analysis.geminiStatus createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Submission.countDocuments(query);

    res.json({
      success: true,
      submissions: submissions.map(sub => ({
        id: sub._id,
        title: sub.title,
        userId: sub.userId,
        verdict: sub.analysis.assessment.verdict,
        riskLevel: sub.analysis.assessment.riskLevel,
        analyzedAt: sub.createdAt,
        geminiEnabled: sub.analysis?.geminiStatus === "SUCCESS"
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error("Error listing submissions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to list submissions"
    });
  }
}





export async function getAdminStats(req, res) {
  try {
    const days = 30; // current period
    const now = new Date();
    const currentStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousStart = new Date(now.getTime() - 2 * days * 24 * 60 * 60 * 1000);

    // Helper function to count stats in a given period
    const getCounts = async (start, end = now) => {
      const total = await Submission.countDocuments({ createdAt: { $gte: start, $lt: end } });
      const aiDetected = await Submission.countDocuments({
        createdAt: { $gte: start, $lt: end },
        'analysis.assessment.verdict': { $ne: 'HUMAN_WRITTEN' }
      });
      const plagiarismCases = await Submission.countDocuments({
        createdAt: { $gte: start, $lt: end },
        'analysis.assessment.verdict': { $in: ['SUSPICIOUS', 'LIKELY_AI'] }
      });
      const cleanPapers = await Submission.countDocuments({
        createdAt: { $gte: start, $lt: end },
        'analysis.assessment.verdict': 'HUMAN_WRITTEN'
      });

      return { total, aiDetected, plagiarismCases, cleanPapers };
    };

    const current = await getCounts(currentStart);
    const previous = await getCounts(previousStart, currentStart);

    // Function to calculate change percentage and trend
    const calcChange = (currentValue, previousValue) => {
      if (previousValue === 0) return { change: '+100%', trend: 'up' }; // Avoid division by zero
      const diff = currentValue - previousValue;
      const change = ((diff / previousValue) * 100).toFixed(0) + '%';
      const trend = diff >= 0 ? 'up' : 'down';
      return { change, trend };
    };

    const adminStats = [
      { label: 'Total Submissions', value: current.total, ...calcChange(current.total, previous.total), icon: 'FileText', color: 'blue' },
      { label: 'AI Detected', value: current.aiDetected, ...calcChange(current.aiDetected, previous.aiDetected), icon: 'Brain', color: 'red' },
      { label: 'Plagiarism Cases', value: current.plagiarismCases, ...calcChange(current.plagiarismCases, previous.plagiarismCases), icon: 'Shield', color: 'orange' },
      { label: 'Clean Papers', value: current.cleanPapers, ...calcChange(current.cleanPapers, previous.cleanPapers), icon: 'CheckCircle', color: 'green' }
    ];

    res.json({
      success: true,
      data: adminStats
    });

  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch admin stats"
    });
  }
}


export async function getAllSubmissions(req, res) {
  try {
    const limit = 5; // fixed limit
    const page = parseInt(req.query.page) || 1;

    const submissions = await Submission.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Submission.countDocuments();

    const overview = submissions.map(sub => ({
      id: sub._id,
      title: sub.title || "Untitled",
      author: sub.userId || "Unknown",
      timestamp: sub.createdAt?.toISOString() || new Date().toISOString(),
      aiScore: Math.round((sub.analysis?.assessment?.aiProbability || 0) * 100),
      status: (sub.analysis?.assessment?.riskLevel || "low").toLowerCase()
    }));

    const entropy = submissions.map(sub => ({
      id: sub._id,
      avgEntropy: sub.analysis?.metrics?.entropy || 0,
      accuracy: Math.round((sub.analysis?.assessment?.humanProbability || 0) * 100),
      avgProcess: sub.analysis?.processingTime || 0
    }));

    const perplexity = submissions.map(sub => ({
      id: sub._id,
      avgScore: sub.analysis?.metrics?.perplexity || 0,
      detectionRate: Math.round((sub.analysis?.assessment?.humanProbability || 0) * 100),
      avgProcess: sub.analysis?.processingTime || 0
    }));

    const watermarks = submissions.map(sub => ({
      id: sub._id,
      detected: sub.analysis?.metrics?.watermark?.detected ? 1 : 0,
      precision: Math.round((sub.analysis?.metrics?.watermark?.confidence || 0) * 100),
      modelsCovered: 1
    }));

    res.json({
      success: true,
      data: {
        overview,
        entropy,
        perplexity,
        watermarks
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error listing submissions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to list submissions"
    });
  }
}






export async function getStudentProfiles(req, res) {
  try {
    const aggregation = await Submission.aggregate([
      {
        $group: {
          _id: "$userId",
          papers: { $sum: 1 },
          avgConsistency: { $avg: "$analysis.assessment.humanProbability" },
          flaggedCount: {
            $sum: {
              $cond: [
                { $ne: ["$analysis.assessment.verdict", "HUMAN_WRITTEN"] },
                1,
                0
              ]
            }
          },
          avgWordLength: { $avg: "$analysis.metrics.stylometry.lexicalDiversity" }, // or another metric if you track actual word length
          sentenceComplexity: { $avg: "$analysis.metrics.stylometry.avgSentenceLength" }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          papers: 1,
          consistency: { $round: [{ $multiply: ["$avgConsistency", 100] }, 0] },
          flagged: { $cond: [{ $gt: ["$flaggedCount", 0] }, true, false] },
          avgWordLength: { $round: ["$avgWordLength", 1] },
          sentenceComplexity: { $round: ["$sentenceComplexity", 1] }
        }
      },
      { $sort: { name: 1 } }
    ]);

    // Add incremental `id` field
    const studentProfiles = aggregation.map((st, index) => ({ id: index + 1, ...st }));

    res.json({ success: true, students: studentProfiles });
  } catch (error) {
    console.error("Error fetching student profiles:", error);
    res.status(500).json({ success: false, error: "Failed to fetch student profiles" });
  }
}


