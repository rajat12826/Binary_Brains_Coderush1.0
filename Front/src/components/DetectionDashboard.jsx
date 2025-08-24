import React, { useState, useEffect } from "react";
import axios from "axios";
import { ChevronRight, Cpu, Brain, Fingerprint } from "lucide-react";

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
        const res = await axios.get("api/submissions/allSub"); // Your backend route
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

  if (loading) return <p className="p-6 text-center">Loading...</p>;

  return (
    <div className="p-6">
      {activeTab === "overview" && (
        <div className="space-y-4">
          {detectionData.overview.map((result) => (
            <div
              key={result.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{result.title}</h3>
                <p className="text-sm text-gray-600">
                  by {result.author} • {new Date(result.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium">AI Score: {result.aiScore}%</div>
                  <div
                    className={`text-xs px-2 py-1 rounded-full ${
                      result.status === "high" ? "bg-red-100 text-red-700" :
                      result.status === "medium" ? "bg-yellow-100 text-yellow-700" :
                      result.status === "low" ? "bg-blue-100 text-blue-700" :
                      "bg-green-100 text-green-700"
                    }`}
                  >
                    {result.status.toUpperCase()}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "entropy" && (
        <div className="text-center py-8">
          <Cpu className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Entropy Analysis</h3>
          <p className="text-gray-600">
            Advanced entropy-based detection algorithms analyze text randomness patterns to identify AI-generated content.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {detectionData.entropy.map((item) => (
              <React.Fragment key={item.id}>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">{item.avgEntropy}</div>
                  <div className="text-sm text-gray-600">Avg Entropy</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">{item.accuracy}%</div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">{item.avgProcess}ms</div>
                  <div className="text-sm text-gray-600">Avg Process</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {activeTab === "perplexity" && (
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Perplexity Analysis</h3>
          <p className="text-gray-600">
            Language model perplexity scores help identify unnaturally predictable text patterns common in AI writing.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {detectionData.perplexity.map((item) => (
              <React.Fragment key={item.id}>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">{item.avgScore}</div>
                  <div className="text-sm text-gray-600">Avg Score</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">{item.detectionRate}%</div>
                  <div className="text-sm text-gray-600">Detection Rate</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">{item.avgProcess}ms</div>
                  <div className="text-sm text-gray-600">Avg Process</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {activeTab === "watermarks" && (
        <div className="text-center py-8">
          <Fingerprint className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">AI Watermark Detection</h3>
          <p className="text-gray-600">
            Advanced algorithms detect hidden watermarks and signatures left by AI writing tools.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {detectionData.watermarks.map((item) => (
              <React.Fragment key={item.id}>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">{item.detected}</div>
                  <div className="text-sm text-gray-600">Detected</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">{item.precision}%</div>
                  <div className="text-sm text-gray-600">Precision</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">{item.modelsCovered}</div>
                  <div className="text-sm text-gray-600">Models Covered</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
