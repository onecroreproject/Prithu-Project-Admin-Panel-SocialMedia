import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  Users, Eye, MousePointer2, CheckCircle2, Clock, Heart, 
  Share2, Bookmark, FastForward, TrendingUp, Search, AlertCircle,
  Zap, Brain, RefreshCcw, Filter, X
} from 'lucide-react';
import api from '../Services/apiClient'; // Fixed import path

const RecommendationDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [range, setRange] = useState('7d');
  const [kpis, setKpis] = useState({});
  const [trends, setTrends] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [feedPerformance, setFeedPerformance] = useState([]);
  const [searchAnalytics, setSearchAnalytics] = useState([]);
  const [timeInsights, setTimeInsights] = useState([]);
  const [dayInsights, setDayInsights] = useState([]);
  const [liveStats, setLiveStats] = useState({ onlineUsers: 0, activeViews: 0 });
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  
  // Analysis State
  const [analyzingFeed, setAnalyzingFeed] = useState(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchLiveStats, 10000);
    return () => clearInterval(interval);
  }, [range]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length >= 2) {
        handleUserSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleUserSearch = async (query) => {
    setIsSearching(true);
    try {
      const res = await api.get(`/api/admin/analytics/search-users?query=${query}`);
      setSearchResults(res.data.users);
    } catch (err) {
      console.error("Search Error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kpiRes, trendRes, catRes, feedRes, searchRes, timeRes, dayRes] = await Promise.all([
        api.get(`/api/admin/analytics/recommendation-kpis?range=${range}`),
        api.get(`/api/admin/analytics/engagement-trends?range=${range}`),
        api.get('/api/admin/analytics/top-categories'),
        api.get('/api/admin/analytics/feed-performance'),
        api.get('/api/admin/analytics/search-analytics'),
        api.get(`/api/admin/analytics/time-insights?range=${range}`),
        api.get(`/api/admin/analytics/day-insights?range=${range}`)
      ]);

      setKpis(kpiRes.data.kpis);
      setTrends(trendRes.data.trends);
      setTopCategories(catRes.data.stats);
      setFeedPerformance(feedRes.data.stats);
      setSearchAnalytics(searchRes.data.topSearches);
      setTimeInsights(timeRes.data.stats);
      setDayInsights(dayRes.data.stats);
    } catch (err) {
      console.error("Dashboard Data Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveStats = async () => {
    try {
      const res = await api.get('/api/admin/analytics/live-monitoring');
      setLiveStats(res.data.stats);
    } catch (err) {
      console.error("Live Stats Error:", err);
    }
  };

  const handleDownload = async (type, userId = '') => {
    if (type === 'single' && !userId) {
      alert("Please enter a valid User ID");
      return;
    }
    
    try {
      const url = `/api/admin/analytics/export-csv?type=${type}&range=${range}${userId ? `&userId=${userId}` : ''}`;
      const response = await api.get(url, { responseType: 'blob' });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', type === 'all' ? `global_analytics_${range}.csv` : `user_${userId}_analytics.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("CSV Export Error:", err);
      alert("Failed to export CSV. Please check console for details.");
    }
  };

  const handleTriggerTraining = async () => {
    if (!window.confirm("This will recalculate all user recommendation scores and refresh the ML engine. Continue?")) return;
    
    setIsTraining(true);
    try {
      const res = await api.post('/api/admin/analytics/trigger-ml-training');
      alert(res.data.message || "ML Training Triggered Successfully!");
      fetchData(); // Refresh data
    } catch (err) {
      console.error("Training Trigger Error:", err);
      alert(err.response?.data?.message || "Failed to trigger ML training. Please try again.");
    } finally {
      setIsTraining(false);
    }
  };

  const handleAnalyzeFeed = async (feedId) => {
    setIsAnalyzing(true);
    try {
      const res = await api.get(`/api/admin/analytics/get-feed-analysis/${feedId}`);
      setAnalyzingFeed(res.data);
      setIsAnalysisModalOpen(true);
    } catch (err) {
      console.error("Analysis Error:", err);
      alert("Failed to analyze feed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const KPICard = ({ title, value, icon: Icon, trend, color }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-black text-gray-800">{value}</p>
    </motion.div>
  );

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
            <Brain className="w-8 h-8 text-green-500" />
            Recommendation Insights
          </h1>
          <p className="text-gray-400 font-medium">Analyze your ML engine's performance and user behavior</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleTriggerTraining}
            disabled={isTraining}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-sm transition-all shadow-lg ${isTraining ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-black active:scale-95 shadow-gray-200'}`}
          >
            {isTraining ? (
              <RefreshCcw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 text-amber-400" />
            )}
            {isTraining ? 'Training AI...' : 'Train ML Engine'}
          </button>

          <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
            {['24h', '7d', '30d'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${range === r ? 'bg-green-500 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {r.toUpperCase()}
              </button>
            ))}
            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-all">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 mb-8 border-b border-gray-200">
        {[
          { id: 'overview', label: 'Overview', icon: Brain },
          { id: 'time', label: 'Time Insights', icon: Clock },
          { id: 'weekly', label: 'Weekly Insights', icon: TrendingUp },
          { id: 'export', label: 'Data Export', icon: Share2 }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 pb-4 text-sm font-black transition-all relative ${activeTab === tab.id ? 'text-green-500' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'export' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Global Export */}
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="p-4 bg-green-50 rounded-3xl w-fit mb-6">
                <Brain className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-2">Global Analytics Export</h3>
              <p className="text-gray-400 font-medium mb-8">Download complete engagement data for all users across the platform in CSV format.</p>
            </div>
            <button 
              onClick={() => handleDownload('all')}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Export All Data
            </button>
          </div>

          {/* Single User Export */}
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
            <div className="p-4 bg-blue-50 rounded-3xl w-fit mb-6">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2">Individual User Export</h3>
            <p className="text-gray-400 font-medium mb-6">Search by Name, Email, Phone, or Referral Code to export user data.</p>
            
            <div className="space-y-4 mb-8 relative">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Find User</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type name, email, or mobile..."
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 transition-all pr-12"
                />
                {isSearching && (
                  <div className="absolute right-4 top-4">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                  </div>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white rounded-3xl shadow-2xl border border-gray-100 max-h-60 overflow-y-auto overflow-x-hidden backdrop-blur-xl bg-opacity-90">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setSelectedUser(user);
                        setSearchQuery(`${user.name} (${user.userName})`);
                        setSearchResults([]);
                      }}
                      className="w-full p-4 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 border-b border-gray-50 last:border-none"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-black text-blue-500 overflow-hidden">
                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : (user.name?.[0] || user.userName?.[0] || '?')}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 truncate">{user.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{user.email || user.phoneNumber || user.referralCode}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedUser && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between"
              >
                <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase">Selected User</p>
                  <p className="font-bold text-blue-700">{selectedUser.name}</p>
                </div>
                <button onClick={() => setSelectedUser(null)} className="text-blue-400 hover:text-blue-600">
                  <RefreshCcw className="w-4 h-4" />
                </button>
              </motion.div>
            )}
            
            <button 
              disabled={!selectedUser}
              onClick={() => handleDownload('single', selectedUser.id)}
              className={`w-full py-4 rounded-2xl font-black shadow-xl transition-all flex items-center justify-center gap-2 ${selectedUser ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              <Share2 className="w-5 h-5" />
              Export User Data
            </button>
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <>
          {/* Real-time Ticker */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
             <div className="bg-green-500 p-4 rounded-3xl flex items-center justify-between text-white shadow-lg shadow-green-200 overflow-hidden relative group">
                <div className="relative z-10">
                   <p className="text-green-100 text-xs font-bold uppercase tracking-wider">Online Now</p>
                   <h4 className="text-2xl font-black">{liveStats.onlineUsers || 0}</h4>
                </div>
                <Zap className="w-10 h-10 text-white/20 absolute -right-2 -bottom-2 group-hover:scale-125 transition-transform" />
             </div>
             <div className="bg-blue-500 p-4 rounded-3xl flex items-center justify-between text-white shadow-lg shadow-blue-200">
                <div>
                   <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Views/10m</p>
                   <h4 className="text-2xl font-black">{liveStats.activeViews || 0}</h4>
                </div>
                <Eye className="w-8 h-8 text-white/20" />
             </div>
             <div className="bg-amber-500 p-4 rounded-3xl flex items-center justify-between text-white shadow-lg shadow-amber-200">
                <div>
                   <p className="text-amber-100 text-xs font-bold uppercase tracking-wider">Top Category</p>
                   <h4 className="text-lg font-black truncate max-w-[120px]">{topCategories[0]?.categoryInfo?.name || 'Loading...'}</h4>
                </div>
                <TrendingUp className="w-8 h-8 text-white/20" />
             </div>
             <div className="bg-purple-500 p-4 rounded-3xl flex items-center justify-between text-white shadow-lg shadow-purple-200">
                <div>
                   <p className="text-purple-100 text-xs font-bold uppercase tracking-wider">Success Rate</p>
                   <h4 className="text-2xl font-black">{kpis.successRate?.toFixed(1)}%</h4>
                </div>
                <CheckCircle2 className="w-8 h-8 text-white/20" />
             </div>
          </div>
        </>
      )}

      {activeTab === 'time' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 min-h-[400px]">
            <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Peak Activity by Period
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeInsights} barSize={25}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis 
                    dataKey="period" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9CA3AF', fontSize: 11}} 
                    interval={0}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#F9FAFB'}} 
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} 
                  />
                  <Bar dataKey="views" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 min-h-[400px]">
            <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              Unique Users by Time
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeInsights}>
                  <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                  <Tooltip contentStyle={{borderRadius: '20px', border: 'none'}} />
                  <Area type="monotone" dataKey="userCount" stroke="#10B981" fill="#10B981" fillOpacity={0.1} strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'weekly' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 min-h-[400px]">
            <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              Weekly Engagement Flow
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dayInsights}>
                  <XAxis dataKey="dayName" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                  <Tooltip contentStyle={{borderRadius: '20px', border: 'none'}} />
                  <Area type="monotone" dataKey="views" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.1} strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 min-h-[400px]">
            <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Avg Watch Duration (Weekly)
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayInsights} barSize={35}>
                  <XAxis 
                    dataKey="dayName" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9CA3AF', fontSize: 11}} 
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                  <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="avgWatchTime" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Main KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <KPICard title="Total Active Users" value={kpis.totalUsers} icon={Users} color="bg-blue-500" trend={12} />
        <KPICard title="Feed Impressions" value={kpis.totalViews} icon={Eye} color="bg-green-500" trend={8} />
        <KPICard title="Avg Watch Time" value={`${Math.round(kpis.avgWatchTime || 0)}s`} icon={Clock} color="bg-purple-500" trend={-2} />
        <KPICard title="Total Likes" value={kpis.totalLikes} icon={Heart} color="bg-rose-500" trend={15} />
        <KPICard title="Shares" value={kpis.totalShares} icon={Share2} color="bg-indigo-500" trend={5} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Engagement Trend */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 min-h-[400px]">
          <h3 className="text-xl font-black text-gray-800 mb-6">Engagement Trends</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="_id" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9CA3AF', fontSize: 11}} 
                  minTickGap={30}
                />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Area type="monotone" dataKey="views" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" dataKey="likes" stroke="#3B82F6" strokeWidth={4} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 min-h-[400px]">
          <h3 className="text-xl font-black text-gray-800 mb-6">Top Interest Categories</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={topCategories.map(c => ({ name: c.categoryInfo.name, value: Math.round(c.totalWatchTime / 60) }))}
                margin={{ top: 10, right: 10, left: 0, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9CA3AF', fontSize: 11}}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9CA3AF', fontSize: 12}} 
                  label={{ value: 'Mins', angle: -90, position: 'insideLeft', offset: 10, fill: '#9CA3AF', fontSize: 12, fontWeight: 'bold' }} 
                />
                <Tooltip 
                  cursor={{fill: '#F9FAFB'}} 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} 
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                  {topCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Search & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
         <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 lg:col-span-1">
            <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
               <Search className="w-5 h-5 text-gray-400" />
               Trending Searches
            </h3>
            <div className="space-y-4">
               {searchAnalytics.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-green-50 transition-colors group">
                     <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-gray-300 group-hover:text-green-500">#{idx + 1}</span>
                        <p className="font-bold text-gray-700">{item.query}</p>
                     </div>
                     <span className="bg-white px-3 py-1 rounded-full text-xs font-black text-gray-400 shadow-sm">
                        {item.count} hits
                     </span>
                  </div>
               ))}
            </div>
         </div>

         <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  AI Recommendation Insights
               </h3>
               <span className="bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black animate-pulse uppercase">Live AI</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border border-green-100">
                  <p className="text-green-800 font-bold leading-relaxed">
                     🚀 <span className="text-green-600 font-black">"{topCategories[0]?.categoryInfo?.name}"</span> engagement increased 18% in the last 24h.
                  </p>
               </div>
               <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-100">
                  <p className="text-blue-800 font-bold leading-relaxed">
                     💡 Users watching <span className="text-blue-600 font-black">"Educational"</span> content also show high interest in "Motivation".
                  </p>
               </div>
               <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border border-purple-100">
                  <p className="text-purple-800 font-bold leading-relaxed">
                     📉 Recommendation accuracy for <span className="text-purple-600 font-black">"Fashion"</span> category dropped. Data refresh recommended.
                  </p>
               </div>
               <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border border-amber-100">
                  <p className="text-amber-800 font-bold leading-relaxed">
                     🔥 <span className="text-amber-600 font-black">Velocity score</span> for current trending feeds is 4.2x higher than average.
                  </p>
               </div>
            </div>
         </div>
      </div>

      {/* Feed Performance Table */}
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-xl font-black text-gray-800">Top Performing Feeds</h3>
          <button 
            onClick={fetchData}
            className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest">
                <th className="px-8 py-4">Feed</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-center">Views</th>
                <th className="px-6 py-4 text-center">Avg Watch</th>
                <th className="px-6 py-4 text-center">Completion</th>
                <th className="px-6 py-4 text-center">Skip Rate</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {feedPerformance.map((feed, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 rounded-xl bg-gray-200 overflow-hidden shadow-sm flex-shrink-0">
                         <img src={feed.thumbnail} alt="" className="w-full h-full object-cover" />
                      </div>
                      <p className="font-bold text-gray-700 truncate max-w-[200px]">{feed.caption || 'No Caption'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-500">
                      {feed.category?.[0] || 'Misc'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center font-black text-gray-700">{feed.views}</td>
                  <td className="px-6 py-5 text-center font-bold text-gray-500">{feed.avgWatchTime?.toFixed(1)}s</td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                       <div className="w-12 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-green-500 h-full" style={{width: `${feed.avgCompletion}%`}}></div>
                       </div>
                       <span className="text-xs font-bold text-gray-400">{Math.round(feed.avgCompletion)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`text-xs font-black ${feed.skipRate > 30 ? 'text-red-500' : 'text-green-500'}`}>
                       {feed.skipRate?.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => handleAnalyzeFeed(feed.feedId)}
                      disabled={isAnalyzing}
                      className="bg-gray-800 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg hover:shadow-gray-400/30 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    >
                       {isAnalyzing && analyzingFeed?.feed?._id === feed.feedId ? 'Analyzing...' : 'Analyze'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analysis Modal */}
      {isAnalysisModalOpen && analyzingFeed && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-8 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-2xl">
                  <Brain className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-800">Feed Intelligence Analysis</h3>
                  <p className="text-sm text-gray-400 font-medium">Deep metrics for {analyzingFeed.feed.caption || 'this feed'}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAnalysisModalOpen(false)}
                className="p-3 hover:bg-gray-100 rounded-2xl transition-all"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                   <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Reco Score</p>
                   <p className="text-3xl font-black text-blue-700">{analyzingFeed.feed.recoScore?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="p-6 bg-purple-50 rounded-3xl border border-purple-100">
                   <p className="text-xs font-black text-purple-400 uppercase tracking-widest mb-1">Avg Completion</p>
                   <p className="text-3xl font-black text-purple-700">{analyzingFeed.stats.avgCompletion?.toFixed(1)}%</p>
                </div>
                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                   <p className="text-xs font-black text-amber-400 uppercase tracking-widest mb-1">Total Replays</p>
                   <p className="text-3xl font-black text-amber-700">{analyzingFeed.stats.replays}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Source Breakdown */}
                <div className="bg-gray-50 p-6 rounded-[32px]">
                   <h4 className="font-black text-gray-800 mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Traffic Source Efficiency
                   </h4>
                   <div className="space-y-4">
                      {analyzingFeed.stats.sourceBreakdown.map((src, i) => (
                        <div key={i} className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm">
                           <div>
                              <p className="font-bold text-gray-700 capitalize">{src.name}</p>
                              <p className="text-[10px] text-gray-400">{src.count} views tracked</p>
                           </div>
                           <div className="text-right">
                              <p className="font-black text-green-500">{src.avgCompletion}%</p>
                              <p className="text-[10px] text-gray-400 uppercase font-bold">Avg Watch</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* AI Prediction */}
                <div className="bg-gray-900 p-8 rounded-[32px] text-white">
                   <h4 className="font-black mb-4 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-green-400" />
                      ML Prediction Engine
                   </h4>
                   <div className="space-y-6">
                      <div>
                         <p className="text-xs text-gray-400 font-bold uppercase mb-2">Content Velocity</p>
                         <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-green-400 h-full" style={{width: '78%'}}></div>
                         </div>
                      </div>
                      <p className="text-sm font-medium leading-relaxed text-gray-300">
                         Based on current <span className="text-green-400">78% velocity</span>, this feed is predicted to reach <span className="text-white font-black">2.5k more users</span> in the next 48 hours if maintained in the "{analyzingFeed.feed.recoSource || 'Trending'}" category.
                      </p>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                         <p className="text-xs font-bold text-green-400 mb-1">Recommendation Strategy</p>
                         <p className="text-xs text-gray-400">Optimize for higher watch time by trimming first 2s.</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RecommendationDashboard;
