import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Brain,
  Users,
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  BarChart,
  PlusCircle,
  Download,
  Eye,
  Filter,
  Calendar,
  Award,
  Target,
  AlertCircle,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Server,
  Database,
  Activity
} from "lucide-react";
import axios from "../../Utils/axiosApi";

const AptitudeDashboard = () => {
  const [stats, setStats] = useState({
    totalTests: 0,
    activeTests: 0,
    totalCandidates: 0,
    avgScore: 0,
    pendingEvaluations: 0,
    completionRate: 0
  });

  const [recentTests, setRecentTests] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [upcomingTests, setUpcomingTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");

  const [quickActions] = useState([
    { icon: <PlusCircle className="w-5 h-5" />, label: "Create New Test", path: "/aptitude/tests/create", color: "bg-blue-500" },
    { icon: <Users className="w-5 h-5" />, label: "Add Candidates", path: "/aptitude/candidates/add", color: "bg-green-500" },
    { icon: <FileText className="w-5 h-5" />, label: "Add Questions", path: "/aptitude/questions/add", color: "bg-purple-500" },
    { icon: <BarChart className="w-5 h-5" />, label: "Generate Report", path: "/aptitude/results/reports", color: "bg-amber-500" },
  ]);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats
      const statsResponse = await axios.get(`/api/aptitude/dashboard/stats`);
      console.log("Dashboard Stats:", statsResponse.data);
      setStats(statsResponse.data);

      // Fetch recent tests
      const testsResponse = await axios.get(`/api/aptitude/tests/recent`);
      console.log("Recent Tests:", testsResponse.data);
      setRecentTests(testsResponse.data || []);

      // Fetch top performers
      const performersResponse = await axios.get(`/api/aptitude/results/top-performers`);
      console.log("Top Performers:", performersResponse.data);
      setTopPerformers(performersResponse.data || []);

      // Fetch upcoming tests
      const upcomingResponse = await axios.get(`/api/aptitude/tests/upcoming`);
      console.log("Upcoming Tests:", upcomingResponse.data);
      setUpcomingTests(upcomingResponse.data || []);

      // Fetch system status
      const statusResponse = await axios.get(`/api/aptitude/system/status`);
      console.log("System Status:", statusResponse.data);
      setSystemStatus(statusResponse.data);

      // Update last updated time
      setLastUpdated(new Date().toLocaleTimeString());

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Clear data and show not available
      resetDataToNotAvailable();
    } finally {
      setLoading(false);
    }
  };

  // Reset all data to "not available" state
  const resetDataToNotAvailable = () => {
    setStats({
      totalTests: 0,
      activeTests: 0,
      totalCandidates: 0,
      avgScore: 0,
      pendingEvaluations: 0,
      completionRate: 0
    });
    setRecentTests([]);
    setTopPerformers([]);
    setUpcomingTests([]);
    setSystemStatus(null);
    setLastUpdated("Not available");
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Format system uptime
  const formatUptime = (seconds) => {
    if (!seconds) return "N/A";

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'connected':
      case 'online':
      case 'operational':
        return 'text-green-600 dark:text-green-400';
      case 'degraded':
      case 'connecting':
      case 'medium':
        return 'text-amber-600 dark:text-amber-400';
      case 'down':
      case 'disconnected':
      case 'offline':
      case 'idle':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Get status dot color
  const getStatusDotColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'connected':
      case 'online':
      case 'operational':
        return 'bg-green-500';
      case 'degraded':
      case 'connecting':
      case 'medium':
        return 'bg-amber-500';
      case 'down':
      case 'disconnected':
      case 'offline':
      case 'idle':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Handle test action
  const handleTestAction = async (testId, action) => {
    try {
      switch (action) {
        case 'view':
          window.location.href = `/aptitude/tests/${testId}`;
          break;
        case 'download':
          const response = await axios.get(`/api/aptitude/tests/${testId}/export`, {
            responseType: 'blob'
          });
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `test-${testId}-results.csv`);
          document.body.appendChild(link);
          link.click();
          break;
        case 'analytics':
          window.location.href = `/aptitude/tests/${testId}/analytics`;
          break;
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      alert(`Failed to ${action} test. Please try again.`);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Aptitude Assessment Dashboard</h1>
            <p className="text-indigo-100 mt-2">Manage tests, monitor candidates, and analyze performance</p>
          </div>
          <div className="flex items-center gap-3">

            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <p className="text-sm">Last Updated: {lastUpdated || "Not available"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalTests > 0 ? stats.totalTests : "0"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 dark:text-green-400">
              {stats.totalTests > 0 ? `+${Math.floor(stats.totalTests * 0.08)} this month` : "No data"}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Tests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.activeTests > 0 ? stats.activeTests : "0"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${stats.totalTests > 0 ? (stats.activeTests / stats.totalTests) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Candidates</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalCandidates > 0 ? stats.totalCandidates.toLocaleString() : "0"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 dark:text-green-400">
              {stats.totalCandidates > 0 ? "+5.2% from last month" : "No candidates"}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.avgScore > 0 ? `${stats.avgScore.toFixed(1)}%` : "0%"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Target className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {stats.avgScore > 0 ? (
              <>
                <ChevronUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 dark:text-green-400">+3.2% improvement</span>
              </>
            ) : (
              <span className="text-gray-500">No scores yet</span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Evaluation</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.pendingEvaluations > 0 ? stats.pendingEvaluations : "0"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/aptitude/results" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              {stats.pendingEvaluations > 0 ? "Review now →" : "No pending evaluations"}
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.completionRate > 0 ? `${stats.completionRate}%` : "0%"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${stats.completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Tests & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Tests */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Tests</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Latest assessment activities</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Filter className="w-4 h-4 text-gray-500" />
                </button>
                <Link
                  to="/aptitude/tests"
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              {recentTests.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700/50">
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">Test Name</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">Candidates</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Score</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {recentTests.map((test) => (
                      <tr key={test._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                              <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {test.name || "No Test Submitted"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {test.date ? formatDate(test.date) : "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {test.candidates || "0"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${test.avgScore >= 80 ? 'text-green-600 dark:text-green-400' :
                                test.avgScore >= 70 ? 'text-amber-600 dark:text-amber-400' :
                                  'text-red-600 dark:text-red-400'
                              }`}>
                              {test.avgScore > 0 ? `${test.avgScore}%` : "N/A"}
                            </span>
                            {test.avgScore >= 80 ? (
                              <ChevronUp className="w-4 h-4 text-green-500" />
                            ) : test.avgScore >= 70 ? (
                              <span className="text-amber-500">→</span>
                            ) : test.avgScore > 0 ? (
                              <ChevronDown className="w-4 h-4 text-red-500" />
                            ) : null}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${test.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              test.status === 'completed'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                            {test.status === 'pending' ? 'Pending' :
                              test.status === 'completed' ? 'Completed' : 'Unknown'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => test._id && handleTestAction(test._id, 'view')}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                              title="View Details"
                              disabled={!test._id}
                            >
                              <Eye className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                              onClick={() => test._id && handleTestAction(test._id, 'download')}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                              title="Download Results"
                              disabled={!test._id}
                            >
                              <Download className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                              onClick={() => test._id && handleTestAction(test._id, 'analytics')}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                              title="View Analytics"
                              disabled={!test._id}
                            >
                              <BarChart className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No recent tests available</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Tests will appear here once created</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column - Top Performers & System Status */}
        <div className="space-y-6">
          {/* Top Performers */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Performers</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Best scoring candidates</p>
                </div>
                <Award className="w-5 h-5 text-amber-500" />
              </div>
            </div>
            <div className="p-4">
              {topPerformers.length > 0 ? (
                <>
                  {topPerformers.map((candidate, index) => (
                    <div key={candidate.userId || index} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg transition-colors mb-2">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                              {candidate.name?.charAt(0) || candidate.userName?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{candidate.rank || index + 1}</span>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {candidate.name || candidate.userName || 'Unknown User'}
                            {candidate.lastName ? ` ${candidate.lastName}` : ''}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                            {candidate.email || 'No email'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {candidate.averageScore ? `${candidate.averageScore.toFixed(1)}%` : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {candidate.totalTests || 0} tests
                        </p>
                      </div>
                    </div>
                  ))}
                  <Link
                    to="/aptitude/results"
                    className="block mt-4 text-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                  >
                    View All Results →
                  </Link>
                </>
              ) : (
                <div className="p-4 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No performers data available</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Results will appear here once tests are completed</p>
                </div>
              )}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/10 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center">
                <Server className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">System Status</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Assessment platform health</p>
              </div>
            </div>

            {systemStatus ? (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Database
                    </span>
                    <span className={`flex items-center gap-1 ${getStatusColor(systemStatus.database?.status)}`}>
                      <div className={`w-2 h-2 rounded-full ${getStatusDotColor(systemStatus.database?.status)}`}></div>
                      {systemStatus.database?.status || 'Unknown'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Test Engine
                    </span>
                    <span className={`flex items-center gap-1 ${getStatusColor(systemStatus.testEngine?.status)}`}>
                      <div className={`w-2 h-2 rounded-full ${getStatusDotColor(systemStatus.testEngine?.status)}`}></div>
                      {systemStatus.testEngine?.status || 'Unknown'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      External Server
                    </span>
                    <span className={`flex items-center gap-1 ${getStatusColor(systemStatus.externalExamServer?.status)}`}>
                      <div className={`w-2 h-2 rounded-full ${getStatusDotColor(systemStatus.externalExamServer?.status)}`}></div>
                      {systemStatus.externalExamServer?.status || 'Unknown'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Server Uptime</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {systemStatus.server?.uptimeSeconds ? formatUptime(systemStatus.server.uptimeSeconds) : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Overall Status</span>
                    <span className={`font-medium ${getStatusColor(systemStatus.overallSystem?.status)}`}>
                      {systemStatus.overallSystem?.status ? systemStatus.overallSystem.status.toUpperCase() : 'UNKNOWN'}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <Server className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">System status unavailable</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Check server connection</p>
              </div>
            )}
          </div>


        </div>
      </div>
    </div>
  );
};

export default AptitudeDashboard;