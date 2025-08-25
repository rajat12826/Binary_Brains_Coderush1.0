import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  User, FileText, TrendingUp, AlertTriangle, CheckCircle, Clock, Eye, 
  Calendar, Target, Activity, Brain, Zap, Shield, Award, TrendingDown,
  BarChart3, PieChart as PieChartIcon, Radar as RadarIcon
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

// API service functions
const apiService = {
  baseURL: import.meta.env.VITE_BACKEND_URL+'api/user',
  
  async getUserAnalytics(userId, period = 30) {
    const response = await fetch(`${this.baseURL}/${userId}?period=${period}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
  
  async getUserSubmissions(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/${userId}/submissions?${queryString}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
};

const UserAnalyticsDashboard = () => {
  const { user: mainU } = useUser();
  const userId = mainU?.id;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch user analytics from API
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getUserAnalytics(userId, selectedPeriod);
        setUserData(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [userId, selectedPeriod]);

  // Custom Tooltip for dark mode compatibility
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-900 dark:text-gray-100 font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 dark:border-gray-600"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 dark:border-indigo-400 absolute top-0 left-0"></div>
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Loading Analytics</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Fetching your data insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-red-900/20 flex items-center justify-center p-4">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full">
          <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Oops! Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!userData || userData.analytics.summary.totalSubmissions === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <FileText className="h-10 w-10 text-gray-600 dark:text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">No Data Yet</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">No submissions found for the selected period. Start submitting to see your analytics!</p>
        </div>
      </div>
    );
  }

  const { user, analytics } = userData;
  const { summary, charts } = analytics;

  // Chart colors for dark mode compatibility
  const VERDICT_COLORS = {
    HUMAN_WRITTEN: '#10B981',
    SUSPICIOUS: '#F59E0B',
    LIKELY_AI: '#EF4444',
    AI_GENERATED: '#DC2626'
  };

  const RISK_COLORS = {
    LOW: '#10B981',
    MEDIUM: '#F59E0B',
    HIGH: '#EF4444'
  };

  const REVIEW_COLORS = {
    PENDING: '#6B7280',
    APPROVED: '#10B981',
    REJECTED: '#EF4444'
  };

  // Transform data for charts
  const verdictChartData = Object.entries(charts.verdictDistribution).map(([key, value]) => ({
    name: key.replace('_', ' '),
    value,
    color: VERDICT_COLORS[key]
  }));

  const riskChartData = Object.entries(charts.riskDistribution).map(([key, value]) => ({
    name: key,
    value,
    color: RISK_COLORS[key]
  }));

  const reviewChartData = Object.entries(charts.reviewDistribution).map(([key, value]) => ({
    name: key,
    value,
    color: REVIEW_COLORS[key]
  }));

  const aiProbabilityData = charts.aiProbabilityRanges.map(range => ({
    range: `${((range._id - 0.2) * 100).toFixed(0)}%-${(range._id * 100).toFixed(0)}%`,
    count: range.count
  }));

  const radarData = [
    {
      subject: 'Human-like Score',
      value: Math.max(0, Math.min(100, (1 - summary.avgAIProbability) * 100)),
      fullMark: 100
    },
    {
      subject: 'Lexical Diversity',
      value: Math.max(0, Math.min(100, summary.avgLexicalDiversity * 100)),
      fullMark: 100
    },
    {
      subject: 'Clean Papers %',
      value: Math.max(0, Math.min(100, (summary.cleanPapers / summary.totalSubmissions) * 100)),
      fullMark: 100
    },
    {
      subject: 'Entropy Score',
      value: Math.max(0, Math.min(100, (summary.avgEntropy / 10) * 100)),
      fullMark: 100
    }
  ];

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue", trend }) => (
    <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 truncate">{title}</p>
          <p className={`text-xl sm:text-2xl lg:text-3xl font-bold text-${color}-600 dark:text-${color}-400 mb-1 leading-tight`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600 dark:text-green-400">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-2 sm:p-3 bg-${color}-100 dark:bg-${color}-900/30 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform duration-300 shrink-0 ml-2`}>
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </div>
  );

  const TabButton = ({ tab, label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`group relative flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-sm font-medium transition-all duration-200 min-w-0 flex-1 sm:flex-none ${
        isActive 
          ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-md border border-gray-200 dark:border-gray-600' 
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
      }`}
    >
      <Icon className="h-4 w-4 mr-2 shrink-0" />
      <span className="truncate">{label}</span>
   
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900/20">
      <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8">
              {/* Header Content */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                    Analytics Dashboard
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                    Track your AI detection performance and insights
                  </p>
                </div>
                
                {/* Period Selector */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Time Period:
                  </label>
                  <select 
                    value={selectedPeriod} 
                    onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
                    className="w-full sm:w-auto px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-gray-900 dark:text-gray-100 text-sm transition-all duration-200"
                  >
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 90 days</option>
                  </select>
                </div>
              </div>
              
              {/* Tab Navigation */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg w-full sm:w-auto">
  <TabButton
    tab="overview"
    label="Overview"
    icon={BarChart3}
    isActive={activeTab === 'overview'}
    onClick={() => setActiveTab('overview')}
  />
  <TabButton
    tab="trends"
    label="Trends"
    icon={TrendingUp}
    isActive={activeTab === 'trends'}
    onClick={() => setActiveTab('trends')}
  />
  <TabButton
    tab="analysis"
    label="Analysis"
    icon={RadarIcon}
    isActive={activeTab === 'analysis'}
    onClick={() => setActiveTab('analysis')}
  />
</div>

            </div>
          </div>
        </div>

        {/* Content Sections */}
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <StatCard 
                icon={FileText} 
                title="Total Submissions" 
                value={summary.totalSubmissions?.toLocaleString()}
                color="blue"
                trend="+12% this month"
              />
              <StatCard 
                icon={CheckCircle} 
                title="Clean Papers" 
                value={summary.cleanPapers?.toLocaleString()}
                subtitle={`${((summary.cleanPapers / summary.totalSubmissions) * 100).toFixed(1)}% success rate`}
                color="green"
                trend="+5% improvement"
              />
              <StatCard 
                icon={Target} 
                title="AI Probability" 
                value={`${(summary.avgAIProbability * 100).toFixed(1)}%`}
                subtitle="Average detection rate"
                color="orange"
              />
              <StatCard 
                icon={Clock} 
                title="Avg Word Count" 
                value={summary.avgWordCount?.toLocaleString()}
                color="purple"
                subtitle="Per submission"
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
              {/* Verdict Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                    <PieChartIcon className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                    AI Detection Results
                  </h3>
                </div>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={verdictChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={window.innerWidth < 640 ? 40 : 60}
                        outerRadius={window.innerWidth < 640 ? 80 : 100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {verdictChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Risk Level Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                    Risk Level Distribution
                  </h3>
                </div>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                        {riskChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Review Status and AI Probability */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                    Review Status
                  </h3>
                </div>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reviewChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={window.innerWidth < 640 ? 80 : 100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {reviewChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                    AI Probability Ranges
                  </h3>
                </div>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aiProbabilityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis dataKey="range" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Daily Submission Trend */}
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  Daily Submission Trend
                </h3>
              </div>
              <div className="h-80 sm:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" fill="#3B82F6" name="Submissions" radius={[2, 2, 0, 0]} />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="avgAIProbability" 
                      stroke="#EF4444" 
                      strokeWidth={3}
                      name="Avg AI Probability"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Area Chart for AI Probability */}
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  AI Probability Trend
                </h3>
              </div>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="avgAIProbability" 
                      stroke="#F59E0B" 
                      fill="#FEF3C7" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Radar Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  Writing Quality Analysis
                </h3>
              </div>
              <div className="h-80 sm:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#374151" opacity={0.3} />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar
                      name="Quality Metrics"
                      dataKey="value"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  Writing Style
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Avg Sentence Length</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{summary.avgSentenceLength?.toFixed(1)} words</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Lexical Diversity</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">{(summary.avgLexicalDiversity * 100)?.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  Technical Metrics
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Avg Perplexity</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{summary.avgPerplexity?.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Avg Entropy</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">{summary.avgEntropy?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 md:col-span-2 lg:col-span-1">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  Success Metrics
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Clean Papers</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">{summary.cleanPapers}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {((summary.cleanPapers / summary.totalSubmissions) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  Performance Indicators
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                <div className="text-center group">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm sm:text-base">Human-like Writing</h4>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {((1 - summary.avgAIProbability) * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Authenticity Score</p>
                </div>
                
                <div className="text-center group">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Zap className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm sm:text-base">Consistency</h4>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {(summary.avgLexicalDiversity * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Lexical Diversity</p>
                </div>
                
                <div className="text-center group">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Eye className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <Brain className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm sm:text-base">Complexity</h4>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {((summary.avgEntropy / 10) * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Entropy Score</p>
                </div>
                
                <div className="text-center group">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <Shield className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm sm:text-base">Risk Score</h4>
                  <p className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                    {(summary.avgAIProbability * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Detection Risk</p>
                </div>
              </div>

              {/* Additional Insights */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-green-800 dark:text-green-300">Best Performance</h5>
                      <Award className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      {((summary.cleanPapers / summary.totalSubmissions) * 100).toFixed(1)}% success rate with human-like writing
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-blue-800 dark:text-blue-300">Avg Quality</h5>
                      <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      {summary.avgWordCount?.toLocaleString()} words per submission with strong diversity
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-purple-800 dark:text-purple-300">Improvement</h5>
                      <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-sm text-purple-700 dark:text-purple-400">
                      Focus on entropy and perplexity for better results
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile-friendly footer spacing */}
      <div className="h-8 sm:h-12" />
    </div>
  );
};

export default UserAnalyticsDashboard;