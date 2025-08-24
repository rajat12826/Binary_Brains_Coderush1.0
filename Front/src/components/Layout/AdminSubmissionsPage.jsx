import React, { useEffect, useState } from "react";
import axios from "axios";
import { Eye, MoreVertical } from "lucide-react";
import BulkUploadDialog from "../BulkUploadDialog";

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch submissions and users
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch submissions
      const subRes = await axios.get(import.meta.env.VITE_BACKEND_URL+"api/submissions");
      setSubmissions(subRes.data.submissions || []);
      console.log(subRes.data.submissions);
      // Fetch users (for reviewer assignment)
      const usersRes = await axios.get(import.meta.env.VITE_BACKEND_URL+"api/user");
      setUsers(usersRes.data || []);
      console.log(usersRes.data); 

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data.");
      setLoading(false);
    }
  };

  // Assign a reviewer to a submission
  const handleAssignReviewer = async (submissionId, userId) => {
    console.log(submissionId, userId);
    try {
      const res = await axios.put(
        import.meta.env.VITE_BACKEND_URL+`api/submissions/${submissionId}/assign`,
        { userId }
      );
      if(res.data.success){
        console.log(res.data.submissions);
      }

      // Update local state
      setSubmissions(prev =>
      prev.filter(sub => sub.id !== submissionId)
    );
    } catch (err) {
      console.error(err);
      setError("Failed to assign reviewer.");
    }
  };

  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (error) return <div className="text-red-600 p-10">{error}</div>;

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Submissions Management</h1>
        <div>
          <BulkUploadDialog />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paper</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Risk</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plagiarism</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Reviewer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {submissions && Array.isArray(submissions) && submissions.map(sub => {
              console.log(sub.id);
              const aiRisk = sub.analysis?.assessment?.aiProbability
                ? Math.round(sub.analysis.assessment.aiProbability * 100)
                : 0;
              const plagiarism = sub.plagiarism || 0; // fallback if field exists

              return (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{sub.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sub.userId}</td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                    style={{ color: aiRisk >= 80 ? "red" : aiRisk >= 50 ? "orange" : "green" }}
                  >
                    {aiRisk}%
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                    style={{ color: plagiarism >= 30 ? "red" : plagiarism >= 15 ? "orange" : "green" }}
                  >
                    {plagiarism}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        sub.analysis?.reviewStatus === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : sub.analysis?.reviewStatus === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {sub.analysis?.reviewStatus || "PENDING"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {sub.analysis?.Appointed ? (
                      users.find(u => u.id === sub.analysis.Appointed)?.name || "Assigned"
                    ) : (
                      <select
                        className="border rounded px-2 py-1 text-sm"
                        defaultValue=""
                        onChange={e => handleAssignReviewer(sub.id, e.target.value)}
                      >
                        <option value="">Assign Reviewer</option>
                        {users.map(user => {
                          console.log(user);
                          
                          return <option key={user._id} value={user._id}>{user.name}</option>
            })}
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-green-600 hover:text-green-900 mr-3">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
