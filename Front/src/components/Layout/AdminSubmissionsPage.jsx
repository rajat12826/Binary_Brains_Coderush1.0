import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Eye, 
  MoreVertical, 
  Search,
  Filter,
  Download,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  TrendingUp,
  Activity,
  RefreshCw,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Menu,
  X,
  Shield,
  AlertCircle,
  Calendar,
  BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BulkUploadDialog from "../BulkUploadDialog";

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterRisk, setFilterRisk] = useState("ALL");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("table");
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Statistics calculations
  const statistics = {
    total: submissions.length,
    pending: submissions.filter(s => !s.analysis?.reviewStatus || s.analysis?.reviewStatus === "PENDING").length,
    approved: submissions.filter(s => s.analysis?.reviewStatus === "APPROVED").length,
    rejected: submissions.filter(s => s.analysis?.reviewStatus === "REJECTED").length,
    assigned: submissions.filter(s => s.analysis?.Appointed).length,
    unassigned: submissions.filter(s => !s.analysis?.Appointed).length,
    highRisk: submissions.filter(s => {
      const aiRisk = s.analysis?.assessment?.aiProbability ? Math.round(s.analysis.assessment.aiProbability * 100) : 0;
      return aiRisk >= 80;
    }).length,
    avgAiRisk: submissions.length > 0 ? 
      submissions.reduce((acc, s) => {
        const aiRisk = s.analysis?.assessment?.aiProbability ? Math.round(s.analysis.assessment.aiProbability * 100) : 0;
        return acc + aiRisk;
      }, 0) / submissions.length : 0
  };

  // Fetch submissions and users
  useEffect(() => {
    fetchData();
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = [...submissions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(submission =>
        submission.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.userId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== "ALL") {
      filtered = filtered.filter(submission => {
        const status = submission.analysis?.reviewStatus || "PENDING";
        return status === filterStatus;
      });
    }

    // Risk filter
    if (filterRisk !== "ALL") {
      filtered = filtered.filter(submission => {
        const aiRisk = submission.analysis?.assessment?.aiProbability ? 
          Math.round(submission.analysis.assessment.aiProbability * 100) : 0;
        
        switch (filterRisk) {
          case "HIGH":
            return aiRisk >= 80;
          case "MEDIUM":
            return aiRisk >= 50 && aiRisk < 80;
          case "LOW":
            return aiRisk < 50;
          default:
            return true;
        }
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
        case 'author':
          aValue = a.userId || '';
          bValue = b.userId || '';
          break;
        case 'aiRisk':
          aValue = a.analysis?.assessment?.aiProbability || 0;
          bValue = b.analysis?.assessment?.aiProbability || 0;
          break;
        case 'status':
          aValue = a.analysis?.reviewStatus || 'PENDING';
          bValue = b.analysis?.reviewStatus || 'PENDING';
          break;
        case 'date':
        default:
          aValue = new Date(a.createdAt || Date.now());
          bValue = new Date(b.createdAt || Date.now());
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

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch submissions
      const subRes = await axios.get(import.meta.env.VITE_BACKEND_URL+"api/submissions");
      setSubmissions(subRes.data.submissions || []);
      
      // Fetch users (for reviewer assignment)
      const usersRes = await axios.get(import.meta.env.VITE_BACKEND_URL+"api/user");
      setUsers(usersRes.data || []);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data. Please try again.");
      setLoading(false);
    }
  };

  // Assign a reviewer to a submission
  const handleAssignReviewer = async (submissionId, userId) => {
    try {
      const res = await axios.put(
        import.meta.env.VITE_BACKEND_URL+`api/submissions/${submissionId}/assign`,
        { userId }
      );
      
      if (res.data.success) {
        // Update local state
        setSubmissions(prev =>
          prev.map(sub => 
            sub.id === submissionId 
              ? { ...sub, analysis: { ...sub.analysis, Appointed: userId } }
              : sub
          )
        );
      }
    } catch (err) {
      console.error(err);
      setError("Failed to assign reviewer. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800";
      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />;
      case "REJECTED":
        return <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
    }
  };

  const getRiskColor = (risk) => {
    if (risk >= 80) return "text-red-600 dark:text-red-400";
    if (risk >= 50) return "text-amber-600 dark:text-amber-400";
    return "text-emerald-600 dark:text-emerald-400";
  };

  const getRiskBgColor = (risk) => {
    if (risk >= 80) return "bg-red-100 dark:bg-red-900/30";
    if (risk >= 50) return "bg-amber-100 dark:bg-amber-900/30";
    return "bg-emerald-100 dark:bg-emerald-900/30";
  };

  // Statistics Cards Component
  const StatisticsCards = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3 lg:gap-4 mb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700/50"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">Total</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{statistics.total}</p>
          </div>
          <FileText className="w-8 h-8 text-blue-500 dark:text-blue-400" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 p-4 rounded-xl border border-amber-200 dark:border-amber-700/50"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">Pending</p>
            <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{statistics.pending}</p>
          </div>
          <Clock className="w-8 h-8 text-amber-500 dark:text-amber-400" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-700/50"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Approved</p>
            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{statistics.approved}</p>
          </div>
          <CheckCircle className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 p-4 rounded-xl border border-red-200 dark:border-red-700/50"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wide">Rejected</p>
            <p className="text-2xl font-bold text-red-900 dark:text-red-100">{statistics.rejected}</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200 dark:border-purple-700/50"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">Assigned</p>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{statistics.assigned}</p>
          </div>
          <UserCheck className="w-8 h-8 text-purple-500 dark:text-purple-400" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/20 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Unassigned</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{statistics.unassigned}</p>
          </div>
          <Users className="w-8 h-8 text-gray-500 dark:text-gray-400" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 p-4 rounded-xl border border-orange-200 dark:border-orange-700/50"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide">High Risk</p>
            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{statistics.highRisk}</p>
          </div>
          <Shield className="w-8 h-8 text-orange-500 dark:text-orange-400" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-700/50"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Avg Risk</p>
            <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{statistics.avgAiRisk.toFixed(0)}%</p>
          </div>
          <BarChart3 className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
        </div>
      </motion.div>
    </div>
  );

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-full"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4 mt-2"></div>
        </div>
      ))}
    </div>
  );

  // Grid View Component
  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
      <AnimatePresence>
        {filteredSubmissions.map((submission, index) => {
          const aiRisk = submission.analysis?.assessment?.aiProbability ? 
            Math.round(submission.analysis.assessment.aiProbability * 100) : 0;
          const plagiarism = submission.plagiarism || 0;
          const status = submission.analysis?.reviewStatus || "PENDING";
          const assignedUser = users.find(u => u._id === submission.analysis?.Appointed);

          return (
            <motion.div
              key={submission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-2xl hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 transition-all duration-300 p-6 hover:-translate-y-1"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {submission.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Author: {submission.userId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status)}
                </div>
              </div>

              {/* AI Risk Progress */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">AI Risk</span>
                  <span className={`text-sm font-bold ${getRiskColor(aiRisk)}`}>
                    {aiRisk}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${aiRisk}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Plagiarism</p>
                  <p className={`text-lg font-bold ${getRiskColor(plagiarism)}`}>
                    {plagiarism}%
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Status</p>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(status)}`}>
                    {status}
                  </div>
                </div>
              </div>

              {/* Reviewer Assignment */}
              <div className="mb-4">
                {assignedUser ? (
                  <div className="flex items-center space-x-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      {assignedUser.name}
                    </span>
                  </div>
                ) : (
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    defaultValue=""
                    onChange={e => handleAssignReviewer(submission.id, e.target.value)}
                  >
                    <option value="">Assign Reviewer</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>{user.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200 font-medium text-sm">
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-lg w-64 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
            </div>
            <div className="flex space-x-3">
              <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-lg w-32 animate-pulse"></div>
            </div>
          </div>
          
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-300 dark:bg-gray-700 rounded-xl h-24 animate-pulse"></div>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <LoadingSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Data</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col space-y-4"
        >
          {/* Title and Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Admin Submissions Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Manage and review all document submissions
              </p>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {(filterStatus !== "ALL" || filterRisk !== "ALL") && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </button>
              
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2.5 ${viewMode === 'table' ? 
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 
                    'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  } transition-colors`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 ${viewMode === 'grid' ? 
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 
                    'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  } transition-colors`}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
              
              <button 
                onClick={fetchData}
                className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              
              <BulkUploadDialog />
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Menu className="w-4 h-4" />
                <span>Menu</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {showMobileMenu && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setShowFilters(!showFilters);
                      setShowMobileMenu(false);
                    }}
                    className="flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                  </button>
                  
                  <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`flex-1 p-2 ${viewMode === 'table' ? 
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 
                        'text-gray-500 dark:text-gray-400'
                      } transition-colors`}
                    >
                      <List className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex-1 p-2 ${viewMode === 'grid' ? 
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 
                        'text-gray-500 dark:text-gray-400'
                      } transition-colors`}
                    >
                      <Grid className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>
                <BulkUploadDialog />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Statistics Cards */}
        <StatisticsCards />

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-12 pr-4 py-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
          />
        </motion.div>

        {/* Enhanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters & Sorting</h3>
                  <button
                    onClick={() => {
                      setFilterStatus("ALL");
                      setFilterRisk("ALL");
                      setSortBy("date");
                      setSortOrder("desc");
                    }}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
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
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                    >
                      <option value="ALL">All Risk Levels</option>
                      <option value="LOW">Low Risk (0-49%)</option>
                      <option value="MEDIUM">Medium Risk (50-79%)</option>
                      <option value="HIGH">High Risk (80%+)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                    >
                      <option value="date">Date Created</option>
                      <option value="title">Title</option>
                      <option value="author">Author</option>
                      <option value="aiRisk">AI Risk</option>
                      <option value="status">Status</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Order</label>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors bg-white dark:bg-gray-700"
                    >
                      {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                      <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Summary */}
        {filteredSubmissions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-gray-600 dark:text-gray-400"
          >
            <span>
              Showing {filteredSubmissions.length} of {submissions.length} submissions
            </span>
            {(filterStatus !== "ALL" || filterRisk !== "ALL" || searchTerm) && (
              <button
                onClick={() => {
                  setFilterStatus("ALL");
                  setFilterRisk("ALL");
                  setSearchTerm("");
                }}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Clear filters
              </button>
            )}
          </motion.div>
        )}

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {viewMode === 'grid' ? (
            <GridView />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Mobile Cards View */}
              <div className="block lg:hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredSubmissions.length > 0 ? (
                    filteredSubmissions.map((submission, index) => {
                      const aiRisk = submission.analysis?.assessment?.aiProbability ? 
                        Math.round(submission.analysis.assessment.aiProbability * 100) : 0;
                      const plagiarism = submission.plagiarism || 0;
                      const status = submission.analysis?.reviewStatus || "PENDING";
                      const assignedUser = users.find(u => u._id === submission.analysis?.Appointed);

                      return (
                        <motion.div
                          key={submission.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all duration-200"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white truncate text-base">
                                  {submission.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  Author: {submission.userId}
                                </p>
                              </div>
                            </div>
                            {getStatusIcon(status)}
                          </div>

                          {/* Risk Metrics */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className={`text-center p-3 rounded-lg ${getRiskBgColor(aiRisk)}`}>
                              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">AI Risk</p>
                              <p className={`text-lg font-bold ${getRiskColor(aiRisk)}`}>
                                {aiRisk}%
                              </p>
                            </div>
                            <div className={`text-center p-3 rounded-lg ${getRiskBgColor(plagiarism)}`}>
                              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Plagiarism</p>
                              <p className={`text-lg font-bold ${getRiskColor(plagiarism)}`}>
                                {plagiarism}%
                              </p>
                            </div>
                          </div>

                          {/* Status */}
                          <div className="mb-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(status)}`}>
                              {status}
                            </span>
                          </div>

                          {/* Reviewer Assignment */}
                          <div className="mb-4">
                            {assignedUser ? (
                              <div className="flex items-center space-x-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                  Assigned: {assignedUser.name}
                                </span>
                              </div>
                            ) : (
                              <select
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                defaultValue=""
                                onChange={e => handleAssignReviewer(submission.id, e.target.value)}
                              >
                                <option value="">Assign Reviewer</option>
                                {users.map(user => (
                                  <option key={user._id} value={user._id}>{user.name}</option>
                                ))}
                              </select>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex space-x-2">
                            <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium text-sm">
                              <Eye className="w-4 h-4" />
                              <span>View Details</span>
                            </button>
                            <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No submissions found</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Document
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Author
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          AI Risk
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Plagiarism
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Reviewer
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredSubmissions.length > 0 ? (
                        filteredSubmissions.map((submission, index) => {
                          const aiRisk = submission.analysis?.assessment?.aiProbability ? 
                            Math.round(submission.analysis.assessment.aiProbability * 100) : 0;
                          const plagiarism = submission.plagiarism || 0;
                          const status = submission.analysis?.reviewStatus || "PENDING";
                          const assignedUser = users.find(u => u._id === submission.analysis?.Appointed);

                          return (
                            <motion.tr
                              key={submission.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all duration-200"
                            >
                              <td className="px-6 py-6">
                                <div className="flex items-center space-x-4">
                                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 dark:text-white truncate max-w-xs text-sm">
                                      {submission.title}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      ID: {submission.id}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-6 text-sm text-gray-900 dark:text-white font-medium">
                                {submission.userId}
                              </td>

                              <td className="px-6 py-6">
                                <div className="flex items-center space-x-3">
                                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 min-w-[60px]">
                                    <div
                                      className="bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 h-2 rounded-full transition-all duration-500"
                                      style={{ width: `${aiRisk}%` }}
                                    />
                                  </div>
                                  <span className={`text-sm font-bold min-w-[45px] ${getRiskColor(aiRisk)}`}>
                                    {aiRisk}%
                                  </span>
                                </div>
                              </td>

                              <td className="px-6 py-6">
                                <div className="flex items-center space-x-3">
                                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 min-w-[60px]">
                                    <div
                                      className="bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 h-2 rounded-full transition-all duration-500"
                                      style={{ width: `${plagiarism}%` }}
                                    />
                                  </div>
                                  <span className={`text-sm font-bold min-w-[45px] ${getRiskColor(plagiarism)}`}>
                                    {plagiarism}%
                                  </span>
                                </div>
                              </td>

                              <td className="px-6 py-6">
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(status)}
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
                                    {status}
                                  </span>
                                </div>
                              </td>

                              <td className="px-6 py-6">
                                {assignedUser ? (
                                  <div className="flex items-center space-x-2">
                                    <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      {assignedUser.name}
                                    </span>
                                  </div>
                                ) : (
                                  <select
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm min-w-[150px]"
                                    defaultValue=""
                                    onChange={e => handleAssignReviewer(submission.id, e.target.value)}
                                  >
                                    <option value="">Assign Reviewer</option>
                                    {users.map(user => (
                                      <option key={user._id} value={user._id}>{user.name}</option>
                                    ))}
                                  </select>
                                )}
                              </td>

                              <td className="px-6 py-6">
                                <div className="flex items-center space-x-2">
                                  <button className="inline-flex items-center space-x-1 px-3 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors text-sm font-medium">
                                    <Eye className="w-4 h-4" />
                                    <span>View</span>
                                  </button>
                                  <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="text-center py-16">
                            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No submissions found</h3>
                            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Enhanced Footer */}
        {filteredSubmissions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>{submissions.length} total submissions</span>
              <span>•</span>
              <span>{statistics.pending} pending review</span>
              <span>•</span>
              <span>{statistics.unassigned} unassigned</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}