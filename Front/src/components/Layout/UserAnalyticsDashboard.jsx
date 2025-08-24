
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { User, FileText, TrendingUp, AlertTriangle, CheckCircle, Clock, Eye } from 'lucide-react';
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

const UserAnalyticsDashboard = () => { // Accept userId as prop
    const {user:mainU}=useUser()
    const userId=mainU?.id;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Analytics</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!userData || userData.analytics.summary.totalSubmissions === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600">No submissions found for the selected period.</p>
        </div>
      </div>
    );
  }

  const { user, analytics } = userData;
  const { summary, charts } = analytics;

  // Chart colors
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

  // Transform AI probability ranges data
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

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-full`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen w-full">
      <div className=" px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            {/* <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-indigo-100 rounded-full">
                  <User className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                  <p className="text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500">Member since {new Date(user.memberSince).toLocaleDateString()}</p>
                </div>
              </div>
            
            </div> */}
            
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {['overview', 'trends', 'analysis'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
                <div className="flex items-center space-x-4">
                <select 
                  value={selectedPeriod} 
                  onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                icon={FileText} 
                title="Total Submissions" 
                value={summary.totalSubmissions}
                color="blue"
              />
              <StatCard 
                icon={CheckCircle} 
                title="Clean Papers" 
                value={summary.cleanPapers}
                subtitle={`${((summary.cleanPapers / summary.totalSubmissions) * 100).toFixed(1)}% success rate`}
                color="green"
              />
              <StatCard 
                icon={TrendingUp} 
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
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Verdict Distribution */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Detection Results</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={verdictChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {verdictChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Risk Level Distribution */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Level Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={riskChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8">
                      {riskChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Review Status and AI Probability */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reviewChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {reviewChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Probability Ranges</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={aiProbabilityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-8">
            {/* Daily Submission Trend */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Submission Trend</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={charts.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" fill="#3B82F6" name="Submissions" />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="avgAIProbability" 
                    stroke="#EF4444" 
                    strokeWidth={3}
                    name="Avg AI Probability"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Area Chart for AI Probability */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Probability Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={charts.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="avgAIProbability" 
                    stroke="#F59E0B" 
                    fill="#FEF3C7" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-8">
            {/* Radar Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Writing Quality Analysis</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Quality Metrics"
                    dataKey="value"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-4">Writing Style</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Sentence Length</span>
                    <span className="font-medium">{summary.avgSentenceLength?.toFixed(1)} words</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lexical Diversity</span>
                    <span className="font-medium">{(summary.avgLexicalDiversity * 100)?.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-4">Technical Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Perplexity</span>
                    <span className="font-medium">{summary.avgPerplexity?.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Entropy</span>
                    <span className="font-medium">{summary.avgEntropy?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-4">Success Rate</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Clean Papers</span>
                    <span className="font-medium text-green-600">{summary.cleanPapers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-medium text-green-600">
                      {((summary.cleanPapers / summary.totalSubmissions) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Indicators</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Human-like Writing</h4>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {((1 - summary.avgAIProbability) * 100).toFixed(1)}%
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Consistency</h4>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    {(summary.avgLexicalDiversity * 100).toFixed(1)}%
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Eye className="h-8 w-8 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Complexity</h4>
                  <p className="text-2xl font-bold text-purple-600 mt-2">
                    {((summary.avgEntropy / 10) * 100).toFixed(1)}%
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle className="h-8 w-8 text-orange-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Risk Score</h4>
                  <p className="text-2xl font-bold text-orange-600 mt-2">
                    {(summary.avgAIProbability * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAnalyticsDashboard;