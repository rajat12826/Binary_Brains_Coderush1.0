import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import { 
  FileText, Download, CheckCircle, XCircle, Clock, AlertTriangle, 
  Shield, Brain, TrendingUp, Filter, Search, RefreshCw, 
  Eye, ChevronDown, MoreHorizontal, Calendar, User,
  Award, Target, Activity
} from "lucide-react";

const AssignedPapersPage = () => {
  const { user } = useUser();
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    risk: 'all',
    verdict: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (!user?.id) return;
    fetchAssigned();
  }, [user?.id]);

  // Filter and search submissions
  useEffect(() => {
    let filtered = [...submissions];

    // Apply filters
    if (filters.status !== 'all') {
      filtered = filtered.filter(s => s.analysis?.reviewStatus?.toLowerCase() === filters.status);
    }
    if (filters.risk !== 'all') {
      filtered = filtered.filter(s => s.analysis?.assessment?.riskLevel?.toLowerCase() === filters.risk);
    }
    if (filters.verdict !== 'all') {
      filtered = filtered.filter(s => s.analysis?.assessment?.verdict?.toLowerCase().includes(filters.verdict));
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.analysis?.assessment?.verdict?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'risk-high':
          return (b.analysis?.assessment?.aiProbability || 0) - (a.analysis?.assessment?.aiProbability || 0);
        case 'risk-low':
          return (a.analysis?.assessment?.aiProbability || 0) - (b.analysis?.assessment?.aiProbability || 0);
        default:
          return 0;
      }
    });

    setFilteredSubmissions(filtered);
  }, [submissions, filters, searchTerm, sortBy]);

  const fetchAssigned = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        import.meta.env.VITE_BACKEND_URL + `api/submissions/assigned/${user.id}`
      );
      setSubmissions(response.data.submissions || []);
    } catch (error) {
      console.error("Error fetching assigned submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (id, status) => {
    try {
      setUpdating(id);
      await axios.put(
        import.meta.env.VITE_BACKEND_URL + `api/submissions/review/${id}`, 
        { reviewStatus: status }
      );
      setSubmissions((prev) =>
        prev.map((s) =>
          s._id === id ? { ...s, analysis: { ...s.analysis, reviewStatus: status } } : s
        )
      );
    } catch (error) {
      console.error("Error updating review status:", error);
    } finally {
      setUpdating(null);
    }
  };

  const getVerdictBadge = (verdict) => {
    const verdictStyles = {
      'HUMAN_WRITTEN': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'SUSPICIOUS': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'LIKELY_AI': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      'AI_GENERATED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${verdictStyles[verdict] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
        {verdict?.replace('_', ' ') || 'Unknown'}
      </span>
    );
  };

  const getRiskBadge = (risk) => {
    const riskStyles = {
      'LOW': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'MEDIUM': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'HIGH': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskStyles[risk] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
        {risk || 'Unknown'}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'PENDING': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'accepted': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    
    const statusIcons = {
      'PENDING': Clock,
      'accepted': CheckCircle,
      'rejected': XCircle
    };
    
    const Icon = statusIcons[status] || Clock;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status === 'PENDING' ? 'Pending' : status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
      </span>
    );
  };

  const FilterDropdown = ({ label, value, options, onChange, icon: Icon }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <option value="all">All {label}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  );

  const StatCard = ({ icon: Icon, title, value, color = "blue", description }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400 mb-1`}>{value}</p>
          {description && <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>}
        </div>
        <div className={`p-3 bg-${color}-100 dark:bg-${color}-900/30 rounded-lg`}>
          <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 dark:border-gray-600"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 dark:border-green-400 absolute top-0 left-0"></div>
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Loading Assigned Papers</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Fetching your review queue...</p>
          </div>
        </div>
      </div>
    );
  }

  const pendingCount = submissions.filter(s => s.analysis?.reviewStatus === 'PENDING').length;
  const reviewedCount = submissions.length - pendingCount;
  const highRiskCount = submissions.filter(s => s.analysis?.assessment?.riskLevel === 'HIGH').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-green-900/20">
      <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-green-600 dark:from-green-400 dark:to-green-400 bg-clip-text text-transparent">
                  Assigned Papers
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                  Review and assess submitted papers for AI detection
                </p>
              </div>
              
              <button
                onClick={fetchAssigned}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard 
            icon={FileText} 
            title="Total Papers" 
            value={submissions.length}
            color="blue"
            description="Assigned to you"
          />
          <StatCard 
            icon={Clock} 
            title="Pending Reviews" 
            value={pendingCount}
            color="yellow"
            description="Awaiting your action"
          />
          <StatCard 
            icon={CheckCircle} 
            title="Reviewed" 
            value={reviewedCount}
            color="green"
            description="Completed assessments"
          />
          <StatCard 
            icon={AlertTriangle} 
            title="High Risk" 
            value={highRiskCount}
            color="red"
            description="Requires attention"
          />
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
            
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search papers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent text-gray-900 dark:text-gray-100 text-sm transition-colors"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <FilterDropdown
                label="Status"
                value={filters.status}
                onChange={(value) => setFilters(prev => ({...prev, status: value}))}
                options={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'accepted', label: 'Accepted' },
                  { value: 'rejected', label: 'Rejected' }
                ]}
                icon={Activity}
              />
              
              <FilterDropdown
                label="Risk"
                value={filters.risk}
                onChange={(value) => setFilters(prev => ({...prev, risk: value}))}
                options={[
                  { value: 'low', label: 'Low Risk' },
                  { value: 'medium', label: 'Medium Risk' },
                  { value: 'high', label: 'High Risk' }
                ]}
                icon={Shield}
              />

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="risk-high">High Risk First</option>
                <option value="risk-low">Low Risk First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Papers Table/Cards */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Paper Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    AI Assessment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Review Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {submission.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(submission.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {getVerdictBadge(submission.analysis?.assessment?.verdict)}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(submission.analysis?.assessment?.aiProbability * 100)?.toFixed(1)}% AI probability
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRiskBadge(submission.analysis?.assessment?.riskLevel)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(submission.analysis?.reviewStatus)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {submission.analysis?.reviewStatus === "PENDING" ? (
                          <>
                            <button
                              onClick={() => updateReviewStatus(submission._id, "accepted")}
                              disabled={updating === submission._id}
                              className="inline-flex items-center px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-medium rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updating === submission._id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600 mr-1"></div>
                              ) : (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              )}
                              Accept
                            </button>
                            <button
                              onClick={() => updateReviewStatus(submission._id, "rejected")}
                              disabled={updating === submission._id}
                              className="inline-flex items-center px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 text-xs font-medium rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updating === submission._id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1"></div>
                              ) : (
                                <XCircle className="h-3 w-3 mr-1" />
                              )}
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            Already Reviewed
                          </span>
                        )}
                        
                        <a
                          href={import.meta.env.VITE_BACKEND_URL + `api/submissions/download/${submission._id}`}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs font-medium rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4 p-4">
            {filteredSubmissions.map((submission) => (
              <div key={submission._id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-4">
                
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {submission.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(submission.analysis?.reviewStatus)}
                </div>

                {/* Assessment Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">AI Assessment</p>
                    {getVerdictBadge(submission.analysis?.assessment?.verdict)}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {(submission.analysis?.assessment?.aiProbability * 100)?.toFixed(1)}% probability
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Risk Level</p>
                    {getRiskBadge(submission.analysis?.assessment?.riskLevel)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {submission.analysis?.reviewStatus === "PENDING" ? (
                    <>
                      <button
                        onClick={() => updateReviewStatus(submission._id, "accepted")}
                        disabled={updating === submission._id}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-sm font-medium rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updating === submission._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Accept
                      </button>
                      <button
                        onClick={() => updateReviewStatus(submission._id, "rejected")}
                        disabled={updating === submission._id}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 text-sm font-medium rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updating === submission._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        Reject
                      </button>
                    </>
                  ) : (
                    <div className="flex-1 text-center py-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                      Already Reviewed
                    </div>
                  )}
                  
                  <a
                    href={import.meta.env.VITE_BACKEND_URL + `api/submissions/download/${submission._id}`}
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-sm font-medium rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredSubmissions.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {submissions.length === 0 ? 'No Assigned Papers' : 'No Papers Match Filters'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                {submissions.length === 0 
                  ? 'You don\'t have any papers assigned for review yet.'
                  : 'Try adjusting your search criteria or filters to find papers.'
                }
              </p>
              {filteredSubmissions.length === 0 && submissions.length > 0 && (
                <button
                  onClick={() => {
                    setFilters({ status: 'all', risk: 'all', verdict: 'all' });
                    setSearchTerm('');
                  }}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignedPapersPage;