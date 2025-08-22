import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  reviewer: [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'assigned', label: 'Assigned Papers', icon: FileText, badge: '8' },
    { id: 'detection', label: 'Detection Results', icon: Brain },
    { id: 'reviews', label: 'My Reviews', icon: Eye },
    { id: 'analytics', label: 'Review Analytics', icon: BarChart3 },
    { id: 'messages', label: 'Messages', icon: MessageCircle, badge: '3' }
  ],
  author: [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'submissions', label: 'My Submissions', icon: FileText, badge: '3' },
    { id: 'status', label: 'Review Status', icon: Activity },
    { id: 'feedback', label: 'Feedback', icon: MessageCircle },
    { id: 'conferences', label: 'Browse Conferences', icon: Calendar }
  ]
};

// Dashboard Statistics Component
const DashboardStats = ({ userRole }) => {
  const adminStats = [
    { label: 'Total Submissions', value: '1,247', change: '+12%', trend: 'up', icon: FileText, color: 'blue' },
    { label: 'AI Detected', value: '89', change: '+23%', trend: 'up', icon: Brain, color: 'red' },
    { label: 'Plagiarism Cases', value: '156', change: '-8%', trend: 'down', icon: Shield, color: 'orange' },
    { label: 'Clean Papers', value: '1,002', change: '+15%', trend: 'up', icon: CheckCircle, color: 'green' }
  ];

  const reviewerStats = [
    { label: 'Assigned Papers', value: '8', change: '+2', trend: 'up', icon: FileText, color: 'blue' },
    { label: 'Completed Reviews', value: '23', change: '+5', trend: 'up', icon: CheckCircle, color: 'green' },
    { label: 'AI Flags Reviewed', value: '12', change: '+3', trend: 'up', icon: Brain, color: 'red' },
    { label: 'Average Score', value: '7.8', change: '+0.2', trend: 'up', icon: Award, color: 'purple' }
  ];

  const authorStats = [
    { label: 'Submissions', value: '3', change: '+1', trend: 'up', icon: FileText, color: 'blue' },
    { label: 'Under Review', value: '2', change: '0', trend: 'neutral', icon: Clock, color: 'yellow' },
    { label: 'Accepted', value: '1', change: '+1', trend: 'up', icon: CheckCircle, color: 'green' },
    { label: 'Avg Review Score', value: '8.2', change: '+0.5', trend: 'up', icon: Award, color: 'purple' }
  ];

  const stats = userRole === 'admin' ? adminStats : userRole === 'reviewer' ? reviewerStats : authorStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <div className="flex items-center mt-2">
                <span className={`text-sm ${
                  stat.trend === 'up' ? 'text-green-600' : 
                  stat.trend === 'down' ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${
              stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
              stat.color === 'red' ? 'bg-red-100 text-red-600' :
              stat.color === 'green' ? 'bg-green-100 text-green-600' :
              stat.color === 'orange' ? 'bg-orange-100 text-orange-600' :
              stat.color === 'purple' ? 'bg-purple-100 text-purple-600' :
              'bg-yellow-100 text-yellow-600'
            }`}>
              <stat.icon className="w-6 h-6" />
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">AI Content Detection</h2>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors">
              Run Batch Scan
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex mt-4 space-x-1 bg-gray-100 rounded-lg p-1">
          {['overview', 'entropy', 'perplexity', 'watermarks'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                activeTab === tab 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {detectionResults.map((result) => (
              <div key={result.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{result.title}</h3>
                  <p className="text-sm text-gray-600">by {result.author} • {result.timestamp}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium">AI Score: {result.aiScore}%</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      result.status === 'high_risk' ? 'bg-red-100 text-red-700' :
                      result.status === 'medium_risk' ? 'bg-yellow-100 text-yellow-700' :
                      result.status === 'low_risk' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {result.status.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'entropy' && (
          <div className="text-center py-8">
            <Cpu className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Entropy Analysis</h3>
            <p className="text-gray-600">Advanced entropy-based detection algorithms analyze text randomness patterns to identify AI-generated content.</p>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">2.34</div>
                <div className="text-sm text-gray-600">Avg Entropy</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">89%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">156ms</div>
                <div className="text-sm text-gray-600">Avg Process</div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'perplexity' && (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Perplexity Analysis</h3>
            <p className="text-gray-600">Language model perplexity scores help identify unnaturally predictable text patterns common in AI writing.</p>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">45.7</div>
                <div className="text-sm text-gray-600">Avg Score</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">92%</div>
                <div className="text-sm text-gray-600">Detection Rate</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">234ms</div>
                <div className="text-sm text-gray-600">Avg Process</div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'watermarks' && (
          <div className="text-center py-8">
            <Fingerprint className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">AI Watermark Detection</h3>
            <p className="text-gray-600">Advanced algorithms detect hidden watermarks and signatures left by AI writing tools.</p>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">23</div>
                <div className="text-sm text-gray-600">Detected</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">97%</div>
                <div className="text-sm text-gray-600">Precision</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">15</div>
                <div className="text-sm text-gray-600">Models Covered</div>
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Stylometric Fingerprinting</h2>
        <p className="text-sm text-gray-600 mt-1">Analyze writing patterns and detect inconsistencies across submissions</p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Student Profiles</h3>
            <div className="space-y-3">
              {studentProfiles.map((student) => (
                <div 
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedStudent?.id === student.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  } ${student.flagged ? 'border-l-4 border-l-red-500' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{student.name}</h4>
                      <p className="text-sm text-gray-600">{student.papers} papers submitted</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        student.consistency >= 80 ? 'text-green-600' : 
                        student.consistency >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {student.consistency}% consistent
                      </div>
                      {student.flagged && (
                        <div className="text-xs text-red-600 mt-1">Flagged for review</div>
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
                <h3 className="font-medium text-gray-900 mb-4">Analysis: {selectedStudent.name}</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{selectedStudent.avgWordLength}</div>
                      <div className="text-sm text-gray-600">Avg Word Length</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{selectedStudent.sentenceComplexity}</div>
                      <div className="text-sm text-gray-600">Sentence Complexity</div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Writing Pattern Analysis</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Vocabulary Diversity</span>
                        <span className="text-sm font-medium">High</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Punctuation Usage</span>
                        <span className="text-sm font-medium">Consistent</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Readability Score</span>
                        <span className="text-sm font-medium">Grade 12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Topic Consistency</span>
                        <span className={`text-sm font-medium ${selectedStudent.flagged ? 'text-red-600' : 'text-green-600'}`}>
                          {selectedStudent.flagged ? 'Inconsistent' : 'Consistent'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedStudent.flagged && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-red-900">Inconsistency Detected</h4>
                          <p className="text-sm text-red-700 mt-1">
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
                <Fingerprint className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Student</h3>
                <p className="text-gray-600">Choose a student profile to view detailed stylometric analysis</p>
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

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl"
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-green-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                PlagioGuard Pro
              </span>
            </div>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6" />
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
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
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
          
          <div className="mt-auto p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-sm text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-white shadow-sm border-r border-gray-200 shrink-0">
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center space-x-2 mb-8">
            <Shield className="w-8 h-8 text-green-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
              PlagioGuard Pro
            </span>
          </div>
          
          <nav className="space-y-1 flex-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
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

          <div className="mt-auto p-6 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-sm text-gray-500 capitalize">{user.role}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search papers, authors, conferences..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full sm:w-80 transition-all duration-300"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>System Online</span>
                </div>
                <div className="text-sm text-gray-600">
                  Processing: <span className="font-medium text-gray-900">47 papers</span>
                </div>
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full relative"
                >
                  <Bell className="w-6 h-6" />
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white"></span>
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
              
              <div className="flex items-center space-x-2 sm:space-x-3">
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full ring-2 ring-gray-200" />
                <div className="hidden sm:block">
                  <p className="font-medium text-gray-700 text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
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
const PLagioGuardDashboard = () => {
  const [currentUser, setCurrentUser] = useState('admin');
  const [activeSection, setActiveSection] = useState('dashboard');
  const user = mockUsers[currentUser];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Conference Management Dashboard</h1>
                <p className="text-gray-600 mt-1">Advanced AI detection and plagiarism prevention toolkit</p>
              </div>
              <div className="flex space-x-3">
                <select 
                  value={currentUser} 
                  onChange={(e) => setCurrentUser(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="admin">Admin View</option>
                  <option value="reviewer">Reviewer View</option>
                  <option value="author">Author View</option>
                </select>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                  <Plus className="w-4 h-4 inline mr-2" />
                  New Conference
                </button>
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
            
            {currentUser === 'reviewer' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Reviews</h2>
                  <div className="space-y-4">
                    {[
                      { title: "Machine Learning in Healthcare", author: "Dr. Smith", deadline: "3 days", risk: "medium" },
                      { title: "Quantum Computing Applications", author: "Prof. Johnson", deadline: "5 days", risk: "low" },
                      { title: "AI Ethics Framework", author: "Dr. Brown", deadline: "1 week", risk: "high" }
                    ].map((paper, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">{paper.title}</h3>
                          <p className="text-sm text-gray-600">by {paper.author}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">{paper.deadline} left</div>
                          <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                            paper.risk === 'high' ? 'bg-red-100 text-red-700' :
                            paper.risk === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {paper.risk} risk
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Analytics</h2>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Completion Rate</span>
                        <span className="font-medium">87%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Average Score Given</span>
                        <span className="font-medium">7.8/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Response Time</span>
                        <span className="font-medium">2.3 days avg</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {currentUser === 'author' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">My Submissions</h2>
                  <div className="space-y-4">
                    {[
                      { title: "Deep Learning Optimization", status: "under_review", submitted: "2 weeks ago", conference: "ICML 2024" },
                      { title: "Neural Network Architecture", status: "accepted", submitted: "1 month ago", conference: "NeurIPS 2024" },
                      { title: "Computer Vision Methods", status: "revisions_requested", submitted: "3 weeks ago", conference: "ICCV 2024" }
                    ].map((paper, idx) => (
                      <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900">{paper.title}</h3>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            paper.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            paper.status === 'revisions_requested' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {paper.status.replace('_', ' ').toUpperCase()}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{paper.conference} • {paper.submitted}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deadlines</h2>
                  <div className="space-y-4">
                    {[
                      { conference: "AAAI 2025", deadline: "Jan 15, 2025", daysLeft: 45, type: "Full Paper" },
                      { conference: "IJCAI 2025", deadline: "Feb 20, 2025", daysLeft: 81, type: "Workshop" },
                      { conference: "ICML 2025", deadline: "Mar 1, 2025", daysLeft: 90, type: "Short Paper" }
                    ].map((conf, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">{conf.conference}</h3>
                          <p className="text-sm text-gray-600">{conf.type} • {conf.deadline}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{conf.daysLeft} days</div>
                          <div className="text-xs text-gray-500">remaining</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* System Performance Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">System Performance</h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Activity className="w-4 h-4" />
                    <span>Real-time monitoring</span>
                  </div>
                  <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                      <span className="text-sm font-semibold text-gray-900">87%</span>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">AI Detection</div>
                  <div className="text-xs text-gray-500">Accuracy Rate</div>
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
                      <span className="text-sm font-semibold text-gray-900">94%</span>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">Plagiarism</div>
                  <div className="text-xs text-gray-500">Detection Rate</div>
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
                      <span className="text-sm font-semibold text-gray-900">76%</span>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">System Load</div>
                  <div className="text-xs text-gray-500">Current Usage</div>
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
                      <span className="text-sm font-semibold text-gray-900">98%</span>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">Uptime</div>
                  <div className="text-xs text-gray-500">Last 30 Days</div>
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
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Submissions Management</h1>
              <div className="flex space-x-3">
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <Upload className="w-4 h-4" />
                  <span>Bulk Upload</span>
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paper</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conference</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Risk</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plagiarism</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[
                      { id: 1, title: "Advanced Neural Networks", author: "Dr. Smith", conference: "ICML 2024", aiRisk: 92, plagiarism: 5, status: "flagged" },
                      { id: 2, title: "Quantum Computing Methods", author: "Prof. Johnson", conference: "AAAI 2024", aiRisk: 15, plagiarism: 12, status: "clean" },
                      { id: 3, title: "Machine Learning Ethics", author: "Dr. Williams", conference: "NeurIPS 2024", aiRisk: 67, plagiarism: 3, status: "review" },
                      { id: 4, title: "Computer Vision Applications", author: "Prof. Davis", conference: "ICCV 2024", aiRisk: 8, plagiarism: 45, status: "flagged" }
                    ].map((submission) => (
                      <tr key={submission.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{submission.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {submission.author}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {submission.conference}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${
                            submission.aiRisk >= 80 ? 'text-red-600' :
                            submission.aiRisk >= 50 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {submission.aiRisk}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${
                            submission.plagiarism >= 30 ? 'text-red-600' :
                            submission.plagiarism >= 15 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {submission.plagiarism}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            submission.status === 'flagged' ? 'bg-red-100 text-red-800' :
                            submission.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {submission.status}
                          </span>
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      
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

export default PLagioGuardDashboard;