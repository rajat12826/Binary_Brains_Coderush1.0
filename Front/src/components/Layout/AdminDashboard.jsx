import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from "@clerk/clerk-react";
import axios from "axios";

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
  Flag
} from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';
import ToggleButton from '../AnimatedDarkModeToggle';
import { Link } from 'react-router-dom';
import BulkUploadDialog from '../BulkUploadDialog';
import DetectionDashboard from '../DetectionDashboard';
import AdminSubmissionsPage from './AdminSubmissionsPage';

// Mock data for PLagioGuard system
const mockUsers = {
  admin: {
    id: 1,
    name: "Dr. Sarah Chen",
    email: "sarah.chen@university.edu",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    department: "Computer Science",
    permissions: ["full_access", "system_config", "user_management"]
  },
};

const navigationItems = {
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'submissions', label: 'Submissions', icon: FileText, badge: '247' },
    { id: 'detection', label: 'AI Detection', icon: Brain, badge: '12' },
    { id: 'plagiarism', label: 'Plagiarism Scan', icon: Shield },
    { id: 'stylometry', label: 'Stylometric Analysis', icon: Fingerprint },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'conferences', label: 'Conferences', icon: Calendar },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ],
};

// Dashboard Statistics Component
const DashboardStats = ({ userRole }) => {
  const { user } = useUser();
  const authorId = user?.id;
  const [total, setTotal] = useState(0);
  const [adminStats, setAdminStats] = useState([]);

  useEffect(() => {
    async function fetchTotal() {
      try {
        const res = await axios.get(`api/submissions/total/${authorId}`);
        setTotal(res.data.total);
      } catch (err) {
        console.error(err);
      }
    }

    if (authorId) fetchTotal();
  }, [authorId]);

  useEffect(() => {
    async function fetchAdminStats() {
      try {
        const res = await axios.get(import.meta.env.VITE_BACKEND_URL + "api/submissions/getAdminStats");
        if (res.data.success) {
          setAdminStats(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      }
    }
    fetchAdminStats()
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
      {adminStats?.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/20 transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">{stat.label}</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              <div className="flex items-center mt-2">
                <span className={`text-sm ${
                  stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 
                  stat.trend === 'down' ? 'text-red-600 dark:text-red-400' : 
                  'text-gray-600 dark:text-gray-400'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-500 ml-1 hidden sm:inline">from last month</span>
              </div>
            </div>
            <div className={`p-2 lg:p-3 rounded-lg flex-shrink-0 ${
              stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
              stat.color === 'red' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
              stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
              stat.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
              stat.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
              'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
            }`}>
              {
                index === 0 ? <FileText className="w-5 h-5 lg:w-6 lg:h-6" /> :
                index === 1 ? <Brain className="w-5 h-5 lg:w-6 lg:h-6" /> :
                index === 2 ? <Shield className="w-5 h-5 lg:w-6 lg:h-6" /> :
                index === 3 ? <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6" /> :
                null
              }
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
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Content Detection</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 sm:hidden">Advanced detection algorithms</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button className="px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
              Run Batch Scan
            </button>
            <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 min-w-max">
            {['overview', 'entropy', 'perplexity', 'watermarks'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-sm rounded-md transition-colors whitespace-nowrap ${
                  activeTab === tab 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <DetectionDashboard activeTab={activeTab}/>
    </div>
  );
};

// Stylometric Analysis Component
const StylemetricPanel = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentProfiles, setStudentProfiles] = useState([]);

  useEffect(() => {
    async function getStudentSub() {
      try {
        const response = await fetch(import.meta.env.VITE_BACKEND_URL + "api/submissions/studentSub", {
          method: "GET",
        });
        const data = await response.json();
        setStudentProfiles(data.students)
      } catch (error) {
        console.error("❌ Error:", error);
      }
    }
    getStudentSub();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Stylometric Fingerprinting</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Analyze writing patterns and detect inconsistencies</p>
      </div>
      
      <div className="p-4 lg:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Student Profiles</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {studentProfiles.map((student) => (
                <div 
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedStudent?.id === student.id 
                      ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  } ${student.flagged ? 'border-l-4 border-l-red-500 dark:border-l-red-400' : ''}`}
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
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{selectedStudent.avgWordLength}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Avg Word Length</div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{selectedStudent.sentenceComplexity}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Sentence Complexity</div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Writing Pattern Analysis</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Vocabulary Diversity</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">High</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Punctuation Usage</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Consistent</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Readability Score</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Grade 12</span>
                      </div>
                      <div className="flex justify-between items-center">
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
                          <h4 className="font-medium text-red-900 dark:text-red-200">Inconsistency Detected</h4>
                          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
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

// Dashboard Layout Component
const DashboardLayout = ({ children, user, activeSection, setActiveSection }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "High AI probability detected in submission #1247", type: "warning", time: "2 minutes ago" },
    { id: 2, title: "Plagiarism scan completed for batch #45", type: "success", time: "15 minutes ago" },
    { id: 3, title: "New conference deadline approaching", type: "info", time: "1 hour ago" },
    { id: 4, title: "System maintenance scheduled for tonight", type: "info", time: "3 hours ago" }
  ]);

  const navItems = navigationItems[user.role] || [];

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 sm:w-72 bg-white dark:bg-gray-800 shadow-xl"
      >
        <div className="p-4 lg:p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <div className="flex items-center space-x-2">
              <Shield className="w-7 h-7 lg:w-8 lg:h-8 text-green-600 dark:text-green-400" />
              <Link to={'/'} className="text-lg lg:text-xl cursor-pointer font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                PlagioGuard
              </Link>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <nav className="space-y-1 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-sm lg:text-base truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-red-500 dark:bg-red-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center flex-shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
          
          <div className="mt-auto p-3 lg:p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <img src={user.avatar} alt={user.name} className="w-8 h-8 lg:w-10 lg:h-10 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate text-sm lg:text-base">{user.name}</p>
                <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 xl:w-72 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center space-x-2 mb-8">
            <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
            <Link to={'/'} className="text-xl font-bold cursor-pointer bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
              PlagioGuard
            </Link>
          </div>
          
          <nav className="space-y-1 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-red-500 dark:bg-red-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-auto p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
              </div>
              <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 lg:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <div className="relative hidden sm:block flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 lg:w-5 lg:h-5" />
                <input
                  type="text"
                  placeholder="Search papers, authors..."
                  className="pl-9 lg:pl-10 pr-4 py-2 lg:py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 w-full transition-all duration-300 text-sm lg:text-base"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className="hidden xl:flex items-center space-x-3">
                <div className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
                  <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
                  <span>System Online</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Processing: <span className="font-medium text-gray-900 dark:text-white">47 papers</span>
                </div>
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full relative hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Bell className="w-5 h-5 lg:w-6 lg:h-6" />
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 dark:bg-red-600 rounded-full ring-2 ring-white dark:ring-gray-800"></span>
                </button>
                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-80 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                          <button className="text-sm text-green-600 hover:text-green-500">
                            Mark all read
                          </button>
                        </div>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {notifications.map(notification => (
                            <div 
                              key={notification.id} 
                              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className={`p-1.5 rounded-full flex-shrink-0 ${
                                notification.type === 'warning' ? 'bg-yellow-100' : 
                                notification.type === 'success' ? 'bg-green-100' : 
                                'bg-blue-100'
                              }`}>
                                {notification.type === 'warning' ? (
                                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                ) : notification.type === 'success' ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Bell className="w-4 h-4 text-blue-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 leading-snug">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-200 text-center">
                          <button className="text-sm font-medium text-green-600 hover:text-green-500">
                            View All Notifications
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center space-x-3">
           
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-blue-500 transition-all duration-200"
                    }
                  }}
                />
                 
          
           <ToggleButton/>
            </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

// Main PLagioGuard Dashboard Component
const AdminDashboard = () => {
  const [currentUser, setCurrentUser] = useState('admin');
  const [activeSection, setActiveSection] = useState('dashboard');
  const user = mockUsers[currentUser];
  const[sub,setsub]=useState([])
  useEffect(()=>{
    const user=localStorage.getItem("user")
    console.log(user);
    
 async function getAllSub() {
      try {
      // Upload and get immediate analysis
      const response = await fetch(import.meta.env.VITE_BACKEND_URL+"api/submissions/allSubmissions", {
        method: "GET",
     
      });

// console.log(sub);
const data=await response.json()
 setsub(data.submissions)
   console.log(data);
   

    } catch (error) {
      console.error("❌ Error:", error);
    //   setError(error.message || "An error occurred during processing");
      
    } finally {
      
    }
  }
   getAllSub();
  },[])
 
   async function getStudentSub() {
      try {
      // Upload and get immediate analysis
      const response = await fetch(import.meta.env.VITE_BACKEND_URL+"api/submissions/studentSub", {
        method: "GET",
     
      });

   console.log(response);
   

    } catch (error) {
      console.error("❌ Error:", error);
    //   setError(error.message || "An error occurred during processing");
      
    } finally {
      
    }
  }
 
getStudentSub()
console.log();

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Conference Management Dashboard</h1>
                <p className="text-gray-600 mt-1 dark:text-gray-100">Advanced AI detection and plagiarism prevention toolkit</p>
              </div>
            
            </div>
            
            <DashboardStats userRole={currentUser} />
            
            {currentUser === 'admin' && (
              <>
                <AIDetectionPanel />
                <div className="mt-8">
                  <StylemetricPanel />
                </div>
              </>
            )}
            
          
         
            
            {/* System Performance Panel */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">System Performance</h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-100">
                    <Activity className="w-4 h-4" />
                    <span>Real-time monitoring</span>
                  </div>
                  <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 relative">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        className="text-gray-200"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - 0.87)}`}
                        className="text-green-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">87%</span>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">AI Detection</div>
                  <div className="text-xs text-gray-500 dark:text-gray-100">Accuracy Rate</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 relative">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        className="text-gray-200"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - 0.94)}`}
                        className="text-blue-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">94%</span>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Plagiarism</div>
                  <div className="text-xs text-gray-500 dark:text-gray-100">Detection Rate</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 relative">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        className="text-gray-200"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - 0.76)}`}
                        className="text-purple-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">76%</span>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">System Load</div>
                  <div className="text-xs text-gray-500 dark:text-gray-100">Current Usage</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 relative">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        className="text-gray-200"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - 0.98)}`}
                        className="text-green-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">98%</span>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">Uptime</div>
                  <div className="text-xs text-gray-500 dark:text-gray-100">Last 30 Days</div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'detection':
        return <AIDetectionPanel />;
      
      case 'stylometry':
        return <StylemetricPanel />;
        
      case 'submissions':
        return <AdminSubmissionsPage/>
          
      
      default:
        return (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Settings className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Feature Coming Soon</h2>
            <p className="text-gray-600">This section is under development and will be available soon.</p>
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

export default AdminDashboard;