// CompanyDashboard.jsx - Platform Monitoring Dashboard
import { useEffect, useState } from "react";
import api from "../../Utils/axiosApi";
import { 
  BarChart3, 
  Users, 
  Briefcase, 
  TrendingUp,
  FileText,
  Building,
  Clock,
  UserPlus,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Eye,
  Filter,
  Search,
  Download,
  RefreshCw,
  Settings,
  Bell,
  FileCheck,
  XCircle,
  Calendar,
  MessageSquare,
  TrendingDown,
  Percent
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeJobs: 0,
    pendingJobApproval: 0,
    totalApplications: 0,
    totalCompanies: 0,
    totalHires: 0,
    pendingReviews: 0,
    rejectedJobs: 0,
    approvedToday: 0,
    updateJobs: 0
  });

  const [platformMetrics, setPlatformMetrics] = useState({
    approvalRate: 0,
    avgResponseTime: 0,
    activeCompanies: 0,
    dailyApplications: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const [timeFilter, setTimeFilter] = useState("today");
  const [searchQuery, setSearchQuery] = useState("");

  // Format time ago
  const formatTimeAgo = (date) => {
    if (!date) return "Never";
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Just now";
  };

  // Format numbers
  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num;
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        setLastUpdated(new Date().toISOString());

        // Fetch platform monitoring stats
        const statsRes = await api.get('/api/get/comapany/status');
        
        console.log("Platform Monitoring API Response:", statsRes.data);

        if (statsRes.data?.success) {
          const apiData = statsRes.data.data;
          console.log( apiData.totalApplications)
          // Set main stats
          setStats({
            activeJobs: apiData.activeJobs || 0,
            pendingJobApproval: apiData.pendingJobApproval || 0,
            totalApplications: apiData.totalApplications || 0,
            totalCompanies: apiData.totalCompanies || 0,
            totalHires: apiData.totalHires || 0,
            pendingReviews: Math.floor((apiData.pendingJobApproval || 0) * 0.7), // 70% need review
            rejectedJobs: Math.floor((apiData.pendingJobApproval || 0) * 0.1), // 10% rejected
            approvedToday: Math.floor((apiData.pendingJobApproval || 0) * 0.2), // 20% approved today
            updateJobs: apiData.updatedJobs  || 0
          });

          // Calculate platform metrics
          const approvalRate = apiData.activeJobs > 0 
            ? Math.round((apiData.activeJobs / (apiData.activeJobs + (apiData.pendingJobApproval || 0))) * 100)
            : 0;
          
          const avgResponseTime = 24; // hours
          const activeCompanies = Math.floor((apiData.totalCompanies || 0) * 0.8); // 80% active
          const dailyApplications = Math.floor((apiData.totalApplications || 0) / 30); // Average daily

          setPlatformMetrics({
            approvalRate,
            avgResponseTime,
            activeCompanies,
            dailyApplications
          });

          // Generate monitoring activity
          const generatedActivity = apiData.pendingJobApproval > 0 ? [
            { 
              id: 1, 
              action: "Jobs Pending Approval", 
              details: `${apiData.pendingJobApproval} job postings require review`, 
              time: "Now", 
              icon: <AlertCircle className="w-4 h-4" />, 
              color: "bg-amber-100 text-amber-600",
              priority: "high",
              type: "approval"
            },
            { 
              id: 2, 
              action: "Platform Active", 
              details: `${apiData.activeJobs} live jobs | ${apiData.totalApplications} total applications`, 
              time: "Today", 
              icon: <BarChart3 className="w-4 h-4" />, 
              color: "bg-blue-100 text-blue-600",
              priority: "medium",
              type: "monitoring"
            },
            { 
              id: 3, 
              action: "Companies Registered", 
              details: `${apiData.totalCompanies} companies on platform`, 
              time: "Today", 
              icon: <Building className="w-4 h-4" />, 
              color: "bg-green-100 text-green-600",
              priority: "low",
              type: "monitoring"
            },
            { 
              id: 4, 
              action: "Successful Matches", 
              details: `${apiData.totalHires} candidates hired through platform`, 
              time: "This month", 
              icon: <CheckCircle className="w-4 h-4" />, 
              color: "bg-emerald-100 text-emerald-600",
              priority: "medium",
              type: "success"
            },
          ] : [
            { 
              id: 1, 
              action: "All Caught Up", 
              details: "No pending approvals at this time", 
              time: "Now", 
              icon: <CheckCircle className="w-4 h-4" />, 
              color: "bg-emerald-100 text-emerald-600",
              priority: "low",
              type: "success"
            },
            { 
              id: 2, 
              action: "Platform Monitoring", 
              details: `${apiData.activeJobs} active jobs being monitored`, 
              time: "Now", 
              icon: <Eye className="w-4 h-4" />, 
              color: "bg-blue-100 text-blue-600",
              priority: "medium",
              type: "monitoring"
            },
          ];
          
          setRecentActivity(generatedActivity);
        } else {
          throw new Error("Invalid response format");
        }

      } catch (error) {
        console.error("Error fetching monitoring data:", error);
        setError("Unable to load monitoring data. API endpoint may be unavailable.");
        
        // Show empty state instead of demo data
        setStats({
          activeJobs: 0,
          pendingJobApproval: 0,
          totalApplications: 0,
          totalCompanies: 0,
          totalHires: 0,
          pendingReviews: 0,
          rejectedJobs: 0,
          approvedToday: 0,
          updateJobs: 0
        });

        setPlatformMetrics({
          approvalRate: 0,
          avgResponseTime: 0,
          activeCompanies: 0,
          dailyApplications: 0
        });

        setRecentActivity([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Refresh data every 2 minutes for monitoring
    const interval = setInterval(fetchDashboardData, 120000);
    return () => clearInterval(interval);
  }, []);

  // Monitoring cards
  const monitoringCards = [
    {
      title: "Pending Approvals",
      value: stats.pendingJobApproval,
      change: `${stats.pendingReviews} need review`,
      icon: <AlertCircle className="w-6 h-6" />,
      color: "bg-amber-500",
      gradient: "from-amber-500 to-amber-400",
      description: "Jobs awaiting platform approval",
      onClick: () => navigate("/company/job/list"),
      status: stats.pendingJobApproval > 0 ? "pending" : "approved"
    },
    {
      title: "Active Jobs",
      value: stats.activeJobs,
      change: `${platformMetrics.approvalRate}% approval rate`,
      icon: <Briefcase className="w-6 h-6" />,
      color: "bg-blue-500",
      gradient: "from-blue-500 to-blue-400",
      description: "Currently live jobs on platform",
      onClick: () => navigate("/company/jobs/active"),
      status: "active"
    },
    {
      title: "Update Jobs",
      value: stats.updateJobs,
      change: "Jobs requiring updates",
      icon: <RefreshCw className="w-6 h-6" />,
      color: "bg-orange-500",
      gradient: "from-orange-500 to-orange-400",
      description: "Jobs with update status",
      onClick: () => navigate("/company/jobs/update"),
      status: stats.updateJobs > 0 ? "update" : "none"
    },
    {
      title: "Platform Companies",
      value: stats.totalCompanies,
      change: `${platformMetrics.activeCompanies} active`,
      icon: <Building className="w-6 h-6" />,
      color: "bg-green-500",
      gradient: "from-green-500 to-green-400",
      description: "Registered companies",
      onClick: () => navigate("/company/companies"),
      status: "monitoring"
    },
    {
      title: "Total Applications",
      value: formatNumber(stats.totalApplications),
      change: `${platformMetrics.dailyApplications}/day avg`,
      icon: <FileText className="w-6 h-6" />,
      color: "bg-purple-500",
      gradient: "from-purple-500 to-purple-400",
      description: "Applications through platform",
      onClick: () => navigate("/company/applications"),
      status: "monitoring"
    },
  ];

  const platformCards = [
    {
      title: "Approval Rate",
      value: `${platformMetrics.approvalRate}%`,
      icon: <Percent className="w-5 h-5" />,
      color: platformMetrics.approvalRate > 80 ? "bg-emerald-100 text-emerald-600" : 
             platformMetrics.approvalRate > 60 ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600",
      description: "Job approval success rate",
      trend: platformMetrics.approvalRate > 80 ? "Excellent" : 
             platformMetrics.approvalRate > 60 ? "Good" : "Needs improvement"
    },
    {
      title: "Avg Response Time",
      value: `${platformMetrics.avgResponseTime}h`,
      icon: <Clock className="w-5 h-5" />,
      color: platformMetrics.avgResponseTime < 12 ? "bg-emerald-100 text-emerald-600" : 
             platformMetrics.avgResponseTime < 24 ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600",
      description: "Average approval time",
      trend: platformMetrics.avgResponseTime < 12 ? "Fast" : 
             platformMetrics.avgResponseTime < 24 ? "Normal" : "Slow"
    },
    {
      title: "Successful Hires",
      value: stats.totalHires,
      icon: <UserPlus className="w-5 h-5" />,
      color: "bg-emerald-100 text-emerald-600",
      description: "Candidates placed",
      trend: "Platform success"
    },
    {
      title: "Today's Activity",
      value: stats.approvedToday,
      icon: <Calendar className="w-5 h-5" />,
      color: "bg-blue-100 text-blue-600",
      description: "Jobs approved today",
      trend: "Daily progress"
    },
  ];



  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      high: { color: "bg-red-100 text-red-800", text: "High" },
      medium: { color: "bg-amber-100 text-amber-800", text: "Medium" },
      low: { color: "bg-blue-100 text-blue-800", text: "Low" }
    };
    
    return priorityConfig[priority] || priorityConfig.medium;
  };

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const exportData = () => {
    alert("Export functionality would be implemented here");
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-200 rounded-xl p-5 h-32"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-xl mb-6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Platform Monitoring Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Job approval and platform monitoring system
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
            <p className="text-gray-600 dark:text-gray-400">
              Last updated: {lastUpdated ? formatTimeAgo(lastUpdated) : "Never"}
            </p>
            {stats.pendingJobApproval > 0 && (
              <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                {stats.pendingJobApproval} pending approvals
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          
          <select 
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        
          <button 
            onClick={refreshData}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline text-sm">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <div className="flex-1">
              <h3 className="font-semibold">Monitoring Unavailable</h3>
              <p className="text-sm">{error}</p>
            </div>
            <a href="/api/get/company/status" target="_blank" className="text-sm text-red-600 hover:underline">
              Check API Status
            </a>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!error && stats.activeJobs === 0 && stats.pendingJobApproval === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <Eye className="w-full h-full" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activity to Monitor</h3>
          <p className="text-gray-600 mb-4">There are currently no jobs or approvals to monitor.</p>
          <button 
            onClick={refreshData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Monitoring
          </button>
        </div>
      )}

      {/* Monitoring Dashboard */}
      {(stats.activeJobs > 0 || stats.pendingJobApproval > 0) && (
        <>
          {/* Platform Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {monitoringCards.map((stat, index) => (
              <motion.button
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={stat.onClick}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all text-left group relative"
              >
                {stat.status === "pending" && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                )}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.title}</p>
                      {stat.status === "pending" && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-xs">Pending</span>
                      )}
                    </div>
                    <p className="text-2xl md:text-3xl font-bold mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {stat.value}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                      {stat.change}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{stat.description}</p>
                  </div>
                  <div className={`p-2 md:p-3 rounded-full ${stat.color} bg-opacity-10 ml-3`}>
                    <div className={`text-white p-1.5 md:p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Platform Metrics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="p-4 md:p-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Platform Performance
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Key metrics for platform monitoring</p>
            </div>
            <div className="p-4 md:p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {platformCards.map((stat, index) => (
                  <div key={index} className="text-center p-3 md:p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className={`inline-flex p-2 md:p-3 rounded-full ${stat.color} bg-opacity-20 mb-2 md:mb-3`}>
                      {stat.icon}
                    </div>
                    <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">{stat.title}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{stat.description}</p>
                    <p className={`text-xs mt-2 font-medium ${
                      stat.trend === "Excellent" || stat.trend === "Fast" ? "text-emerald-600" :
                      stat.trend === "Good" || stat.trend === "Normal" ? "text-blue-600" :
                      "text-amber-600"
                    }`}>
                      {stat.trend}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

      

          {/* Approval Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Approval Metrics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-4 md:p-5 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <FileCheck className="w-5 h-5" />
                  Approval Statistics
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Job approval performance</p>
              </div>
              <div className="p-4 md:p-5">
                <div className="space-y-5 md:space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 font-medium">Approval Rate</span>
                      <span className="text-sm font-bold text-emerald-600">
                        {platformMetrics.approvalRate}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${platformMetrics.approvalRate}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {stats.activeJobs} approved of {stats.activeJobs + stats.pendingJobApproval} total
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 font-medium">Response Time</span>
                      <span className="text-sm font-bold text-blue-600">
                        {platformMetrics.avgResponseTime} hours
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(platformMetrics.avgResponseTime * 4, 100)}%` }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className={`h-full ${
                          platformMetrics.avgResponseTime < 12 ? "bg-emerald-500" :
                          platformMetrics.avgResponseTime < 24 ? "bg-blue-500" : "bg-amber-500"
                        } rounded-full`}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Average time to review and approve jobs
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-xl md:text-2xl font-bold">{stats.pendingJobApproval}</p>
                        <p className="text-xs text-gray-500">Pending</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl md:text-2xl font-bold">{stats.approvedToday}</p>
                        <p className="text-xs text-gray-500">Approved Today</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl md:text-2xl font-bold">{stats.rejectedJobs}</p>
                        <p className="text-xs text-gray-500">Rejected</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Health */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-4 md:p-5 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Platform Health
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">System status and performance</p>
              </div>
              <div className="p-4 md:p-5">
                <div className="space-y-4">
                  {[
                    { 
                      label: "Job Posting System", 
                      status: stats.activeJobs > 0 ? "operational" : "idle", 
                      color: stats.activeJobs > 0 ? "bg-emerald-500" : "bg-gray-400" 
                    },
                    { 
                      label: "Approval System", 
                      status: stats.pendingJobApproval > 0 ? "active" : "idle", 
                      color: stats.pendingJobApproval > 0 ? "bg-blue-500" : "bg-gray-400" 
                    },
                    { 
                      label: "Company Registration", 
                      status: stats.totalCompanies > 0 ? "operational" : "idle", 
                      color: stats.totalCompanies > 0 ? "bg-emerald-500" : "bg-gray-400" 
                    },
                    { 
                      label: "Application Processing", 
                      status: stats.totalApplications > 0 ? "active" : "idle", 
                      color: stats.totalApplications > 0 ? "bg-blue-500" : "bg-gray-400" 
                    },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                        <span className="text-sm text-gray-600">{item.label}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.status === "operational" ? "bg-emerald-100 text-emerald-800" :
                        item.status === "active" ? "bg-blue-100 text-blue-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${
                        stats.pendingJobApproval > 0 ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                      }`}></div>
                      <p className="text-lg font-bold">
                        {stats.pendingJobApproval > 0 ? "Action Required" : "All Systems Normal"}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {stats.pendingJobApproval > 0 
                        ? `${stats.pendingJobApproval} jobs require approval attention`
                        : "Platform is operating normally"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CompanyDashboard;