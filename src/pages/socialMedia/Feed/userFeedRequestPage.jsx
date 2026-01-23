import React, { useState, useEffect, useCallback } from 'react';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../Utils/axiosApi';
import {
  FaSearch,
  FaFilter,
  FaSort,
  FaCalendarAlt,
  FaTimes,
  FaSync,
  FaCheckCircle,
  FaEye,
  FaTrash,
  FaBan,
  FaEdit,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaFileAlt,
  FaTags,
  FaClock,
  FaCheck,
  FaTimesCircle,
  FaExclamationTriangle,
  FaImage,
  FaGlobe,
  FaVenusMars,
  FaUserCheck,
  FaUserTimes,
  FaUserClock,
  FaBuilding
} from 'react-icons/fa';





// API Service using Axios
const userPostService = {
  // Get users willing to post
  getUsersWillingToPost: async (params) => {
    try {
      // Clean params - remove undefined/null/empty values
      const cleanParams = {};
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '' && params[key] !== null) {
          cleanParams[key] = params[key];
        }
      });

      const response = await api.get('/api/user/list/willingtopost', {
        params: cleanParams,
        paramsSerializer: {
          indexes: null // Better handling of array parameters
        }
      });

   console.log(response.data)
      
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error.response?.data || error;
    }
  },
  
  // Update user post permission status
  updateUserPostStatus: async (userId, allowToPost) => {
    try {
      const response = await api.put(`/api/update/user/post/status/${userId}`, {
        allowToPost
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error.response?.data || error;
    }
  },
  

};

const UsersWillingToPost = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);
  const navigate = useNavigate();

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    allowToPost: '',
    country: '',
    city: '',
    gender: '',
    isPublished: ''
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Available filters data
  const [availableFilters, setAvailableFilters] = useState({
    accountTypes: ['free', 'premium', 'enterprise'],
    countries: [],
    cities: [],
    genders: ['male', 'female', 'other'],
    postStatuses: ['allow', 'interest', 'notallow'],
    publishStatus: ['true', 'false']
  });

  // Modal states
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  // Preview modal
  const [showPreview, setShowPreview] = useState(false);
  const [previewUser, setPreviewUser] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch users willing to post
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        search: searchTerm || undefined,
        accountType: filters.accountType || undefined,
        allowToPost: filters.allowToPost || undefined,
        country: filters.country || undefined,
        city: filters.city || undefined,
        gender: filters.gender || undefined,
        isPublished: filters.isPublished || undefined,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: itemsPerPage
      };

      const response = await userPostService.getUsersWillingToPost(params);
      
      if (response.success) {
        setUsers(response.users || []);
        setFilteredUsers(response.users || []);
        setTotalUsers(response.total || 0);
        
        // Extract unique values for filters
        extractFilterOptions(response.users || []);
      } else {
        setError(response.message || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters, sortBy, sortOrder, currentPage, itemsPerPage]);

  // Extract unique values for filter dropdowns
  const extractFilterOptions = (data) => {
    const countries = new Set();
    const cities = new Set();
    
    data.forEach(user => {
      if (user.profile?.country) {
        countries.add(user.profile.country);
      }
      if (user.profile?.city) {
        cities.add(user.profile.city);
      }
    });

    setAvailableFilters(prev => ({
      ...prev,
      countries: Array.from(countries).sort(),
      cities: Array.from(cities).sort()
    }));
  };

  // Debounce search
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchUsers();
      }
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  // Fetch when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchUsers();
    }
  }, [filters, sortBy, sortOrder]);

  // Fetch when page changes
  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Handle sort change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      accountType: '',
      allowToPost: '',
      country: '',
      city: '',
      gender: '',
      isPublished: ''
    });
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate time since last active
  const getTimeSince = (dateString) => {
    if (!dateString) return 'Never';
    
    const now = new Date();
    const lastActive = new Date(dateString);
    const diffInMinutes = Math.floor((now - lastActive) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  };

  // Action handlers
  const handleViewProfile = (user) => {
    setPreviewUser(user);
    setShowPreview(true);
  };

  const handleUpdateStatus = (user, status) => {
    setSelectedUser(user);
    setNewStatus(status);
    setShowStatusModal(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmUpdateStatus = async () => {
    if (!selectedUser || !newStatus) return;
    
    try {
      const response = await userPostService.updateUserPostStatus(selectedUser._id, newStatus);
      
      if (response.success) {
        // Update user in state
        setUsers(prev => prev.map(user => 
          user._id === selectedUser._id ? { ...user, allowToPost: newStatus } : user
        ));
        setFilteredUsers(prev => prev.map(user => 
          user._id === selectedUser._id ? { ...user, allowToPost: newStatus } : user
        ));
        
        setSuccessMessage(`Successfully updated ${selectedUser.userName}'s post permission to ${newStatus}`);
        setShowStatusModal(false);
        setSelectedUser(null);
        setNewStatus('');
      } else {
        setError(response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      setError(error.message || 'Failed to update user status');
    }
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await userPostService.deleteUser(selectedUser._id);
      
      if (response.success) {
        // Remove user from state
        setUsers(prev => prev.filter(user => user._id !== selectedUser._id));
        setFilteredUsers(prev => prev.filter(user => user._id !== selectedUser._id));
        
        setSuccessMessage(`Successfully deleted user ${selectedUser.userName}`);
        setShowDeleteModal(false);
        setSelectedUser(null);
        setTotalUsers(prev => prev - 1);
      } else {
        setError(response.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error.message || 'Failed to delete user');
    }
  };

  // Post status badge
  const getPostStatusBadge = (status) => {
    switch (status) {
      case 'allow':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center w-fit">
            <FaUserCheck className="mr-1" /> Allowed to Post
          </span>
        );
      case 'interest':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full flex items-center w-fit">
            <FaUserClock className="mr-1" /> Interested
          </span>
        );
      case 'notallow':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full flex items-center w-fit">
            <FaUserTimes className="mr-1" /> Not Allowed
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
            Unknown
          </span>
        );
    }
  };

  // Account type badge
  const getAccountTypeBadge = (type) => {
    const colors = {
      premium: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-indigo-100 text-indigo-800',
      free: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
        {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Free'}
      </span>
    );
  };

  // Subscription badge
  const getSubscriptionBadge = (subscription) => {
    return subscription?.isActive ? (
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
        <FaCheckCircle className="mr-1" /> Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
        Inactive
      </span>
    );
  };

  // Loading state
  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Users Willing to Post
              </h1>
              <p className="text-gray-600">
                {totalUsers} {totalUsers === 1 ? 'user' : 'users'} interested in posting content
              </p>
            </div>
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Count Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaUser className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaUserCheck className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Allowed to Post</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => user.allowToPost === 'allow').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaUserClock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Interested</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => user.allowToPost === 'interest').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaUserTimes className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Not Allowed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => user.allowToPost === 'notallow').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaCheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError('')}
                  className="text-red-700 hover:text-red-900"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search users by name, email or username..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div className="lg:col-span-8">
              <div className="flex flex-wrap gap-3">
                <select
                  value={filters.accountType}
                  onChange={(e) => handleFilterChange('accountType', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">All Account Types</option>
                  {availableFilters.accountTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.allowToPost}
                  onChange={(e) => handleFilterChange('allowToPost', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">All Post Status</option>
                  {availableFilters.postStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">All Countries</option>
                  {availableFilters.countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.isPublished}
                  onChange={(e) => handleFilterChange('isPublished', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Profile Status</option>
                  <option value="true">Published</option>
                  <option value="false">Not Published</option>
                </select>

                <button
                  onClick={resetFilters}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center disabled:opacity-50"
                >
                  <FaTimes className="mr-2" />
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div className="mt-4 flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <button
              onClick={() => handleSortChange('createdAt')}
              disabled={loading}
              className={`px-3 py-1 text-sm rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${
                sortBy === 'createdAt'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaCalendarAlt className="inline mr-1" />
              Newest {sortBy === 'createdAt' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button
              onClick={() => handleSortChange('lastActiveAt')}
              disabled={loading}
              className={`px-3 py-1 text-sm rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${
                sortBy === 'lastActiveAt'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Last Active {sortBy === 'lastActiveAt' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading && currentPage > 1 ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Loading more users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FaUser className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || Object.values(filters).some(f => f)
                  ? "Try adjusting your search or filters"
                  : "No users are currently willing to post"}
              </p>
              {(searchTerm || Object.values(filters).some(f => f)) && (
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User Profile
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact & Location
                      </th>
                      {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account Details
                      </th> */}
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Post Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Activity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        {/* User Profile */}
                        <td className="px-6 py-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              {user.profile?.profileAvatar ? (
                                <img
                                  className="h-12 w-12 rounded-full object-cover"
                                  src={user.profile.profileAvatar}
                                  alt={user.userName}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/48';
                                  }}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                  <FaUser className="text-blue-600 text-lg" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {user.profile?.name || 'N/A'} {user.profile?.lastName || ''}
                              </div>
                              <div className="text-sm text-gray-500">
                                @{user.userName}
                              </div>
                              {user.profile?.gender && (
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <FaVenusMars className="mr-1" />
                                  {user.profile.gender.charAt(0).toUpperCase() + user.profile.gender.slice(1)}
                                </div>
                              )}
                              {user.profile?.isPublished !== undefined && (
                                <div className="text-xs mt-1">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded ${user.profile.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {user.profile.isPublished ? 'Published' : 'Not Published'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Contact & Location */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            <div className="text-sm text-gray-900">
                              <div className="flex items-center">
                                <FaEnvelope className="mr-2 text-gray-400" />
                                {user.email}
                              </div>
                            </div>
                            {user.profile?.phoneNumber && (
                              <div className="text-sm text-gray-500">
                                <div className="flex items-center">
                                  <FaPhone className="mr-2 text-gray-400" />
                                  {user.profile.phoneNumber}
                                </div>
                              </div>
                            )}
                            {(user.profile?.city || user.profile?.country) && (
                              <div className="text-sm text-gray-500">
                                <div className="flex items-center">
                                  <FaGlobe className="mr-2 text-gray-400" />
                                  {user.profile.city && <span>{user.profile.city}</span>}
                                  {user.profile.city && user.profile.country && <span>, </span>}
                                  {user.profile.country && <span>{user.profile.country}</span>}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Account Details */}
                        {/* <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            <div>{getAccountTypeBadge(user.accountType)}</div>
                            <div>{getSubscriptionBadge(user.subscription)}</div>
                            {user.roles && user.roles.length > 0 && (
                              <div className="text-xs text-gray-500">
                                {user.roles.join(', ')}
                              </div>
                            )}
                          </div>
                        </td> */}

                        {/* Post Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>{getPostStatusBadge(user.allowToPost)}</div>
                        </td>

                        {/* Activity */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            <div className="text-sm text-gray-900">
                              <div className="flex items-center">
                                <FaCalendarAlt className="mr-2 text-gray-400" />
                                Joined: {formatDate(user.createdAt)}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              <div className="flex items-center">
                                <FaClock className="mr-2 text-gray-400" />
                                Last active: {getTimeSince(user.lastActiveAt)}
                              </div>
                            </div>
                            <div className="text-xs">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                              {user.isBlocked && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-100 text-red-800 ml-1">
                                  Blocked
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewProfile(user)}
                              className="p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                              title="View Profile"
                              disabled={loading}
                            >
                              <FaEye className="text-sm" />
                            </button>

                            {user.allowToPost !== 'allow' && (
                              <button
                                onClick={() => handleUpdateStatus(user, 'allow')}
                                className="p-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                                title="Allow to Post"
                                disabled={loading}
                              >
                                <FaCheck className="text-sm" />
                              </button>
                            )}

                            {user.allowToPost !== 'notallow' && (
                              <button
                                onClick={() => handleUpdateStatus(user, 'notallow')}
                                className="p-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                                title="Disallow Posting"
                                disabled={loading}
                              >
                                <FaTimes className="text-sm" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && totalUsers > itemsPerPage && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalUsers)}</span> of{' '}
              <span className="font-medium">{totalUsers}</span> users
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {currentPage} of {Math.ceil(totalUsers / itemsPerPage)}
              </span>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage * itemsPerPage >= totalUsers || loading}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Profile Preview Modal */}
        {showPreview && previewUser && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">User Profile</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-400 hover:text-gray-500"
                    disabled={loading}
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Profile Header */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {previewUser.profile?.profileAvatar ? (
                        <img
                          className="h-20 w-20 rounded-full object-cover"
                          src={previewUser.profile.profileAvatar}
                          alt={previewUser.userName}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/80';
                          }}
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                          <FaUser className="text-blue-600 text-2xl" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {previewUser.profile?.name || 'N/A'} {previewUser.profile?.lastName || ''}
                      </h2>
                      <p className="text-gray-600">@{previewUser.userName}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {getPostStatusBadge(previewUser.allowToPost)}
                        {getAccountTypeBadge(previewUser.accountType)}
                        {getSubscriptionBadge(previewUser.subscription)}
                      </div>
                    </div>
                  </div>

                  {/* Bio & Summary */}
                  {(previewUser.profile?.bio || previewUser.profile?.profileSummary) && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">About</h4>
                      {previewUser.profile?.bio && (
                        <p className="text-gray-700 mb-2">{previewUser.profile.bio}</p>
                      )}
                      {previewUser.profile?.profileSummary && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {previewUser.profile.profileSummary}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Contact Information */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center mb-2">
                          <FaEnvelope className="mr-2 text-gray-400" />
                          <span className="text-gray-700">{previewUser.email}</span>
                        </div>
                        {previewUser.profile?.phoneNumber && (
                          <div className="flex items-center mb-2">
                            <FaPhone className="mr-2 text-gray-400" />
                            <span className="text-gray-700">{previewUser.profile.phoneNumber}</span>
                          </div>
                        )}
                        {previewUser.profile?.whatsAppNumber && (
                          <div className="flex items-center">
                            <FaPhone className="mr-2 text-green-400" />
                            <span className="text-gray-700">WhatsApp: {previewUser.profile.whatsAppNumber}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        {(previewUser.profile?.city || previewUser.profile?.country) && (
                          <div className="flex items-center mb-2">
                            <FaGlobe className="mr-2 text-gray-400" />
                            <span className="text-gray-700">
                              {previewUser.profile.city && <span>{previewUser.profile.city}, </span>}
                              {previewUser.profile.country && <span>{previewUser.profile.country}</span>}
                            </span>
                          </div>
                        )}
                        {previewUser.profile?.gender && (
                          <div className="flex items-center">
                            <FaVenusMars className="mr-2 text-gray-400" />
                            <span className="text-gray-700">{previewUser.profile.gender}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  {previewUser.profile?.socialLinks && Object.keys(previewUser.profile.socialLinks).length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Social Links</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(previewUser.profile.socialLinks).map(([platform, url]) => (
                          url && (
                            <a
                              key={platform}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                            >
                              {platform.charAt(0).toUpperCase() + platform.slice(1)}
                            </a>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Account Information */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Account Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Joined</p>
                        <p className="text-gray-700">{formatDateTime(previewUser.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Last Active</p>
                        <p className="text-gray-700">{getTimeSince(previewUser.lastActiveAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Profile Status</p>
                        <p className={`inline-flex items-center px-2 py-0.5 rounded ${previewUser.profile?.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {previewUser.profile?.isPublished ? 'Published' : 'Not Published'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Account Status</p>
                        <p className={`inline-flex items-center px-2 py-0.5 rounded ${previewUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {previewUser.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowPreview(false);
                      handleUpdateStatus(previewUser, previewUser.allowToPost === 'allow' ? 'notallow' : 'allow');
                    }}
                    className={`px-4 py-2 rounded-lg text-white transition-colors flex items-center ${previewUser.allowToPost === 'allow' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                    disabled={loading}
                  >
                    {previewUser.allowToPost === 'allow' ? (
                      <>
                        <FaBan className="mr-2" />
                        Disallow Posting
                      </>
                    ) : (
                      <>
                        <FaCheck className="mr-2" />
                        Allow Posting
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={loading}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Update Confirmation Modal */}
        {showStatusModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100">
                  <FaUserCheck className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                  Update Post Permission
                </h3>
                <p className="text-sm text-gray-500 text-center mb-6">
                  Are you sure you want to update <strong>{selectedUser.userName}</strong>'s post permission to{' '}
                  <strong>{newStatus}</strong>?
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      setShowStatusModal(false);
                      setSelectedUser(null);
                      setNewStatus('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmUpdateStatus}
                    disabled={loading}
                    className={`px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors flex items-center ${
                      newStatus === 'allow' ? 'bg-green-600' :
                      newStatus === 'interest' ? 'bg-yellow-600' :
                      'bg-red-600'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      `Update to ${newStatus}`
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
                  <FaExclamationTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                  Delete User
                </h3>
                <p className="text-sm text-gray-500 text-center mb-6">
                  Are you sure you want to delete user <strong>"{selectedUser.userName}"</strong>?
                  This action cannot be undone and will permanently remove the user account.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedUser(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={loading}
                    className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      'Delete User'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersWillingToPost;