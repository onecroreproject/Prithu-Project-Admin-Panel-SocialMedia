import React, { useState, useEffect, useCallback } from 'react';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../Services/apiService';
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
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">
                Users Willing to Post
              </h1>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">
                {totalUsers} {totalUsers === 1 ? 'user' : 'users'} interested in posting content
              </p>
            </div>
            <button
              onClick={fetchUsers}
              className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all hover:scale-110 active:scale-95"
            >
              <FaSync className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Count Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {[
            { label: 'Total Users', value: totalUsers, icon: FaUser, color: 'blue', opacity: 'bg-blue-50' },
            { label: 'Allowed to Post', value: users.filter(user => user.allowToPost === 'allow').length, icon: FaUserCheck, color: 'emerald', opacity: 'bg-emerald-50' },
            { label: 'Interested', value: users.filter(user => user.allowToPost === 'interest').length, icon: FaUserClock, color: 'amber', opacity: 'bg-amber-50' },
            { label: 'Not Allowed', value: users.filter(user => user.allowToPost === 'notallow').length, icon: FaUserTimes, color: 'rose', opacity: 'bg-rose-50' }
          ].map((card, idx) => (
            <div key={idx} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-3xl ${card.opacity} flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
                  <card.icon className={`h-7 w-7 text-${card.color}-600`} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{card.label}</p>
                  <p className="text-3xl font-black text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-[2.5rem] p-8 mb-10 border border-gray-100 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Search Input */}
            <div className="lg:col-span-12">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-14 pr-6 py-5 bg-gray-50 border border-transparent rounded-3xl text-sm font-medium text-gray-900 focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none placeholder:text-gray-400 placeholder:font-bold placeholder:uppercase placeholder:tracking-widest"
                  placeholder="Search by name, email or username..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div className="lg:col-span-12">
              <div className="flex flex-wrap gap-4">
                {[
                  { value: filters.accountType, onChange: (val) => handleFilterChange('accountType', val), options: availableFilters.accountTypes, placeholder: 'All Account Types' },
                  { value: filters.allowToPost, onChange: (val) => handleFilterChange('allowToPost', val), options: availableFilters.postStatuses, placeholder: 'All Post Status' },
                  { value: filters.country, onChange: (val) => handleFilterChange('country', val), options: availableFilters.countries, placeholder: 'All Countries' },
                  { value: filters.isPublished, onChange: (val) => handleFilterChange('isPublished', val), options: [{ value: 'true', label: 'Published' }, { value: 'false', label: 'Not Published' }], placeholder: 'Profile Status' }
                ].map((filter, idx) => (
                  <select
                    key={idx}
                    value={filter.value}
                    onChange={(e) => filter.onChange(e.target.value)}
                    className="pl-4 pr-10 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-600 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all outline-none appearance-none cursor-pointer hover:border-gray-200"
                    disabled={loading}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23D1D5DB'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
                  >
                    <option value="">{filter.placeholder}</option>
                    {filter.options.map((opt) => (
                      <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
                        {typeof opt === 'string' ? opt.charAt(0).toUpperCase() + opt.slice(1) : opt.label}
                      </option>
                    ))}
                  </select>
                ))}

                <button
                  onClick={resetFilters}
                  disabled={loading}
                  className="px-6 py-3 bg-gray-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all flex items-center gap-2"
                >
                  <FaTimes className="text-[12px]" />
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div className="mt-8 pt-8 border-t border-gray-50 flex items-center gap-6">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sort by:</span>
            <div className="flex gap-2">
              {[
                { field: 'createdAt', label: 'Newest', icon: FaCalendarAlt },
                { field: 'lastActiveAt', label: 'Last Active', icon: FaClock }
              ].map((sort) => (
                <button
                  key={sort.field}
                  onClick={() => handleSortChange(sort.field)}
                  disabled={loading}
                  className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${sortBy === sort.field
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-200'
                    }`}
                >
                  <sort.icon className="text-[12px]" />
                  {sort.label} {sortBy === sort.field && (sortOrder === 'desc' ? '↓' : '↑')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-10">
          {loading && currentPage > 1 ? (
            <div className="p-20 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading more users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-20 h-20 mx-auto bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
                <FaUser className="text-gray-300 text-3xl" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">No users found</h3>
              <p className="text-sm font-medium text-gray-400 mb-8 max-w-xs mx-auto">
                {searchTerm || Object.values(filters).some(f => f)
                  ? "We couldn't find any users matching your current filters."
                  : "There are no users currently expressing interest in posting."}
              </p>
              {(searchTerm || Object.values(filters).some(f => f)) && (
                <button
                  onClick={resetFilters}
                  className="px-8 py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-50">
                <thead>
                  <tr className="bg-gray-50/50">
                    {[
                      'User Profile',
                      'Contact & Location',
                      'Post Status',
                      'Activity',
                      'Actions'
                    ].map((head) => (
                      <th key={head} className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors group">
                      {/* User Profile */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 border-2 border-white ring-1 ring-gray-100 shadow-sm">
                              {user.profile?.profileAvatar ? (
                                <img
                                  className="w-full h-full object-cover"
                                  src={user.profile.profileAvatar}
                                  alt={user.userName}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/48';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-50">
                                  <FaUser className="text-blue-400 text-xl" />
                                </div>
                              )}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${user.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-black text-gray-900 mb-0.5">
                              {user.profile?.name || 'N/A'} {user.profile?.lastName || ''}
                            </div>
                            <div className="text-[10px] font-bold text-gray-400 truncate tracking-wide">
                              @{user.userName}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              {user.profile?.gender && (
                                <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-[8px] font-black text-gray-500 uppercase tracking-widest rounded-md">
                                  {user.profile.gender}
                                </span>
                              )}
                              <span className={`inline-flex items-center px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-md ${user.profile?.isPublished ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                                }`}>
                                {user.profile?.isPublished ? 'Published' : 'Hidden'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact & Location */}
                      <td className="px-8 py-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[11px] font-medium text-gray-600">
                            <FaEnvelope className="text-gray-300" />
                            {user.email}
                          </div>
                          {user.profile?.phoneNumber && (
                            <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500">
                              <FaPhone className="text-gray-300" />
                              {user.profile.phoneNumber}
                            </div>
                          )}
                          {(user.profile?.city || user.profile?.country) && (
                            <div className="flex items-center gap-2 text-[11px] font-medium text-gray-400">
                              <FaGlobe className="text-gray-300" />
                              <span className="truncate">
                                {user.profile.city && <span>{user.profile.city}</span>}
                                {user.profile.city && user.profile.country && <span>, </span>}
                                {user.profile.country && <span>{user.profile.country}</span>}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Post Status */}
                      <td className="px-8 py-6">
                        {getPostStatusBadge(user.allowToPost)}
                      </td>

                      {/* Activity */}
                      <td className="px-8 py-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[11px] font-medium text-gray-600">
                            <FaCalendarAlt className="text-gray-300" />
                            {formatDate(user.createdAt)}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                            <FaClock className="text-blue-200" />
                            {getTimeSince(user.lastActiveAt)}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewProfile(user)}
                            className="p-3 bg-white border border-gray-100 text-gray-400 rounded-xl hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50 transition-all shadow-sm active:scale-95"
                            title="View Profile"
                            disabled={loading}
                          >
                            <FaEye className="text-sm" />
                          </button>

                          {user.allowToPost !== 'allow' && (
                            <button
                              onClick={() => handleUpdateStatus(user, 'allow')}
                              className="p-3 bg-white border border-gray-100 text-gray-400 rounded-xl hover:text-emerald-600 hover:border-emerald-100 hover:bg-emerald-50 transition-all shadow-sm active:scale-95"
                              title="Allow to Post"
                              disabled={loading}
                            >
                              <FaCheck className="text-sm" />
                            </button>
                          )}

                          {user.allowToPost !== 'notallow' && (
                            <button
                              onClick={() => handleUpdateStatus(user, 'notallow')}
                              className="p-3 bg-white border border-gray-100 text-gray-400 rounded-xl hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 transition-all shadow-sm active:scale-95"
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
          )}
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && totalUsers > itemsPerPage && (
          <div className="flex items-center justify-between px-8 py-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Showing <span className="text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="text-gray-900">{Math.min(currentPage * itemsPerPage, totalUsers)}</span> of{' '}
              <span className="text-gray-900">{totalUsers}</span> users
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
                className="p-3 px-6 bg-white rounded-2xl border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
              >
                Previous
              </button>
              <div className="w-24 h-10 flex items-center justify-center bg-gray-50 rounded-2xl text-[10px] font-black text-blue-600 tracking-widest">
                PAGE {currentPage}
              </div>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage * itemsPerPage >= totalUsers || loading}
                className="p-3 px-6 bg-white rounded-2xl border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Profile Preview Modal */}
        {showPreview && previewUser && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-100 animate-in zoom-in-95 duration-300">
              <div className="p-10 overflow-y-auto flex-1 custom-scrollbar">
                <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center gap-8">
                    <div className="relative group">
                      <div className="w-28 h-28 rounded-[2.5rem] overflow-hidden bg-gray-50 border-4 border-white shadow-xl shadow-gray-200/50">
                        {previewUser.profile?.profileAvatar ? (
                          <img
                            className="w-full h-full object-cover"
                            src={previewUser.profile.profileAvatar}
                            alt={previewUser.userName}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-50">
                            <FaUser className="text-blue-400 text-4xl" />
                          </div>
                        )}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-2xl border-4 border-white shadow-md flex items-center justify-center ${previewUser.isActive ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-white'}`}>
                        {previewUser.isActive ? <FaCheck size={10} /> : <FaBan size={10} />}
                      </div>
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
                        {previewUser.profile?.name || 'N/A'} {previewUser.profile?.lastName || ''}
                      </h2>
                      <p className="text-[11px] font-black text-blue-500 uppercase tracking-[0.3em]">@{previewUser.userName}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-6">
                        {getPostStatusBadge(previewUser.allowToPost)}
                        {getAccountTypeBadge(previewUser.accountType)}
                        {getSubscriptionBadge(previewUser.subscription)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all active:scale-95"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Left Column */}
                  <div className="space-y-10">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">About User</p>
                      <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-inner">
                        <p className="text-sm font-medium text-gray-700 leading-loose">
                          {previewUser.profile?.bio || previewUser.profile?.profileSummary || "No bio information provided by the user."}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Social Context</p>
                      <div className="flex flex-wrap gap-3">
                        {previewUser.profile?.socialLinks && Object.entries(previewUser.profile.socialLinks).map(([platform, url]) => (
                          url && (
                            <a
                              key={platform}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
                            >
                              {platform}
                            </a>
                          )
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-10">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Contact & Location</p>
                      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
                        {[
                          { icon: FaEnvelope, label: 'Email Address', value: previewUser.email, color: 'text-blue-500' },
                          { icon: FaPhone, label: 'Phone Number', value: previewUser.profile?.phoneNumber || 'N/A', color: 'text-emerald-500' },
                          { icon: FaGlobe, label: 'Location', value: `${previewUser.profile?.city || ''}${previewUser.profile?.country ? `, ${previewUser.profile.country}` : ''}` || 'N/A', color: 'text-amber-500' },
                          { icon: FaVenusMars, label: 'Gender', value: previewUser.profile?.gender || 'N/A', color: 'text-rose-500' }
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-5">
                            <div className={`w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center ${item.color}`}>
                              <item.icon size={16} />
                            </div>
                            <div>
                              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                              <p className="text-xs font-bold text-gray-900">{item.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Account Metadata</p>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Joined', value: formatDate(previewUser.createdAt) },
                          { label: 'Last Activity', value: getTimeSince(previewUser.lastActiveAt) }
                        ].map((meta, idx) => (
                          <div key={idx} className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{meta.label}</p>
                            <p className="text-xs font-black text-gray-900">{meta.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-4">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-8 py-4 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 hover:bg-white transition-all shadow-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    handleUpdateStatus(previewUser, previewUser.allowToPost === 'allow' ? 'notallow' : 'allow');
                  }}
                  className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-lg active:scale-95 flex items-center gap-3 ${previewUser.allowToPost === 'allow'
                      ? 'bg-rose-600 shadow-rose-500/20 hover:bg-rose-700'
                      : 'bg-emerald-600 shadow-emerald-500/20 hover:bg-emerald-700'
                    }`}
                >
                  {previewUser.allowToPost === 'allow' ? (
                    <><FaBan /> Disallow Posting</>
                  ) : (
                    <><FaCheck /> Allow Posting</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Update Confirmation Modal */}
        {showStatusModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] shadow-2xl max-w-md w-full border border-gray-100 p-10 text-center animate-in zoom-in-95 duration-300">
              <div className={`w-20 h-20 mx-auto mb-8 rounded-3xl flex items-center justify-center ${newStatus === 'allow' ? 'bg-emerald-50 text-emerald-600' :
                  newStatus === 'interest' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                }`}>
                <FaUserCheck size={32} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
                Update Permission?
              </h3>
              <p className="text-sm font-medium text-gray-500 leading-relaxed mb-10">
                Are you sure you want to update <span className="text-gray-900 font-bold">@{selectedUser.userName}</span>'s permission to <span className="text-gray-900 font-bold uppercase">{newStatus}</span>?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 py-4 bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-500 rounded-2xl hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUpdateStatus}
                  className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-white rounded-2xl transition-all shadow-lg active:scale-95 ${newStatus === 'allow' ? 'bg-emerald-600 shadow-emerald-500/20' :
                      newStatus === 'interest' ? 'bg-amber-600 shadow-amber-500/20' : 'bg-rose-600 shadow-rose-500/20'
                    }`}
                >
                  {loading ? 'Processing...' : 'Confirm Update'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] shadow-2xl max-w-md w-full border border-gray-100 p-10 text-center animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-rose-600">
                <FaExclamationTriangle size={32} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight font-serif">
                Delete Account?
              </h3>
              <p className="text-sm font-medium text-gray-500 leading-relaxed mb-10">
                Deleting <span className="text-gray-900 font-bold">@{selectedUser.userName}</span> is permanent and cannot be undone. All associated data will be removed.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-4 bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-500 rounded-2xl hover:bg-gray-100 transition-all font-serif"
                >
                  Keep Account
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-4 bg-rose-600 text-[10px] font-black uppercase tracking-widest text-white rounded-2xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/20 active:scale-95"
                >
                  {loading ? 'Deleting...' : 'Permanently Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersWillingToPost;