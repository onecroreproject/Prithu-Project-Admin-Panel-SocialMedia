// aptitudeAnalitical.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Users,
  BarChart3,
  Download,
  Filter,
  Search,
  Calendar,
  Eye,
  Mail,
  Phone,
  Clock,
  Trophy,
  Award,
  Target,
  Brain,
  Timer,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Star,
  Crown,
  Medal,
  TrendingUp,
  TrendingDown,
  UserCheck,
  UserX,
  Hash,
  Clock4,
  FileText,
  RefreshCw,
  Play,
  Pause,
  AlertCircle,
  User,
  Loader,
  CheckSquare,
  Square
} from 'lucide-react';
import api from '../../Utils/axiosApi';

const AnalyticsPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [testDetails, setTestDetails] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [filters, setFilters] = useState({
    searchQuery: '',
    sortBy: 'score_desc',
    minScore: 0,
    maxScore: 100
  });

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'completed'
  const [viewMode, setViewMode] = useState('candidates');

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    if (!testId) return;

    try {
      setLoading(true);
      const response = await api.get(`/api/analitycal/detail/for/test/${testId}`);
      console.log(response.data)
      if (response.data.success) {
        setTestDetails(response.data.testDetails);
        setAnalyticsData(response.data);

        // Set view mode based on test status
        if (response.data.status === 'completed') {
          setViewMode('ranking');
          setActiveTab('all');
        } else if (response.data.status === 'running') {
          setViewMode('sessions');
          setActiveTab('all');
        } else {
          setViewMode('candidates');
        }
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);

    } finally {
      setLoading(false);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!analyticsData) return;

    let headers, csvData;

    if (analyticsData.status === 'completed' && analyticsData.rankedCandidates) {
      headers = ['Rank', 'Name', 'Email', 'Score', 'Result', 'Certificate ID', 'Time Taken', 'Completed At'];

      csvData = analyticsData.rankedCandidates.map((candidate, index) => [
        index + 1,
        candidate.name || 'N/A',
        candidate.email || 'N/A',
        candidate.score,
        candidate.result || 'N/A',
        candidate.certificateId || 'N/A',
        candidate.timeTaken || 'N/A',
        new Date(candidate.receivedAt).toLocaleString()
      ]);
    } else if (analyticsData.status === 'running') {
      if (activeTab === 'pending' || activeTab === 'all') {
        headers = ['Status', 'Name', 'Email', 'Session Token', 'Started At'];
        const pending = analyticsData.pendingUsers || [];
        csvData = pending.map(user => [
          'Pending',
          user.name || 'N/A',
          user.email || 'N/A',
          user.sessionToken || 'N/A',
          new Date(user.startedAt).toLocaleString()
        ]);
      } else if (activeTab === 'completed') {
        headers = ['Status', 'Name', 'Email', 'Score', 'Result', 'Time Taken', 'Completed At'];
        const completed = analyticsData.completedUsers || [];
        csvData = completed.map(user => [
          'Completed',
          user.name || 'N/A',
          user.email || 'N/A',
          user.score || 'N/A',
          user.result || 'N/A',
          user.timeTaken || 'N/A',
          new Date(user.receivedAt).toLocaleString()
        ]);
      }
    } else if (analyticsData.interestedUsers) {
      headers = ['Name', 'Email', 'First Name', 'Last Name', 'Interested At'];

      csvData = analyticsData.interestedUsers.map(user => [
        user.name || 'N/A',
        user.email || 'N/A',
        user.firstName || '',
        user.lastName || '',
        new Date(user.interestedAt).toLocaleString()
      ]);
    } else {
      alert('No data to export');
      return;
    }

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-analytics-${testId}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  // Get filtered candidates based on status and active tab
  const getFilteredCandidates = () => {
    if (!analyticsData) return [];

    if (analyticsData.status === 'completed' && analyticsData.rankedCandidates) {
      let filtered = [...analyticsData.rankedCandidates];

      // Filter by search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(candidate =>
          candidate.name?.toLowerCase().includes(query) ||
          candidate.email?.toLowerCase().includes(query) ||
          candidate.certificateId?.toLowerCase().includes(query)
        );
      }

      // Filter by score range
      filtered = filtered.filter(candidate =>
        candidate.score >= filters.minScore &&
        candidate.score <= filters.maxScore
      );

      // Sort by selected criteria
      switch (filters.sortBy) {
        case 'score_desc':
          filtered.sort((a, b) => b.score - a.score);
          break;
        case 'score_asc':
          filtered.sort((a, b) => a.score - b.score);
          break;
        case 'name_asc':
          filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          break;
        case 'recent':
          filtered.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));
          break;
      }

      return filtered;
    } else if (analyticsData.status === 'running') {
      let filtered = [];

      // Get data based on active tab
      if (activeTab === 'pending') {
        filtered = [...(analyticsData.pendingUsers || [])];
      } else if (activeTab === 'completed') {
        filtered = [...(analyticsData.completedUsers || [])];
      } else {
        // Combine both for 'all' tab
        const pending = analyticsData.pendingUsers || [];
        const completed = analyticsData.completedUsers || [];
        filtered = [...pending, ...completed];
      }

      // Filter by search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(user =>
          user.name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          (user.sessionToken && user.sessionToken.toLowerCase().includes(query))
        );
      }

      // Sort by startedAt (for pending) or receivedAt (for completed)
      filtered.sort((a, b) => {
        const dateA = a.startedAt || a.receivedAt;
        const dateB = b.startedAt || b.receivedAt;
        return new Date(dateB) - new Date(dateA);
      });

      return filtered;
    } else if (analyticsData.interestedUsers) {
      let filtered = [...analyticsData.interestedUsers];

      // Filter by search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(user =>
          user.name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.firstName?.toLowerCase().includes(query) ||
          user.lastName?.toLowerCase().includes(query)
        );
      }

      // Sort by interested date
      filtered.sort((a, b) => new Date(b.interestedAt) - new Date(a.interestedAt));

      return filtered;
    }

    return [];
  };

  // Calculate statistics
  const calculateStats = () => {
    if (!analyticsData) return null;

    if (analyticsData.status === 'completed' && analyticsData.rankedCandidates) {
      const candidates = analyticsData.rankedCandidates;
      const total = candidates.length;

      if (total === 0) {
        return {
          totalCandidates: 0,
          averageScore: 0,
          passedCount: 0,
          failedCount: 0,
          topScore: 0,
          lowestScore: 0,
          passRate: 0
        };
      }

      const passed = candidates.filter(c => c.result === 'pass').length;
      const failed = candidates.filter(c => c.result === 'fail').length;
      const scores = candidates.map(c => c.score);
      const averageScore = (scores.reduce((a, b) => a + b, 0) / total).toFixed(1);
      const topScore = Math.max(...scores);
      const lowestScore = Math.min(...scores);
      const passRate = ((passed / total) * 100).toFixed(1);

      return {
        totalCandidates: total,
        averageScore,
        passedCount: passed,
        failedCount: failed,
        topScore,
        lowestScore,
        passRate
      };
    } else if (analyticsData.status === 'running') {
      const pending = analyticsData.pendingUsers || [];
      const completed = analyticsData.completedUsers || [];
      const totalSessions = analyticsData.totalSessions || 0;

      // Calculate average score for completed users
      const completedScores = completed.filter(c => c.score).map(c => c.score);
      const averageScore = completedScores.length > 0
        ? (completedScores.reduce((a, b) => a + b, 0) / completedScores.length).toFixed(1)
        : 0;

      const passed = completed.filter(c => c.result === 'pass').length;

      return {
        pendingCount: pending.length,
        completedCount: completed.length,
        totalSessions,
        averageScore,
        passedCount: passed,
        completionRate: totalSessions > 0 ? ((completed.length / totalSessions) * 100).toFixed(1) : 0
      };
    } else if (analyticsData.interestedUsers) {
      return {
        totalInterested: analyticsData.interestedUsers.length,
        interestedCount: analyticsData.interestedCount
      };
    }

    return null;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const styles = {
      upcoming: 'bg-blue-100 text-blue-800',
      running: 'bg-emerald-100 text-emerald-800',
      completed: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format time duration
  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  // Get score background color
  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-emerald-50 border-emerald-100';
    if (score >= 60) return 'bg-blue-50 border-blue-100';
    if (score >= 40) return 'bg-amber-50 border-amber-100';
    return 'bg-red-50 border-red-100';
  };

  // Get rank medal
  const getRankMedal = (rank) => {
    if (rank === 1) return { icon: <Crown className="w-5 h-5 text-yellow-500" />, color: 'bg-yellow-100' };
    if (rank === 2) return { icon: <Medal className="w-5 h-5 text-gray-400" />, color: 'bg-gray-100' };
    if (rank === 3) return { icon: <Medal className="w-5 h-5 text-amber-600" />, color: 'bg-amber-100' };
    return { icon: <Hash className="w-5 h-5 text-gray-500" />, color: 'bg-gray-50' };
  };

  // Get session status badge
  const getSessionStatusBadge = (user) => {
    if (user.score !== undefined) {
      return user.result === 'pass'
        ? <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs">Completed ✓</span>
        : <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Completed ✗</span>;
    }
    return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">In Progress</span>;
  };

  // Fetch data on mount and when testId changes
  useEffect(() => {
    fetchAnalyticsData();
  }, [testId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData || !testDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Data Found</h2>
          <p className="text-gray-600 mb-4">Unable to load analytics for this test</p>
          <button
            onClick={() => navigate('/aptitude/test/management')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Test Management
          </button>
        </div>
      </div>
    );
  }

  const stats = calculateStats();
  const filteredCandidates = getFilteredCandidates();
  const isCompleted = analyticsData.status === 'completed';
  const isRunning = analyticsData.status === 'running';
  const isUpcoming = analyticsData.status === 'upcoming';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/aptitude/test/management')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Test Analytics</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-gray-600">{testDetails.testName}</span>
                  {getStatusBadge(analyticsData.status)}
                  <span className="text-sm text-gray-500">
                    ID: {testId}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">

              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export {isCompleted ? 'Results' : 'List'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Test Details Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Test Information</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Basic Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-900">{testDetails.testName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{testDetails.description || 'No description'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-700 mb-2">Timing & Duration</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">Start: {formatDate(testDetails.startTime)}</span>
                  </div>
                  {testDetails.endTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">End: {formatDate(testDetails.endTime)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">Duration: {testDetails.testDuration} minutes</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-700 mb-2">Test Configuration</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">Questions: {testDetails.totalQuestions}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">Pass Score: {testDetails.totalScore}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {testDetails.isProctored ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-700">Proctored</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">Not Proctored</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {isCompleted ? (
              <>
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Candidates</p>
                      <h3 className="text-3xl font-bold text-gray-900">{stats.totalCandidates}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Users className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm">
                      <UserCheck className="w-4 h-4 text-emerald-500 mr-1" />
                      <span className="text-emerald-600 font-medium">{stats.passedCount} passed</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Average Score</p>
                      <h3 className="text-3xl font-bold text-gray-900">{stats.averageScore}%</h3>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-emerald-500" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm">
                      <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                      <span className="text-emerald-600 font-medium">Pass Rate: {stats.passRate}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Top Score</p>
                      <h3 className="text-3xl font-bold text-emerald-600">{stats.topScore}%</h3>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <Trophy className="w-6 h-6 text-yellow-500" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-gray-600">Highest among {stats.totalCandidates}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Lowest Score</p>
                      <h3 className="text-3xl font-bold text-red-600">{stats.lowestScore}%</h3>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <TrendingDown className="w-6 h-6 text-red-500" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm">
                      <UserX className="w-4 h-4 text-red-500 mr-1" />
                      <span className="text-red-600 font-medium">{stats.failedCount} failed</span>
                    </div>
                  </div>
                </div>
              </>
            ) : isRunning ? (
              <>
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Sessions</p>
                      <h3 className="text-3xl font-bold text-gray-900">{stats.totalSessions}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Users className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm">
                      <Play className="w-4 h-4 text-blue-500 mr-1" />
                      <span className="text-blue-600 font-medium">{stats.pendingCount} in progress</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Completed</p>
                      <h3 className="text-3xl font-bold text-gray-900">{stats.completedCount}</h3>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-lg">
                      <CheckSquare className="w-6 h-6 text-emerald-500" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mr-1" />
                      <span className="text-emerald-600 font-medium">{stats.passedCount} passed</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Average Score</p>
                      <h3 className="text-3xl font-bold text-gray-900">{stats.averageScore}%</h3>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-amber-500" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm">
                      <TrendingUp className="w-4 h-4 text-amber-500 mr-1" />
                      <span className="text-amber-600 font-medium">Completion: {stats.completionRate}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Test Status</p>
                      <h3 className="text-2xl font-bold text-emerald-600">LIVE</h3>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <Play className="w-6 h-6 text-red-500" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 text-gray-500 mr-1" />
                      <span className="text-gray-600">Currently running</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Interested Users</p>
                      <h3 className="text-3xl font-bold text-gray-900">{stats.totalInterested || stats.interestedCount || 0}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Users className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm">
                      <Eye className="w-4 h-4 text-blue-500 mr-1" />
                      <span className="text-blue-600 font-medium">Show interest</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Test Status</p>
                      <h3 className="text-2xl font-bold text-gray-900">{analyticsData.status.charAt(0).toUpperCase() + analyticsData.status.slice(1)}</h3>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-lg">
                      <Clock4 className="w-6 h-6 text-emerald-500" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 text-gray-500 mr-1" />
                      <span className="text-gray-600">
                        {analyticsData.status === 'upcoming' ? 'Starts soon' : 'Currently running'}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Main Analytics Content */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header with Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isCompleted ? 'Ranked Results' :
                    isRunning ? 'Test Sessions' :
                      'Interested Candidates'}
                </h2>
                <p className="text-gray-600">
                  {isCompleted
                    ? `Showing ${filteredCandidates.length} of ${analyticsData.totalCandidates || analyticsData.rankedCandidates?.length || 0} candidates`
                    : isRunning
                      ? `Showing ${filteredCandidates.length} of ${analyticsData.totalSessions || 0} sessions`
                      : `Showing ${filteredCandidates.length} of ${analyticsData.interestedCount || analyticsData.interestedUsers?.length || 0} interested users`
                  }
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder={isCompleted ? "Search candidates..." : isRunning ? "Search users..." : "Search users..."}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.searchQuery}
                    onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                  />
                </div>

                {isCompleted && (
                  <select
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    <option value="score_desc">Top Scores First</option>
                    <option value="score_asc">Lowest Scores First</option>
                    <option value="name_asc">Name (A-Z)</option>
                    <option value="recent">Most Recent</option>
                  </select>
                )}
              </div>
            </div>

            {/* Tabs for Running Tests */}
            {isRunning && (
              <div className="flex space-x-4 mt-4">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  All Sessions ({analyticsData.totalSessions || 0})
                </button>
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'pending'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  In Progress ({analyticsData.pendingCount || 0})
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'completed'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Completed ({analyticsData.completedCount || 0})
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {filteredCandidates.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {isCompleted && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>}
                    {isRunning && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isCompleted ? 'Performance' :
                        isRunning ? 'Session Info' :
                          'Interest Info'}
                    </th>
                    {isCompleted && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certificate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      </>
                    )}
                    {isRunning && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started</th>
                      </>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isRunning ? 'Last Activity' : 'Date'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCandidates.map((item, index) => (
                    <tr key={item.userId || index} className="hover:bg-gray-50 transition-colors">
                      {/* Rank Column (Completed tests only) */}
                      {isCompleted && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRankMedal(index + 1).color}`}>
                              {getRankMedal(index + 1).icon}
                            </div>
                            <span className="font-semibold text-gray-900">#{index + 1}</span>
                          </div>
                        </td>
                      )}

                      {/* Status Column (Running tests only) */}
                      {isRunning && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getSessionStatusBadge(item)}
                        </td>
                      )}

                      {/* User Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {item.avatar ? (
                              <img
                                src={item.avatar}
                                alt={item.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-semibold">
                                  {(item.name || item.email || 'U').charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {item.name || item.firstName
                                ? `${item.firstName || ''} ${item.lastName || ''}`.trim()
                                : item.email?.split('@')[0] || 'Unknown User'
                              }
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {item.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Performance/Interest Column */}
                      <td className="px-6 py-4">
                        {isCompleted ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div className={`px-3 py-1 rounded-full border ${getScoreBgColor(item.score)}`}>
                                <span className={`text-sm font-bold ${getScoreColor(item.score)}`}>
                                  {item.score}%
                                </span>
                              </div>
                              {item.score >= testDetails.totalScore ? (
                                <div className="flex items-center gap-1 text-emerald-600">
                                  <TrendingUp className="w-4 h-4" />
                                  <span className="text-sm font-medium">Passed</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-red-600">
                                  <TrendingDown className="w-4 h-4" />
                                  <span className="text-sm font-medium">Failed</span>
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              Pass mark: {testDetails.totalScore}%
                            </div>
                          </div>
                        ) : isRunning ? (
                          <div className="flex items-center gap-3">
                            {item.sessionToken ? (
                              <div className="flex flex-col">
                                <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                                  {item.sessionToken.substring(0, 8)}...
                                </span>
                                <span className="text-xs text-gray-500 mt-1">
                                  Session Active
                                </span>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-600">
                                Session completed
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <UserCheck className="w-4 h-4 text-blue-500" />
                              <span>Expressed interest</span>
                            </div>
                            {item.firstName && (
                              <div className="text-sm text-gray-500">
                                {item.firstName} {item.lastName}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Result Column (Completed tests only) */}
                      {isCompleted && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.result === 'pass'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                              }`}>
                              {item.result === 'pass' ? (
                                <span className="flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Pass
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <XCircle className="w-3 h-3" />
                                  Fail
                                </span>
                              )}
                            </span>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {item.certificateId ? (
                                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                                  {item.certificateId}
                                </span>
                              ) : (
                                'No certificate'
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {formatDuration(item.timeTaken)}
                              </span>
                            </div>
                          </td>
                        </>
                      )}

                      {/* Score Column (Running tests - completed users only) */}
                      {isRunning && item.score !== undefined && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`px-3 py-1 rounded-full border ${getScoreBgColor(item.score)}`}>
                            <span className={`text-sm font-bold ${getScoreColor(item.score)}`}>
                              {item.score}%
                            </span>
                          </div>
                        </td>
                      )}

                      {isRunning && item.score === undefined && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500">In progress</span>
                        </td>
                      )}

                      {/* Started At Column (Running tests) */}
                      {isRunning && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {formatDate(item.startedAt)}
                            </span>
                          </div>
                        </td>
                      )}

                      {/* Date Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {formatDate(item.receivedAt || item.interestedAt || item.startedAt)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {isCompleted ? (
                    <Trophy className="w-8 h-8 text-gray-400" />
                  ) : isRunning ? (
                    <Users className="w-8 h-8 text-gray-400" />
                  ) : (
                    <Users className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isCompleted ? 'No results found' :
                    isRunning ? 'No sessions found' :
                      'No interested users found'}
                </h3>
                <p className="text-gray-500">
                  {filters.searchQuery
                    ? `No ${isCompleted ? 'candidates' : isRunning ? 'sessions' : 'users'} match "${filters.searchQuery}"`
                    : isCompleted
                      ? 'No candidates have taken this test yet'
                      : isRunning
                        ? 'No sessions found for this test'
                        : 'No users have shown interest in this test yet'
                  }
                </p>
                {filters.searchQuery && (
                  <button
                    onClick={() => handleFilterChange('searchQuery', '')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination (Optional - add if needed) */}
          {filteredCandidates.length > 0 && filteredCandidates.length > 10 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing 1 to 10 of {filteredCandidates.length} results
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm">Previous</button>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm bg-blue-600 text-white">1</button>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm">Next</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test Instructions */}
          {testDetails.instructions && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Instructions</h3>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-700">
                  {testDetails.instructions}
                </pre>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={exportToCSV}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Download {isCompleted ? 'Results' : 'List'} as CSV</span>
                </div>
                <ChevronUp className="w-5 h-5 text-gray-400" />
              </button>

              <button
                onClick={() => window.open(`/aptitude/test/management`, '_blank')}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">View Test Details</span>
                </div>
                <ChevronUp className="w-5 h-5 text-gray-400" />
              </button>

              <button
                onClick={() => navigate('/aptitude/dashboard')}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Back to Aptitude Dashboard</span>
                </div>
                <ChevronUp className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;