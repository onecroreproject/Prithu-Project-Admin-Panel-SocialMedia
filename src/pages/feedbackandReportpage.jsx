import React, { useState, useEffect, useMemo } from 'react';
import axios from '../Utils/axiosApi';
import toast, { Toaster } from 'react-hot-toast';
import {
  Search,
  Filter,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  FileText,
  Briefcase,
  Award,
  CreditCard,
  Bell,
  Mail,
  Monitor,
  X,
  ChevronDown,
  ChevronUp,
  Edit,
  Save,
  Trash2,
  Eye,
  Download,
  BarChart,
  TrendingUp,
  Users,
  Shield,
  RefreshCw,
  MoreVertical
} from 'lucide-react';

const AdminFeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_review: 0,
    resolved: 0,
    rejected: 0,
    feedback: 0,
    report: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    section: '',
    type: '',
    status: '',
    category: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [editingNote, setEditingNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedRows, setExpandedRows] = useState(new Set());

  const sections = [
    { value: 'post', label: 'Post', icon: <FileText className="w-4 h-4" /> },
    { value: 'comment', label: 'Comment', icon: <MessageSquare className="w-4 h-4" /> },
    { value: 'job', label: 'Job', icon: <Briefcase className="w-4 h-4" /> },
    { value: 'aptitude_test', label: 'Aptitude Test', icon: <Award className="w-4 h-4" /> },
    { value: 'portfolio', label: 'Portfolio', icon: <User className="w-4 h-4" /> },
    { value: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { value: 'help', label: 'Help Center', icon: <MessageSquare className="w-4 h-4" /> },
    { value: 'referral', label: 'Referral', icon: <CreditCard className="w-4 h-4" /> },
    { value: 'notification', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { value: 'app', label: 'App/Website', icon: <Monitor className="w-4 h-4" /> },
    { value: 'other', label: 'Other', icon: <MessageSquare className="w-4 h-4" /> }
  ];

  const categories = [
    { value: 'bug', label: 'Bug', color: 'bg-red-100 text-red-800' },
    { value: 'spam', label: 'Spam', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'abuse', label: 'Abuse', color: 'bg-red-100 text-red-800' },
    { value: 'harassment', label: 'Harassment', color: 'bg-red-100 text-red-800' },
    { value: 'misinformation', label: 'Misinformation', color: 'bg-orange-100 text-orange-800' },
    { value: 'feature_request', label: 'Feature Request', color: 'bg-blue-100 text-blue-800' },
    { value: 'performance', label: 'Performance', color: 'bg-purple-100 text-purple-800' },
    { value: 'ui_ux', label: 'UI/UX', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" /> },
    { value: 'in_review', label: 'In Review', color: 'bg-blue-100 text-blue-800', icon: <Eye className="w-4 h-4" /> },
    { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800', icon: <X className="w-4 h-4" /> }
  ];

  const typeOptions = [
    { value: 'feedback', label: 'Feedback', color: 'bg-blue-100 text-blue-800', icon: <MessageSquare className="w-4 h-4" /> },
    { value: 'report', label: 'Report', color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="w-4 h-4" /> }
  ];

  useEffect(() => {
    fetchFeedbacks();
  }, [filters, currentPage]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page: currentPage,
        limit: 20
      };

      const response = await axios.get('/api/admin/feedback', { params });
      setFeedbacks(response.data.data);
      setTotalPages(Math.ceil(response.data.total / 20));
      
      // Calculate stats from current data
      calculateStats(response.data.data);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const newStats = {
      total: data.length,
      pending: 0,
      in_review: 0,
      resolved: 0,
      rejected: 0,
      feedback: 0,
      report: 0
    };

    data.forEach(item => {
      newStats[item.status]++;
      newStats[item.type]++;
    });

    setStats(newStats);
  };

  const handleStatusUpdate = async (id, status) => {
    setUpdating(true);
    try {
      const payload = { status };
      if (editingNote) {
        payload.adminNote = editingNote;
      }

      await axios.put(`/api/admin/feedback/${id}`, payload);
      
      // Update local state
      setFeedbacks(prev => prev.map(item => 
        item._id === id ? { ...item, status, adminNote: editingNote || item.adminNote } : item
      ));
      
      setEditingNote('');
      setSelectedFeedback(null);
      
      // Refresh stats
      fetchFeedbacks();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      section: '',
      type: '',
      status: '',
      category: ''
    });
    setCurrentPage(1);
  };

  const toggleRowExpand = (id) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getSectionIcon = (sectionValue) => {
    const section = sections.find(s => s.value === sectionValue);
    return section?.icon || <MessageSquare className="w-4 h-4" />;
  };

  const getCategoryColor = (categoryValue) => {
    const category = categories.find(c => c.value === categoryValue);
    return category?.color || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportData = () => {
    const csvData = feedbacks.map(item => ({
      ID: item._id,
      Type: item.type,
      Section: item.section,
      Category: item.category,
      Title: item.title || 'N/A',
      Status: item.status,
      'Submitted By': item.userId?.userName || 'Guest',
      Email: item.userId?.email || 'N/A',
      Message: item.message.replace(/,/g, ';'),
      'Admin Note': item.adminNote || 'N/A',
      'Created At': new Date(item.createdAt).toLocaleString(),
      Platform: item.platform || 'N/A',
      Device: item.device || 'N/A'
    }));

    const headers = Object.keys(csvData[0] || {});
    const csv = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Feedback & Reports Management</h1>
              <p className="text-gray-600 mt-1">Manage user feedback and reports</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={fetchFeedbacks}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <BarChart className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Review</p>
                <p className="text-2xl font-bold text-blue-600">{stats.in_review}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <X className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Feedback</p>
                <p className="text-2xl font-bold text-blue-600">{stats.feedback}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reports</p>
                <p className="text-2xl font-bold text-red-600">{stats.report}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search by title or message..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              Filters
              {Object.values(filters).filter(f => f).length > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {Object.values(filters).filter(f => f).length}
                </span>
              )}
            </button>

            {/* Clear Filters */}
            {Object.values(filters).some(f => f) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Type Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="">All Types</option>
                    {typeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Section Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Section</label>
                  <select
                    value={filters.section}
                    onChange={(e) => handleFilterChange('section', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="">All Sections</option>
                    {sections.map(section => (
                      <option key={section.value} value={section.value}>
                        {section.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="">All Status</option>
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Time Range</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>All time</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feedback Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section & Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : feedbacks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No feedback found</p>
                      {Object.values(filters).some(f => f) && (
                        <button
                          onClick={clearFilters}
                          className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Clear filters to see all feedback
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  feedbacks.map((item) => (
                    <React.Fragment key={item._id}>
                      <tr className="hover:bg-gray-50">
                        {/* Details Column */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              item.type === 'feedback' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
                            }`}>
                              {item.type === 'feedback' ? (
                                <MessageSquare className="w-5 h-5" />
                              ) : (
                                <AlertTriangle className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 text-sm">
                                {item.title || 'No Title'}
                              </div>
                              <div className="text-gray-500 text-xs mt-1 truncate max-w-xs">
                                {item.message}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* User Column */}
                        <td className="px-6 py-4">
                          {item.userId ? (
                            <div>
                              <div className="font-medium text-gray-900 text-sm">
                                {item.userId.userName}
                              </div>
                              <div className="text-gray-500 text-xs">
                                {item.userId.email}
                              </div>
                              <div className="text-gray-400 text-xs mt-1">
                                {item.platform}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">Guest</span>
                          )}
                        </td>

                        {/* Section & Category */}
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {getSectionIcon(item.section)}
                              <span className="text-sm text-gray-900 capitalize">
                                {item.section.replace('_', ' ')}
                              </span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                              {item.category.replace('_', ' ')}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusUpdate(item._id, e.target.value)}
                            className={`px-3 py-1.5 rounded text-sm font-medium border-0 focus:ring-2 focus:ring-blue-500 ${
                              statusOptions.find(s => s.value === item.status)?.color || 'bg-gray-100'
                            }`}
                          >
                            {statusOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {formatDate(item.createdAt)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.device?.substring(0, 30)}...
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleRowExpand(item._id)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                            >
                              {expandedRows.has(item._id) ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedFeedback(item);
                                setEditingNote(item.adminNote || '');
                              }}
                              className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Row */}
                      {expandedRows.has(item._id) && (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Message Details */}
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Full Message</h4>
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                  <p className="text-gray-700 whitespace-pre-line">{item.message}</p>
                                </div>
                                {item.adminNote && (
                                  <div className="mt-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Admin Note</h4>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                      <p className="text-gray-700">{item.adminNote}</p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Metadata */}
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Metadata</h4>
                                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                                  <div>
                                    <span className="text-xs text-gray-500">IP Address:</span>
                                    <p className="text-sm text-gray-900">{item.ipAddress || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500">Device:</span>
                                    <p className="text-sm text-gray-900">{item.device || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500">Platform:</span>
                                    <p className="text-sm text-gray-900">{item.platform || 'N/A'}</p>
                                  </div>
                                  {item.entityId && (
                                    <div>
                                      <span className="text-xs text-gray-500">Related Entity:</span>
                                      <p className="text-sm text-gray-900">
                                        {item.entityType}: {item.entityId.toString().substring(0, 8)}...
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Quick Actions */}
                                <div className="mt-4">
                                  <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {statusOptions.map(status => (
                                      <button
                                        key={status.value}
                                        onClick={() => handleStatusUpdate(item._id, status.value)}
                                        disabled={updating}
                                        className={`px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1 ${
                                          status.color
                                        } ${updating ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                                      >
                                        {status.icon}
                                        {status.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {feedbacks.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * 20 + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * 20, stats.total)}</span> of{' '}
                <span className="font-medium">{stats.total}</span> results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Note Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Admin Note</h3>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-900 mb-1">
                <span className="font-medium">User:</span> {selectedFeedback.userId?.userName || 'Guest'}
              </p>
              <p className="text-sm text-gray-900 mb-1">
                <span className="font-medium">Type:</span> {selectedFeedback.type}
              </p>
              <p className="text-sm text-gray-900">
                <span className="font-medium">Message:</span> {selectedFeedback.message.substring(0, 100)}...
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Admin Note
              </label>
              <textarea
                value={editingNote}
                onChange={(e) => setEditingNote(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Add your response or notes here..."
              />
              <p className="text-xs text-gray-500 mt-1">
                This note will be visible to the user
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedFeedback(null)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedFeedback._id, selectedFeedback.status)}
                disabled={updating}
                className={`px-4 py-2 text-sm text-white rounded-lg ${
                  updating ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {updating ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </span>
                ) : (
                  'Save Note'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
};

export default AdminFeedbackPage;
