import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import SubmissionsPage from './SubmissionsPage';
import Assignedpaper from './Assignedpaper';

import {
  Bell,
  Search,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  FileText,
  Users,
  Calendar,
  BarChart3,
  MessageCircle,
  Shield,
  Brain,
  Zap,
  Eye,
  Download,
  Upload,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Award,
  Target,
  Activity,
  Layers,
  Database,
  Globe,
  Cpu,
  ScanLine,
  Fingerprint,
  BookOpen,
  ChevronRight,
  Plus,
  MoreVertical,
  Play,
  Pause,
  RefreshCw,
  HardDrive,
  Wifi,
  ChevronDown,
  Tag,
  Flag,
  Sun,
  Moon
} from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';
import ToggleButton from './AnimatedDarkModeToggle';
import { Link } from 'react-router-dom';
import BulkUploadDialog from './BulkUploadDialog';
import UserAnalyticsDashboard from './Layout/UserAnalyticsDashboard';

// Mock data for PLagioGuard system
const mockUsers = {
  reviewer: {
    id: 2,
    name: "Prof. Michael Rodriguez",
    email: "m.rodriguez@university.edu", 
    role: "reviewer",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    department: "AI Research Lab",
    expertise: ["Machine Learning", "NLP", "Computer Vision"]
  },
  author: {
    id: 3,
    name: "Rajat Parihar",
    email: "alex.thompson@student.edu",
    role: "author",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    institution: "MIT",
    submissions: 3
  }
};

const navigationItems = {
  reviewer: [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'assigned', label: 'Assigned Papers', icon: FileText, badge: '8' },
  ],
  author: [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'submissions', label: 'My Submissions', icon: FileText, badge: '3' },
  ]
};

const DashboardStats = ({ userRole }) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const userId = user?.id;

  const [total, setTotal] = useState(0);
  const [aitotal, setAitotal] = useState(0);
  const [ptotal, setPtotal] = useState(0);
  const [cleanPapers, setCleanPapers] = useState(0);
  const [assignedpaper, setAssignedpaper] = useState(0);
  const [completedReviews, setCompletedReviews] = useState(0);
  const [authorStats, setAuthorStats] = useState([]);

  useEffect(() => {
    async function fetchTotal() {
      try {
        const res = await axios.get(import.meta.env.VITE_BACKEND_URL+`api/submissions/total/${userId}`);
        const res1 = await axios.get(import.meta.env.VITE_BACKEND_URL+`api/submissions/aitotal/${userId}`);
        const res2 = await axios.get(import.meta.env.VITE_BACKEND_URL+`api/submissions/ptotal/${userId}`);
        setTotal(res.data.total);
        setAitotal(res1.data.aitotal);
        setPtotal(res2.data.ptotal);
      } catch (err) {
        console.error(err);
      }
    }

    if (userId) fetchTotal();
  }, [userId]);

  useEffect(() => {
    async function fetchCleanCount() {
      try {
        const res = await axios.get(import.meta.env.VITE_BACKEND_URL+`api/submissions/clean/${userId}`);
        setCleanPapers(res.data.cleanCount);
      } catch (err) {
        console.error(err);
      }
    }

    if (userId) fetchCleanCount();
  }, [userId]);

  const reviewerStats = [
    { label: 'Assigned Papers', value: assignedpaper, icon: FileText, color: 'blue' },
    { label: 'Completed Reviews', value: completedReviews, icon: CheckCircle, color: 'green' },
    { label: 'AI Flags Reviewed', value: '12', icon: Brain, color: 'red' },
    { label: 'Average Score', value: '7.8', icon: Award, color: 'purple' }
  ];

  useEffect(() => {
    fetch(import.meta.env.VITE_BACKEND_URL+`api/submissions?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const submissions = data.submissions || [];
        const total = submissions.length;
        const underReview = submissions.filter(s => s.reviewStatus === "PENDING").length;
        const accepted = submissions.filter(s => s.reviewStatus === "APPROVED").length;
        const avgScore =
          submissions.length > 0
            ? (
                submissions.reduce((sum, s) => sum + (s.analysis?.score || 0), 0) /
                submissions.length
              ).toFixed(1)
            : 0;

        const computeTrend = (current, previous) => {
          if (previous == null) return "neutral";
          return current > previous ? "up" : current < previous ? "down" : "neutral";
        };

        const previousStats = { total: 0, underReview: 0, accepted: 0, avgScore: 0 };

        setAuthorStats([
          { label: "Submissions", value: total, change: total - previousStats.total, trend: computeTrend(total, previousStats.total), icon: FileText, color: "blue" },
          { label: "Under Review", value: underReview, change: underReview - previousStats.underReview, trend: computeTrend(underReview, previousStats.underReview), icon: Clock, color: "yellow" },
          { label: "Accepted", value: accepted, change: accepted - previousStats.accepted, trend: computeTrend(accepted, previousStats.accepted), icon: CheckCircle, color: "green" },
          { label: "Avg Review Score", value: avgScore, change: (avgScore - previousStats.avgScore).toFixed(1), trend: computeTrend(avgScore, previousStats.avgScore), icon: Award, color: "purple" }
        ]);
      })
      .catch(err => console.error("Failed to fetch author stats:", err));
  }, [userId]);

  const stats = userRole === 'reviewer' ? reviewerStats : authorStats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/20 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">{stat.label}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              {stat.change !== undefined && (
                <div className="flex items-center mt-2">
                  <span className={`text-sm ${
                    stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 
                    stat.trend === 'down' ? 'text-red-600 dark:text-red-400' : 
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {stat.change > 0 ? '+' : ''}{stat.change}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-500 ml-1 hidden sm:inline">from last month</span>
                </div>
              )}
            </div>
            <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${
              stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
              stat.color === 'red' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
              stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
              stat.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
              stat.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
              'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
            }`}>
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// AI Detection Panel Component
const AIDetectionPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const detectionResults = [
    { id: 1, title: "Deep Learning Approaches to NLP", author: "John Smith", aiScore: 92, status: 'high_risk', timestamp: '2 hours ago' },
    { id: 2, title: "Quantum Computing Applications", author: "Sarah Davis", aiScore: 15, status: 'clean', timestamp: '4 hours ago' },
    { id: 3, title: "Computer Vision in Healthcare", author: "Mike Johnson", aiScore: 78, status: 'medium_risk', timestamp: '1 day ago' },
    { id: 4, title: "Blockchain Security Analysis", author: "Emma Wilson", aiScore: 45, status: 'low_risk', timestamp: '2 days ago' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Content Detection</h2>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
              Run Batch Scan
            </button>
            <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex mt-4 space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 overflow-x-auto">
          {['overview', 'entropy', 'perplexity', 'watermarks'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-sm rounded-md transition-colors whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-4 sm:p-6">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {detectionResults.map((result) => (
              <div key={result.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">{result.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">by {result.author} • {result.timestamp}</p>
                </div>
                <div className="flex items-center justify-between sm:justify-end space-x-3">
                  <div className="text-left sm:text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">AI Score: {result.aiScore}%</div>
                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                      result.status === 'high_risk' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                      result.status === 'medium_risk' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                      result.status === 'low_risk' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    }`}>
                      {result.status.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'entropy' && (
          <div className="text-center py-8">
            <Cpu className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Entropy Analysis</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Advanced entropy-based detection algorithms analyze text randomness patterns to identify AI-generated content.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-xl font-bold text-gray-900 dark:text-white">2.34</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Entropy</div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-xl font-bold text-gray-900 dark:text-white">89%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-xl font-bold text-gray-900 dark:text-white">156ms</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Process</div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'perplexity' && (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Perplexity Analysis</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Language model perplexity scores help identify unnaturally predictable text patterns common in AI writing.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-xl font-bold text-gray-900 dark:text-white">45.7</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Score</div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-xl font-bold text-gray-900 dark:text-white">92%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Detection Rate</div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-xl font-bold text-gray-900 dark:text-white">234ms</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Process</div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'watermarks' && (
          <div className="text-center py-8">
            <Fingerprint className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">AI Watermark Detection</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Advanced algorithms detect hidden watermarks and signatures left by AI writing tools.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-xl font-bold text-gray-900 dark:text-white">23</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Detected</div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-xl font-bold text-gray-900 dark:text-white">97%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Precision</div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-xl font-bold text-gray-900 dark:text-white">15</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Models Covered</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Stylometric Analysis Component
const StylemetricPanel = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const studentProfiles = [
    { id: 1, name: "Alice Johnson", papers: 5, consistency: 94, flagged: false, avgWordLength: 5.2, sentenceComplexity: 8.4 },
    { id: 2, name: "Bob Smith", papers: 3, consistency: 67, flagged: true, avgWordLength: 4.8, sentenceComplexity: 6.2 },
    { id: 3, name: "Carol Davis", papers: 7, consistency: 89, flagged: false, avgWordLength: 5.8, sentenceComplexity: 9.1 },
    { id: 4, name: "David Wilson", papers: 4, consistency: 45, flagged: true, avgWordLength: 6.2, sentenceComplexity: 7.8 }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Stylometric Fingerprinting</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Analyze writing patterns and detect inconsistencies across submissions</p>
      </div>
      
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Student Profiles</h3>
            <div className="space-y-3">
              {studentProfiles.map((student) => (
                <div 
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedStudent?.id === student.id 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  } ${student.flagged ? 'border-l-4 border-l-red-500' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">{student.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{student.papers} papers submitted</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className={`text-sm font-medium ${
                        student.consistency >= 80 ? 'text-green-600 dark:text-green-400' : 
                        student.consistency >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {student.consistency}% consistent
                      </div>
                      {student.flagged && (
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1">Flagged for review</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            {selectedStudent ? (
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Analysis: {selectedStudent.name}</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedStudent.avgWordLength}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Avg Word Length</div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedStudent.sentenceComplexity}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Sentence Complexity</div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Writing Pattern Analysis</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Vocabulary Diversity</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">High</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Punctuation Usage</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Consistent</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Readability Score</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Grade 12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Topic Consistency</span>
                        <span className={`text-sm font-medium ${selectedStudent.flagged ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                          {selectedStudent.flagged ? 'Inconsistent' : 'Consistent'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedStudent.flagged && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-red-900 dark:text-red-300">Inconsistency Detected</h4>
                          <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                            Significant deviation in writing style detected. Recommend manual review.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Fingerprint className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a Student</h3>
                <p className="text-gray-600 dark:text-gray-400">Choose a student profile to view detailed stylometric analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Dark Mode Toggle Component
const DarkModeToggle = ({ darkMode, setDarkMode }) => {
  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
    >
      {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
};

// Dashboard Layout Component
const DashboardLayout = ({ children, user, activeSection, setActiveSection }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "High AI probability detected in submission #1247", type: "warning", time: "2 minutes ago" },
    { id: 2, title: "Plagiarism scan completed for batch #45", type: "success", time: "15 minutes ago" },
    { id: 3, title: "New conference deadline approaching", type: "info", time: "1 hour ago" },
    { id: 4, title: "System maintenance scheduled for tonight", type: "info", time: "3 hours ago" }
  ]);

  const navItems = navigationItems[user.role] || [];

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Close sidebar on outside click
  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleOverlayClick}
            className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 sm:p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div className="flex items-center space-x-2">
                  <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
                  <Link to={'/'} className="text-lg sm:text-xl cursor-pointer font-bold bg-gradient-to-r from-green-600 to-green-700 dark:from-green-400 dark:to-green-500 bg-clip-text text-transparent">
                    PlagioGuard
                  </Link>
                </div>
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              
              <nav className="space-y-1 flex-1 overflow-y-auto">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-200 ${
                      activeSection === item.id
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center flex-shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
              
              <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 p-2">
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full ring-2 ring-gray-200 dark:ring-gray-600" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 flex-shrink-0 transition-colors duration-300">
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center space-x-2 mb-8">
            <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
            <Link  to={'/'} className="text-xl font-bold cursor-pointer bg-gradient-to-r from-green-600 to-green-700 dark:from-green-400 dark:to-green-500 bg-clip-text text-transparent">
              PlagioGuard
            </Link>
          </div>
          
          <nav className="space-y-1 flex-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full ring-2 ring-gray-200 dark:ring-gray-600" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
              </div>
              <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <div className="relative hidden sm:block flex-1 max-w-lg">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search papers, authors, conferences..."
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-400 dark:focus:border-green-400 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden md:flex items-center space-x-3">
                <div className="flex items-center space-x-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
                  <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
                  <span className="hidden sm:inline">System Online</span>
                  <span className="sm:hidden">Online</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 hidden lg:block">
                  Processing: <span className="font-medium text-gray-900 dark:text-white">47 papers</span>
                </div>
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                >
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800"></span>
                </button>
                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none z-10"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                          <button className="text-sm text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300">
                            Mark all read
                          </button>
                        </div>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {notifications.map(notification => (
                            <div 
                              key={notification.id} 
                              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                            >
                              <div className={`p-1.5 rounded-full flex-shrink-0 ${
                                notification.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 
                                notification.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' : 
                                'bg-blue-100 dark:bg-blue-900/30'
                              }`}>
                                {notification.type === 'warning' ? (
                                  <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                ) : notification.type === 'success' ? (
                                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                ) : (
                                  <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white leading-snug">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 text-center">
                          <button className="text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300">
                            View All Notifications
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} /> */}
                <ToggleButton/>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 ring-2 ring-gray-200 dark:ring-gray-600 hover:ring-green-500 dark:hover:ring-green-400 transition-all duration-200"
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="sm:hidden mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search papers, authors..."
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-400 dark:focus:border-green-400 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
              />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          {children}
        </main>
      </div>
    </div>
  );
};

// Main PLagioGuard Dashboard Component
const PLagioGuardDashboard = () => {
  const [currentUser, setCurrentUser] = useState('author');
  const [activeSection, setActiveSection] = useState('dashboard');
  const user = mockUsers[currentUser];
  
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Conference Management Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">Advanced AI detection and plagiarism prevention toolkit</p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <select 
                  value={currentUser} 
                  onChange={(e) => setCurrentUser(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-400 dark:focus:border-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="reviewer">Reviewer View</option>
                  <option value="author">Author View</option>
                </select>
                <button className="bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center justify-center">
                  <Plus className="w-4 h-4 mr-2" />
                  New Conference
                </button>
              </div>
            </div>
            
            <DashboardStats userRole={currentUser} />
            
            {currentUser === 'reviewer' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pending Reviews</h2>
                  <div className="space-y-4">
                    {[
                      { title: "Machine Learning in Healthcare", author: "Dr. Smith", deadline: "3 days", risk: "medium" },
                      { title: "Quantum Computing Applications", author: "Prof. Johnson", deadline: "5 days", risk: "low" },
                      { title: "AI Ethics Framework", author: "Dr. Brown", deadline: "1 week", risk: "high" }
                    ].map((paper, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">{paper.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">by {paper.author}</p>
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{paper.deadline} left</div>
                          <div className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                            paper.risk === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                            paper.risk === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                            'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          }`}>
                            {paper.risk} risk
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Review Analytics</h2>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
                        <span className="font-medium text-gray-900 dark:text-white">87%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-green-600 dark:bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: '87%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Average Score Given</span>
                        <span className="font-medium text-gray-900 dark:text-white">7.8/10</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Response Time</span>
                        <span className="font-medium text-gray-900 dark:text-white">2.3 days avg</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-green-600 dark:bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {currentUser === 'author' && (
              <UserAnalyticsDashboard/>
            )}
            
            {/* System Performance Panel */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">System Performance</h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Activity className="w-4 h-4" />
                    <span className="hidden sm:inline">Real-time monitoring</span>
                    <span className="sm:hidden">Live</span>
                  </div>
                  <button className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
              
           <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
  {[
    { label: "AI Detection", sublabel: "Accuracy Rate", value: 87, color: "green" },
    { label: "Plagiarism", sublabel: "Detection Rate", value: 94, color: "blue" },
    { label: "System Load", sublabel: "Current Usage", value: 76, color: "purple" },
    { label: "Uptime", sublabel: "Last 30 Days", value: 98, color: "green" }
  ].map((item, index) => (
    <div key={index} className="text-center w-full">
      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 relative">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={`${2 * Math.PI * 28}`}
            strokeDashoffset={`${2 * Math.PI * 28 * (1 - item.value / 100)}`}
            className={`${
              item.color === 'green'
                ? 'text-green-500 dark:text-green-400'
                : item.color === 'blue'
                ? 'text-blue-500 dark:text-blue-400'
                : 'text-purple-500 dark:text-purple-400'
            } transition-all duration-1000`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
            {item.value}%
          </span>
        </div>
      </div>
      <div className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
        {item.label}
      </div>
      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        {item.sublabel}
      </div>
    </div>
  ))}
</div>

            </div>
          </div>
        );
      
      case 'detection':
        return <AIDetectionPanel />;
      
      case 'stylometry':
        return <StylemetricPanel />;
        
      case 'submissions':
        return <SubmissionsPage />;

      case 'assigned':
        return <Assignedpaper/>;

      default:
        return (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Settings className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Feature Coming Soon</h2>
            <p className="text-gray-600 dark:text-gray-400">This section is under development and will be available soon.</p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout 
      user={user} 
      activeSection={activeSection} 
      setActiveSection={setActiveSection}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default PLagioGuardDashboard;