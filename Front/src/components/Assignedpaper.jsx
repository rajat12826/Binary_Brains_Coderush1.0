// src/pages/AssignedPapersPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";

const AssignedPapersPage = () => {
  const { user } = useUser();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(user);
    
    if (!user?.id) return;
    const fetchAssigned = async () => {
      try {
        setLoading(true);

        const response = await axios.get(`http://localhost:8000/api/submissions/assigned/${user.id}`);
        setSubmissions(response.data.submissions || []);
        console.log(response.data.submissions);
      } catch (error) {
        console.error("Error fetching assigned submissions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssigned();
  }, [user?.id]);

  const updateReviewStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:8000/api/submissions/review/${id}`, { reviewStatus: status });
      setSubmissions((prev) =>
        prev.map((s) =>
          s._id === id ? { ...s, analysis: { ...s.analysis, reviewStatus: status } } : s
        )
      );
    } catch (error) {
      console.error("Error updating review status:", error);
    }
  };

  if (loading) return <div className="text-center py-12">Loading assigned papers...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Assigned Papers</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Verdict</th>
              <th className="px-6 py-3">AI Probability</th>
              <th className="px-6 py-3">Risk</th>
              <th className="px-6 py-3">Review Status</th>
              <th className="px-6 py-3">Action</th>
              <th className="px-6 py-3">Download</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s._id} className="hover:bg-gray-50 text-center">
                <td className="px-6 py-4">{s.title}</td>
                <td className="px-6 py-4">{s.analysis?.assessment?.verdict}</td>
                <td className="px-6 py-4">
                  {(s.analysis?.assessment?.aiProbability * 100).toFixed(1)}%
                </td>
                <td className="px-6 py-4">{s.analysis?.assessment?.riskLevel}</td>
                <td className="px-6 py-4">{s.analysis?.reviewStatus}</td>
                
                
                 {
                  s.analysis?.reviewStatus === "PENDING" ?(
                    <div className="flex space-x-2 justify-center">
                      <button
                        className="text-green-500 hover:text-green-700"
                        onClick={() => updateReviewStatus(s._id, "accepted")}
                      >
                        Accept
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => updateReviewStatus(s._id, "rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  ):<div className="text-green-500 font-semibold align-center">Already Reviewed</div>
                 } 
                
                <td>
                    <a
      href={`http://localhost:8000/api/submissions/download/${s._id}`}
      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
      target="_blank"
      rel="noopener noreferrer"
    >
      Download
    </a>
                </td>
              </tr>
            ))}
            {/* {submissions.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No assigned submissions.
                </td>
              </tr>
            )} */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssignedPapersPage;
