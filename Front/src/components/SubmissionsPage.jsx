import React, { useState, useEffect } from "react";
import axios from "axios";
import { Eye, MoreVertical, Filter } from "lucide-react";
import BulkUploadDialog from "./BulkUploadDialog";

const SubmissionsPage = ({ user }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch submissions for the current user
  useEffect(() => {
    if (!user?.id) return;
    
   console.log("ye hai")
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/api/submissions/user/${user.id}`);
        console.log("yeeeee")
        console.log(response.data.submissions);
        setSubmissions(response.data.submissions || []);
      } catch (err) {
        console.error("Error fetching submissions:", err);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">Loading submissions...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Submissions Management</h1>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <BulkUploadDialog />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paper</th>
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Word Count</th>
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verdict</th>
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Probability</th>
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th> */}
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Download</th>
</tr>

            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
  {submissions.length > 0 ? (
    submissions.map((submission) => (
      <tr key={submission._id} className="hover:bg-gray-50">
        {/* Paper Title */}
        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
          {submission.title}
        </td>

        {/* Word Count */}
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
          {submission.analysis?.documentInfo?.wordCount ?? 0}
        </td>

        {/* Verdict */}
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          {submission.analysis?.assessment?.verdict ?? "PENDING"}
        </td>

        {/* AI Probability */}
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          {(submission.analysis?.assessment?.aiProbability * 100)?.toFixed(1) ?? 0}%
        </td>

        {/* Risk Level */}
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            submission.analysis?.assessment?.riskLevel === "HIGH" ? 'bg-red-100 text-red-800' :
            submission.analysis?.assessment?.riskLevel === "MEDIUM" ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {submission.analysis?.assessment?.riskLevel ?? "LOW"}
          </span>
        </td>

        
        {/* Submission Date */}
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  {new Date(submission.createdAt).toLocaleDateString()}
</td>

{/* Download PDF */}
{/* Download PDF */}
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  {submission.fileUrl ? (
    <a
      href={`http://localhost:8000/api/submissions/download/${submission._id}`}
      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
      target="_blank"
      rel="noopener noreferrer"
    >
      Download
    </a>
  ) : (
    <span className="text-gray-400">N/A</span>
  )}
</td>



        {/* Actions */}
        {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2 justify-end">
          <button className="text-green-600 hover:text-green-900">
            <Eye className="w-4 h-4" />
          </button>
          <button className="text-gray-600 hover:text-gray-900">
            <MoreVertical className="w-4 h-4" />
          </button>
        </td> */}
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={7} className="text-center py-4 text-gray-500">
        No submissions found.
      </td>
    </tr>
  )}
</tbody>


          </table>
        </div>
      </div>
    </div>
  );
};

export default SubmissionsPage;
