import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Eye, 
  MoreVertical, 
  Filter, 
  Download, 
  Search, 
  Calendar,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  SortAsc,
  SortDesc,
  ChevronDown,
  Grid,
  List,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BulkUploadDialog from "./BulkUploadDialog";
import { useUser } from "@clerk/clerk-react";

const SubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterRisk, setFilterRisk] = useState("ALL");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("table"); // table or grid
  const [showFilters, setShowFilters] = useState(false);
  
  const { user } = useUser();

  // Fetch submissions for the current user
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(import.meta.env.VITE_BACKEND_URL+`api/submissions/user/${user.id}`);
        setSubmissions(response.data.submissions || []);
        setFilteredSubmissions(response.data.submissions || []);
      } catch (err) {
        console.error("Error fetching submissions:", err);
        setSubmissions([]);
        setFilteredSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user?.id]);

  // Filter and search functionality
  useEffect(() => {
    let filtered = [...submissions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(submission =>
        submission.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== "ALL") {
      filtered = filtered.filter(submission => {
        const verdict = submission.analysis?.assessment?.verdict || "PENDING";
        return verdict === filterStatus;
      });
    }

    // Risk level filter
    if (filterRisk !== "ALL") {
      filtered = filtered.filter(submission => {
        const risk = submission.analysis?.assessment?.riskLevel || "LOW";
        return risk === filterRisk;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title || '';
          bValue = b.title || '';
          break;
        case 'aiProbability':
          aValue = a.analysis?.assessment?.aiProbability || 0;
          bValue = b.analysis?.assessment?.aiProbability || 0;
          break;
        case 'wordCount':
          aValue = a.analysis?.documentInfo?.wordCount || 0;
          bValue = b.analysis?.documentInfo?.wordCount || 0;
          break;
        case 'date':
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredSubmissions(filtered);
  }, [submissions, searchTerm, filterStatus, filterRisk, sortBy, sortOrder]);

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case "HIGH":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    }
  };

  const getVerdictIcon = (verdict) => {
    switch (verdict) {
      case "APPROVED":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "REJECTED":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case "APPROVED":
        return "text-green-600 dark:text-green-400";
      case "REJECTED":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-yellow-600 dark:text-yellow-400";
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-300 dark:bg-gray-700 h-4 rounded w-full"></div>
          <div className="bg-gray-300 dark:bg-gray-700 h-4 rounded w-3/4 mt-2"></div>
        </div>
      ))}
    </div>
  );

  // Grid view component
  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      <AnimatePresence>
        {filteredSubmissions.map((submission, index) => (
          <motion.div
            key={submission._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/20 transition-all duration-300 p-4 sm:p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm sm:text-base">
                  {submission.title}
                </h3>
              </div>
              {getVerdictIcon(submission.analysis?.assessment?.verdict || "PENDING")}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">AI Probability</span>
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  {(submission.analysis?.assessment?.aiProbability * 100)?.toFixed(1) ?? 0}%
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Word Count</span>
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  {submission.analysis?.documentInfo?.wordCount?.toLocaleString() ?? 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Risk Level</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  getRiskLevelColor(submission.analysis?.assessment?.riskLevel)
                }`}>
                  {submission.analysis?.assessment?.riskLevel ?? "LOW"}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(submission.createdAt).toLocaleDateString()}
                </span>
                {submission.fileUrl && (
                  <a
                    href={import.meta.env.VITE_BACKEND_URL+`api/submissions/download/${submission._id}`}
                    className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
          <div className="flex space-x-3">
            <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
            <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Submissions Management</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Total: {submissions.length} submissions • Showing: {filteredSubmissions.length}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>
            
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 ${viewMode === 'table' ? 
                  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 
                  'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                } transition-colors`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 
                  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 
                  'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                } transition-colors`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
            
            <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          
          <BulkUploadDialog />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
        <input
          type="text"
          placeholder="Search submissions by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
        />
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Risk Level</label>
                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="ALL">All Risk Levels</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="date">Date</option>
                  <option value="title">Title</option>
                  <option value="aiProbability">AI Probability</option>
                  <option value="wordCount">Word Count</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Order</label>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {viewMode === 'grid' ? (
        <GridView />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Mobile Cards View */}
          <div className="block sm:hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((submission, index) => (
                  <motion.div
                    key={submission._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        {getVerdictIcon(submission.analysis?.assessment?.verdict || "PENDING")}
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {submission.title}
                        </h3>
                      </div>
                      {submission.fileUrl && (
                        <a
                          href={import.meta.env.VITE_BACKEND_URL+`api/submissions/download/${submission._id}`}
                          className="flex items-center space-x-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex-shrink-0 ml-2"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">AI Probability:</span>
                        <span className="ml-1 font-medium text-gray-900 dark:text-white">
                          {(submission.analysis?.assessment?.aiProbability * 100)?.toFixed(1) ?? 0}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Words:</span>
                        <span className="ml-1 font-medium text-gray-900 dark:text-white">
                          {submission.analysis?.documentInfo?.wordCount?.toLocaleString() ?? 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Risk:</span>
                        <span className={`ml-1 inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                          getRiskLevelColor(submission.analysis?.assessment?.riskLevel)
                        }`}>
                          {submission.analysis?.assessment?.riskLevel ?? "LOW"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Date:</span>
                        <span className="ml-1 font-medium text-gray-900 dark:text-white">
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p>No submissions found</p>
                  <p className="text-sm mt-1">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Paper
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Word Count
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Verdict
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    AI Probability
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Download
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map((submission, index) => (
                    <motion.tr
                      key={submission._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getVerdictIcon(submission.analysis?.assessment?.verdict || "PENDING")}
                          <span className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
                            {submission.title}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {submission.analysis?.documentInfo?.wordCount?.toLocaleString() ?? 0}
                      </td>

                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={getVerdictColor(submission.analysis?.assessment?.verdict || "PENDING")}>
                          {submission.analysis?.assessment?.verdict ?? "PENDING"}
                        </span>
                      </td>

                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-400 to-red-400 h-2 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${(submission.analysis?.assessment?.aiProbability * 100) ?? 0}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[45px]">
                            {(submission.analysis?.assessment?.aiProbability * 100)?.toFixed(1) ?? 0}%
                          </span>
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          getRiskLevelColor(submission.analysis?.assessment?.riskLevel)
                        }`}>
                          {submission.analysis?.assessment?.riskLevel ?? "LOW"}
                        </span>
                      </td>

                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        {submission.fileUrl ? (
                          <a
                            href={import.meta.env.VITE_BACKEND_URL+`api/submissions/download/${submission._id}`}
                            className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </a>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 text-sm">N/A</span>
                        )}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <p>No submissions found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {filteredSubmissions.length > 0 && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredSubmissions.length} of {submissions.length} submissions
        </div>
      )}
    </div>
  );
};

export default SubmissionsPage;