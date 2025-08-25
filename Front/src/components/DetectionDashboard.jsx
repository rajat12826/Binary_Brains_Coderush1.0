import React, { useState, useEffect } from "react";
import axios from "axios";
import { ChevronRight, Cpu, Brain, Fingerprint, TrendingUp, Clock, Shield, Eye } from "lucide-react";

export default function DetectionDashboard({ activeTab }) {
  const [detectionData, setDetectionData] = useState({
    overview: [],
    entropy: [],
    perplexity: [],
    watermarks: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        const res = await axios.get(import.meta.env.VITE_BACKEND_URL+"api/submissions/allSub");
        if (res.data.success) {
          setDetectionData(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch submissions:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSubmissions();
  }, []);

  const getStatusStyles = (status) => {
    const styles = {
      high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800",
      medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      safe: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
    };
    return styles[status] || styles.safe;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-red-600 dark:text-red-400";
    if (score >= 60) return "text-amber-600 dark:text-amber-400";
    if (score >= 40) return "text-blue-600 dark:text-blue-400";
    return "text-emerald-600 dark:text-emerald-400";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Loading detection data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Detection Overview
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Comprehensive analysis of submitted content with AI detection scores and risk assessments
              </p>
            </div>

            {detectionData.overview.length === 0 ? (
              <div className="text-center py-12">
                <Eye className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No submissions found</h3>
                <p className="text-gray-500 dark:text-gray-400">Submit content to see detection results here</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-6">
                {detectionData.overview.map((result, index) => (
                  <div
                    key={result.id}
                    className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-6 hover:shadow-xl dark:hover:shadow-2xl hover:shadow-blue-100/50 dark:hover:shadow-blue-900/20 transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-700 cursor-pointer transform hover:-translate-y-1"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                          {result.title}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <span className="font-medium">by {result.author}</span>
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(result.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                        <div className="text-right">
                          <div className={`text-xl sm:text-2xl font-bold mb-1 ${getScoreColor(result.aiScore)}`}>
                            {result.aiScore}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">AI CONFIDENCE</div>
                        </div>
                        
                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusStyles(result.status)}`}>
                          {result.status}
                        </div>
                        
                        <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors hidden sm:block" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "entropy" && (
          <div className="text-center py-8 sm:py-12">
            <div className="mb-8 sm:mb-12">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Cpu className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Entropy Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
                Advanced entropy-based detection algorithms analyze text randomness patterns to identify AI-generated content with high precision and reliability.
              </p>
            </div>

            {detectionData.entropy.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">No entropy analysis data available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {detectionData.entropy.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-2xl hover:shadow-blue-100/50 dark:hover:shadow-blue-900/20 transition-all duration-300 group">
                      <div className="flex items-center justify-between mb-4">
                        <TrendingUp className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full group-hover:scale-150 transition-transform"></div>
                      </div>
                      <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {item.avgEntropy}
                      </div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Avg Entropy
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-2xl hover:shadow-green-100/50 dark:hover:shadow-green-900/20 transition-all duration-300 group">
                      <div className="flex items-center justify-between mb-4">
                        <Shield className="w-8 h-8 text-green-500 dark:text-green-400" />
                        <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full group-hover:scale-150 transition-transform"></div>
                      </div>
                      <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {item.accuracy}%
                      </div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Accuracy
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-2xl hover:shadow-purple-100/50 dark:hover:shadow-purple-900/20 transition-all duration-300 group sm:col-span-2 lg:col-span-1">
                      <div className="flex items-center justify-between mb-4">
                        <Clock className="w-8 h-8 text-purple-500 dark:text-purple-400" />
                        <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full group-hover:scale-150 transition-transform"></div>
                      </div>
                      <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {item.avgProcess}ms
                      </div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Avg Process Time
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "perplexity" && (
          <div className="text-center py-8 sm:py-12">
            <div className="mb-8 sm:mb-12">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-500 to-teal-600 dark:from-green-400 dark:to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Brain className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Perplexity Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
                Language model perplexity scores help identify unnaturally predictable text patterns common in AI writing through sophisticated linguistic analysis.
              </p>
            </div>

            {detectionData.perplexity.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">No perplexity analysis data available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {detectionData.perplexity.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-2xl hover:shadow-green-100/50 dark:hover:shadow-green-900/20 transition-all duration-300 group">
                      <div className="flex items-center justify-between mb-4">
                        <Brain className="w-8 h-8 text-green-500 dark:text-green-400" />
                        <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full group-hover:scale-150 transition-transform"></div>
                      </div>
                      <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {item.avgScore}
                      </div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Avg Score
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-2xl hover:shadow-teal-100/50 dark:hover:shadow-teal-900/20 transition-all duration-300 group">
                      <div className="flex items-center justify-between mb-4">
                        <TrendingUp className="w-8 h-8 text-teal-500 dark:text-teal-400" />
                        <div className="w-2 h-2 bg-teal-500 dark:bg-teal-400 rounded-full group-hover:scale-150 transition-transform"></div>
                      </div>
                      <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {item.detectionRate}%
                      </div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Detection Rate
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-2xl hover:shadow-blue-100/50 dark:hover:shadow-blue-900/20 transition-all duration-300 group sm:col-span-2 lg:col-span-1">
                      <div className="flex items-center justify-between mb-4">
                        <Clock className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full group-hover:scale-150 transition-transform"></div>
                      </div>
                      <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {item.avgProcess}ms
                      </div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Avg Process Time
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "watermarks" && (
          <div className="text-center py-8 sm:py-12">
            <div className="mb-8 sm:mb-12">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-500 to-pink-600 dark:from-purple-400 dark:to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Fingerprint className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                AI Watermark Detection
              </h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
                Advanced algorithms detect hidden watermarks and signatures left by AI writing tools using cutting-edge forensic analysis techniques.
              </p>
            </div>

            {detectionData.watermarks.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">No watermark detection data available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {detectionData.watermarks.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <div className="bg-white dark:bg-gray-800 p-2 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-2xl hover:shadow-purple-100/50 dark:hover:shadow-purple-900/20 transition-all duration-300 group">
                      <div className="flex items-center justify-between mb-4">
                        <Fingerprint className="w-8 h-8 text-purple-500 dark:text-purple-400" />
                        <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full group-hover:scale-150 transition-transform"></div>
                      </div>
                      <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {item.detected}
                      </div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Detected
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-2 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-2xl hover:shadow-pink-100/50 dark:hover:shadow-pink-900/20 transition-all duration-300 group">
                      <div className="flex items-center justify-between mb-4">
                        <Shield className="w-8 h-8 text-pink-500 dark:text-pink-400" />
                        <div className="w-2 h-2 bg-pink-500 dark:bg-pink-400 rounded-full group-hover:scale-150 transition-transform"></div>
                      </div>
                      <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {item.precision}%
                      </div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Precision
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-2 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-2xl hover:shadow-indigo-100/50 dark:hover:shadow-indigo-900/20 transition-all duration-300 group sm:col-span-2 lg:col-span-1">
                      <div className="flex items-center justify-between mb-4">
                        <Cpu className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
                        <div className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full group-hover:scale-150 transition-transform"></div>
                      </div>
                      <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {item.modelsCovered}
                      </div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Models Covered
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}