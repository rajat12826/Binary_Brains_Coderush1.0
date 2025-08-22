import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, X, CheckCircle, AlertCircle, Clock, FileText, TrendingUp, Shield, Lightbulb } from "lucide-react";
import{useUser}from '@clerk/clerk-react'
export default function UploadDialog() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [submissionId, setSubmissionId] = useState(null);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
const{user}=useUser()
const userId=user?.id
  console.log(userId);
  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
    // Reset states when new file is selected
    setReport(null);
    setError(null);
    setSubmissionId(null);
    setUploadProgress("");
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setReport(null);
    setUploadProgress("Uploading file and analyzing...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    formData.append("title", file.name.replace(/\.[^/.]+$/, "")); // Remove file extension
    formData.append("description", "Uploaded via web interface");

    try {
      // Upload and get immediate analysis
      const response = await fetch("https://localhost:8000/api/submissions", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Response:", data);

      if (data.success && data.status === "COMPLETED" && data.report) {
        // Analysis completed immediately
        setSubmissionId(data.submissionId);
        setReport(data.report);
        setUploadProgress("Analysis completed successfully!");
      } else if (data.submissionId) {
        // Fallback to polling (shouldn't happen with immediate processing)
        setSubmissionId(data.submissionId);
        setUploadProgress("Processing... Please wait...");
        await pollForReport(data.submissionId);
      } else {
        throw new Error("Invalid response format");
      }

    } catch (error) {
      console.error("❌ Error:", error);
      setError(error.message || "An error occurred during processing");
      setUploadProgress("");
    } finally {
      setIsUploading(false);
    }
  };

  // Fallback polling function (for backup)
  const pollForReport = async (submissionId) => {
    const maxAttempts = 10;
    const pollInterval = 3000; // 3 seconds

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        setUploadProgress(`Checking status... (${attempt + 1}/${maxAttempts})`);
       
        // Get the report directly (since we process immediately)
        const reportResponse = await fetch(
          `https://localhost:8000/api/submissions/${submissionId}/report`
        );
        
        if (reportResponse.ok) {
          const reportData = await reportResponse.json();
          setReport(reportData);
          setUploadProgress("Analysis completed successfully!");
          return;
        }

        await new Promise(resolve => setTimeout(resolve, pollInterval));

      } catch (error) {
        console.warn('Polling error, retrying:', error);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }

    throw new Error('Could not retrieve analysis results');
  };

  const resetDialog = () => {
    setFile(null);
    setReport(null);
    setError(null);
    setSubmissionId(null);
    setUploadProgress("");
    setIsUploading(false);
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'LOW': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HIGH': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getVerdictIcon = (verdict) => {
    switch (verdict) {
      case 'AUTHENTIC': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'SUSPICIOUS': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'LIKELY_VIOLATION': 
      case 'VIOLATION': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const downloadReport = () => {
    if (!report || !submissionId) return;
    
    // Create a simple text report
    const reportText = `
ACADEMIC INTEGRITY ANALYSIS REPORT
==================================

Document: ${report.submissionInfo?.title || 'Untitled'}
Analysis Date: ${new Date().toLocaleDateString()}
Processing Time: ${report.submissionInfo?.processingTime || 'N/A'}

OVERALL ASSESSMENT
==================
Integrity Score: ${report.integrityAssessment?.overallScore || 0}/100
Risk Level: ${report.integrityAssessment?.riskLevel || 'Unknown'}
Verdict: ${report.integrityAssessment?.verdict || 'Unknown'}
Confidence: ${Math.round((report.integrityAssessment?.confidence || 0) * 100)}%

DOCUMENT INFORMATION
===================
Word Count: ${report.documentInfo?.wordCount || 0}
Sentences: ${report.documentInfo?.sentenceCount || 0}
Estimated Pages: ${report.documentInfo?.pageEstimate || 0}
Language: ${report.documentInfo?.language || 'Unknown'}

DETAILED ANALYSIS
================
Plagiarism Score: ${report.detailedAnalysis?.plagiarismAnalysis?.overallScore || 0}%
AI Detection: ${Math.round((report.detailedAnalysis?.aiDetection?.probabilityScore || 0) * 100)}%
Style Consistency: ${Math.round((report.detailedAnalysis?.stylometricAnalysis?.consistencyScore || 0) * 100)}%

AI INSIGHTS
===========
${report.insights?.summary || 'No additional insights available.'}

Key Findings:
${report.insights?.keyFindings?.map(finding => `- ${finding}`).join('\n') || 'None'}

Generated by Academic Integrity Checker
    `;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis_report_${submissionId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog onOpenChange={resetDialog}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2 bg-green-600 text-white hover:bg-green-700 rounded-lg">
          <Upload className="w-4 h-4" />
          <span>Upload File</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-4xl bg-white rounded-2xl shadow-xl border border-green-200 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-green-700 text-xl font-semibold">
            {report ? 'Analysis Results' : 'Upload Document'}
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            {report ? 'Detailed academic integrity analysis' : 'Upload a PDF document for AI detection and style analysis.'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {!report && !isUploading && (
            <>
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-green-400 rounded-xl cursor-pointer hover:bg-green-50 transition"
              >
                <Upload className="w-8 h-8 text-green-500 mb-2" />
                <span className="text-sm text-green-600">
                  Click to select or drag & drop file
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  Supported: PDF (Max: 10MB)
                </span>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
              </label>

              {file && (
                <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700 text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* Progress Display */}
          {(isUploading || uploadProgress) && !report && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <Clock className={`w-4 h-4 ${isUploading ? 'animate-spin' : ''} text-blue-500`} />
                <span className="text-blue-700 font-medium">Processing...</span>
              </div>
              <p className="text-blue-600 text-sm mt-1">{uploadProgress}</p>
              {submissionId && (
                <p className="text-xs text-gray-500 mt-2">Submission ID: {submissionId}</p>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-red-700 font-medium">Error</span>
              </div>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Report Display */}
          {report && (
            <div className="mt-4 space-y-6">
              {/* Overall Assessment */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Overall Assessment
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">
                      {report.integrityAssessment?.overallScore || 0}
                    </div>
                    <div className="text-sm text-gray-600">Integrity Score</div>
                  </div>
                  <div className="text-center">
                    <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(report.integrityAssessment?.riskLevel)}`}>
                      {report.integrityAssessment?.riskLevel || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Risk Level</div>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center mb-1">
                      {getVerdictIcon(report.integrityAssessment?.verdict)}
                    </div>
                    <div className="text-sm text-gray-600">{report.integrityAssessment?.verdict || 'Unknown'}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">
                      {report.documentInfo?.wordCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">Words</div>
                  </div>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-red-500" />
                    Plagiarism Analysis
                  </h4>
                  <div className="text-2xl font-bold text-red-600 mb-1">
                    {report.detailedAnalysis?.plagiarismAnalysis?.overallScore || 0}%
                  </div>
                  <div className="text-xs text-gray-600">
                    Risk: {report.detailedAnalysis?.plagiarismAnalysis?.riskLevel || 'Unknown'}
                  </div>
                </div>

                {/* AI Detection Section */}
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
                    AI Detection
                  </h4>
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {Math.round((report.detailedAnalysis?.aiDetection?.probabilityScore || 0) * 100)}%
                  </div>
                  <div className="text-xs text-gray-600">
                    Probability Score
                  </div>
                </div>

                {/* Style Consistency Section */}
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-purple-500" />
                    Style Consistency
                  </h4>
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {Math.round((report.detailedAnalysis?.stylometricAnalysis?.consistencyScore || 0) * 100)}%
                  </div>
                  <div className="text-xs text-gray-600">
                    Consistency Score
                  </div>
                </div>
              </div>

              {/* AI Insights Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                  AI Insights
                </h3>
                <p className="text-gray-700 text-sm mb-4">
                  {report.insights?.summary || 'No additional insights available.'}
                </p>
                {report.insights?.keyFindings?.length > 0 && (
                  <>
                    <h4 className="font-medium text-gray-800 mb-2">Key Findings:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                      {report.insights.keyFindings.map((finding, index) => (
                        <li key={index}>{finding}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row sm:justify-between items-center mt-4">
          <span className="text-sm text-gray-500">
            {file?.name || 'No file selected'}
          </span>
          <div className="flex space-x-2">
            {report && (
              <Button onClick={downloadReport} variant="outline" className="rounded-lg">
                Download Report
              </Button>
            )}
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="flex items-center space-x-2 bg-green-600 text-white hover:bg-green-700 rounded-lg"
            >
              {isUploading ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>{report ? 'Run Again' : 'Analyze Document'}</span>
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
