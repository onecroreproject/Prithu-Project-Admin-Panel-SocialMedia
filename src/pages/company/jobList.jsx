import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../../Services/JobService/jobService';
import {
  FaSearch,
  FaFilter,
  FaSort,
  FaCalendarAlt,
  FaSync,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaTrash,
  FaBan,
  FaEdit,
  FaBuilding,
  FaMapMarkerAlt,
  FaTag,
  FaUserTie,
  FaDollarSign,
  FaBriefcase,
  FaClock,
  FaExclamationTriangle,
  FaEnvelope,
  FaCheck,
  FaTimes,
  FaInfoCircle,
  FaPhone,
  FaUser,
  FaWhatsapp
} from 'react-icons/fa';

const JobListPage = () => {
  const navigate = useNavigate();
  
  // State management
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalJobs, setTotalJobs] = useState(0);

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    isApproved: '',
    jobCategory: '',
    employmentType: '',
    country: '',
    state: '',
    city: '',
    companyId: ''
  });

  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Available filters data
  const [availableFilters, setAvailableFilters] = useState({
    statuses: ['active', 'inactive', 'expired', 'closed', 'draft', 'submit'],
    approvalStatus: ['true', 'false'],
    jobCategories: [],
    employmentTypes: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
    workModes: ['onsite', 'remote', 'hybrid'],
    countries: [],
    states: [],
    cities: []
  });

  // Modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [actionType, setActionType] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch jobs data
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Build query params
      const params = {
        search: debouncedSearch || undefined,
        ...filters,
        sortBy,
        sortOrder
      };

      // Clean up undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });

      const response = await jobService.getAllJobs(params);
      
      if (response.success) {
        setJobs(response.data);
        setFilteredJobs(response.data);
        setTotalJobs(response.count);
        
        // Extract unique values for filters
        extractFilterOptions(response.data);
      } else {
        setError('Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.response?.data?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters, sortBy, sortOrder]);

  // Extract unique values for filter dropdowns
  const extractFilterOptions = (data) => {
    const categories = new Set();
    const countries = new Set();
    const states = new Set();
    const cities = new Set();

    data.forEach(job => {
      if (job.jobCategory) {
        categories.add(job.jobCategory);
      }
      if (job.country) {
        countries.add(job.country);
      }
      if (job.state) {
        states.add(job.state);
      }
      if (job.city) {
        cities.add(job.city);
      }
    });

    setAvailableFilters(prev => ({
      ...prev,
      jobCategories: Array.from(categories),
      countries: Array.from(countries),
      states: Array.from(states),
      cities: Array.from(cities)
    }));
  };

  // Initial fetch
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Handle actions
  const handleAction = (job, type) => {
    setSelectedJob(job);
    setActionType(type);
    
    if (type === 'reject') {
      setShowRejectModal(true);
    } else {
      setShowConfirmModal(true);
    }
  };

  // Confirm action
  const confirmAction = async () => {
    if (!selectedJob) return;
    
    setActionLoading(true);
    try {
      let response;
      
      switch (actionType) {
        case 'approve':
          response = await jobService.approveJob(selectedJob._id);
          break;
        case 'reject':
          response = await jobService.rejectJob(selectedJob._id, rejectionReason);
          break;
        case 'suspend':
          response = await jobService.suspendJob(selectedJob._id);
          break;
        case 'delete':
          response = await jobService.deleteJob(selectedJob._id);
          break;
        default:
          return;
      }

      if (response.success) {
        setMessage({ 
          type: 'success', 
          text: `Job ${actionType === 'delete' ? 'deleted' : actionType + 'd'} successfully!` 
        });
        
        // Update job list
        if (actionType === 'delete') {
          setJobs(prev => prev.filter(job => job._id !== selectedJob._id));
          setFilteredJobs(prev => prev.filter(job => job._id !== selectedJob._id));
        } else {
          // Update the specific job in the list
          const updateField = actionType === 'approve' ? 'isApproved' : 'status';
          const updateValue = actionType === 'approve' ? true : 
                            actionType === 'reject' ? 'closed' :
                            actionType === 'suspend' ? 'inactive' : selectedJob.status;
          
          setJobs(prev => prev.map(job => 
            job._id === selectedJob._id 
              ? { 
                  ...job, 
                  [updateField]: updateValue,
                  ...(actionType === 'approve' && { status: 'active' }),
                  ...(actionType === 'reject' && { rejectionReason })
                } 
              : job
          ));
          setFilteredJobs(prev => prev.map(job => 
            job._id === selectedJob._id 
              ? { 
                  ...job, 
                  [updateField]: updateValue,
                  ...(actionType === 'approve' && { status: 'active' }),
                  ...(actionType === 'reject' && { rejectionReason })
                } 
              : job
          ));
        }
        
        // Clear modals
        setShowConfirmModal(false);
        setShowRejectModal(false);
        setRejectionReason('');
      } else {
        setMessage({ 
          type: 'error', 
          text: response.message || `Failed to ${actionType} job` 
        });
      }
    } catch (error) {
      console.error('Error performing action:', error);
      setMessage({ 
        type: 'error', 
        text: `Error: ${error.response?.data?.message || 'Something went wrong'}` 
      });
    } finally {
      setActionLoading(false);
      setSelectedJob(null);
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
    }
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

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'Negotiable';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Status badge
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1" /> Active
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <FaTimesCircle className="mr-1" /> Inactive
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaTimesCircle className="mr-1" /> Closed
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FaClock className="mr-1" /> Expired
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <FaEdit className="mr-1" /> Draft
          </span>
        );
      case 'submit':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <FaCheck className="mr-1" /> Submitted
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  // Approval badge
  const getApprovalBadge = (isApproved) => {
    return isApproved ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <FaCheckCircle className="mr-1" /> Approved
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <FaClock className="mr-1" /> Pending
      </span>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Job Management
              </h1>
              <p className="text-gray-600">Manage and moderate job postings</p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={fetchJobs}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <FaSync className="mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <FaCheckCircle className="mr-3" />
              ) : (
                <FaExclamationTriangle className="mr-3" />
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
            {/* Search Input */}
            <div className="lg:col-span-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search by job title, role, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div className="lg:col-span-8">
              <div className="flex flex-wrap gap-3">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  {availableFilters.statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.isApproved}
                  onChange={(e) => setFilters(prev => ({ ...prev, isApproved: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Approval</option>
                  <option value="true">Approved</option>
                  <option value="false">Pending</option>
                </select>

                <select
                  value={filters.jobCategory}
                  onChange={(e) => setFilters(prev => ({ ...prev, jobCategory: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {availableFilters.jobCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.employmentType}
                  onChange={(e) => setFilters(prev => ({ ...prev, employmentType: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  {availableFilters.employmentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replace('-', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setFilters({
                    status: '',
                    isApproved: '',
                    jobCategory: '',
                    employmentType: '',
                    country: '',
                    state: '',
                    city: '',
                    companyId: ''
                  })}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                >
                  <FaTimes className="mr-2" />
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <button
              onClick={() => setSortBy('createdAt')}
              className={`px-3 py-1 text-sm rounded ${
                sortBy === 'createdAt'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaCalendarAlt className="inline mr-1" />
              Newest {sortBy === 'createdAt' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button
              onClick={() => setSortBy('jobTitle')}
              className={`px-3 py-1 text-sm rounded ${
                sortBy === 'jobTitle'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Job Title {sortBy === 'jobTitle' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{totalJobs}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FaBriefcase className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">
                  {jobs.filter(job => !job.isApproved).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <FaClock className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {jobs.filter(job => job.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Inactive Jobs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {jobs.filter(job => job.status === 'inactive').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <FaBan className="text-red-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {filteredJobs.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FaBriefcase className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <button
                onClick={() => setFilters({
                  status: '',
                  isApproved: '',
                  jobCategory: '',
                  employmentType: '',
                  country: '',
                  state: '',
                  city: '',
                  companyId: ''
                })}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company & Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posted By
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posted
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredJobs.map((job) => (
                    <tr key={job._id} className="hover:bg-gray-50">
                      {/* Job Details */}
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center">
                            <h4 className="text-sm font-semibold text-gray-900">
                              {job.jobTitle}
                            </h4>
                            {job.jobRole && (
                              <span className="ml-2 text-xs text-gray-500">
                                ({job.jobRole})
                              </span>
                            )}
                          </div>
                          <div className="mt-2 space-y-1">
                            {job.jobCategory && (
                              <div className="flex items-center text-sm text-gray-600">
                                <FaTag className="mr-2 text-gray-400" />
                                {job.jobCategory}
                              </div>
                            )}
                            {(job.city || job.state || job.country) && (
                              <div className="flex items-center text-sm text-gray-600">
                                <FaMapMarkerAlt className="mr-2 text-gray-400" />
                                {[job.city, job.state, job.country]
                                  .filter(Boolean)
                                  .join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Company & Contact Info */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <FaBuilding className="text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {job.companyName || 'Unknown Company'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {job.companyIndustry || 'N/A'}
                              </div>
                            </div>
                          </div>
                          
                          {/* Company Email */}
                          {job.company?.companyEmail && (
                            <div className="flex items-center text-xs text-gray-600">
                              <FaEnvelope className="mr-2 text-gray-400" />
                              <span className="truncate" title={job.company.companyEmail}>
                                {job.company.companyEmail}
                              </span>
                            </div>
                          )}

                          {/* Salary & Type */}
                          <div className="pt-2 border-t border-gray-100">
                            <div className="flex items-center text-xs text-gray-900">
                              <FaDollarSign className="mr-2 text-gray-400" />
                              {job.salaryMin && job.salaryMax ? (
                                <span>
                                  {formatCurrency(job.salaryMin)} - {formatCurrency(job.salaryMax)}
                                </span>
                              ) : job.salaryMin ? (
                                <span>{formatCurrency(job.salaryMin)}</span>
                              ) : (
                                <span>Negotiable</span>
                              )}
                            </div>
                            <div className="flex items-center text-xs text-gray-600 mt-1">
                              <FaBriefcase className="mr-2 text-gray-400" />
                              <span className="capitalize">
                                {job.employmentType?.replace('-', ' ') || 'N/A'}
                              </span>
                              {job.workMode && (
                                <span className="ml-2 text-xs bg-gray-100 px-1 py-0.5 rounded">
                                  {job.workMode}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Posted By Details */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {/* Posted Person Name */}
                          {job.company?.name && (
                            <div className="flex items-center text-sm text-gray-900">
                              <FaUser className="mr-2 text-gray-400" />
                              <span className="font-medium">{job.company.name}</span>
                            </div>
                          )}

                          {/* Position */}
                          {job.company?.position && (
                            <div className="text-xs text-gray-600">
                              <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                {job.company.position}
                              </span>
                            </div>
                          )}

                          {/* Contact Details */}
                          <div className="space-y-1 pt-2 border-t border-gray-100">
                            {/* Phone */}
                            {job.company?.phone && (
                              <div className="flex items-center text-xs text-gray-600">
                                <FaPhone className="mr-2 text-gray-400" />
                                <a 
                                  href={`tel:${job.company.phone}`}
                                  className="hover:text-blue-600 hover:underline"
                                  title="Call"
                                >
                                  {job.company.phone}
                                </a>
                              </div>
                            )}

                            {/* WhatsApp */}
                            {job.company?.whatsAppNumber && (
                              <div className="flex items-center text-xs text-gray-600">
                                <FaWhatsapp className="mr-2 text-green-400" />
                                <a 
                                  href={`https://wa.me/${job.company.whatsAppNumber}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-green-600 hover:underline"
                                  title="WhatsApp"
                                >
                                  {job.company.whatsAppNumber}
                                </a>
                              </div>
                            )}

                            {/* Email */}
                            {job.company?.email && (
                              <div className="flex items-center text-xs text-gray-600">
                                <FaEnvelope className="mr-2 text-gray-400" />
                                <a 
                                  href={`mailto:${job.company.email}`}
                                  className="hover:text-blue-600 hover:underline truncate"
                                  title={job.company.email}
                                >
                                  {job.company.email}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div>{getStatusBadge(job.status)}</div>
                          <div>{getApprovalBadge(job.isApproved)}</div>
                        </div>
                      </td>

                      {/* Posted Date */}
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-2 text-gray-400" />
                          {formatDate(job.createdAt)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {/* View Button */}
                          <button
                            onClick={() => navigate(`/company/admin/job-preview/${job._id}`)}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>

                          {/* Approve Button (only show for pending approval) */}
                          {!job.isApproved && (
                            <button
                              onClick={() => handleAction(job, 'approve')}
                              disabled={actionLoading}
                              className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Approve Job"
                            >
                              <FaCheck className="w-4 h-4" />
                            </button>
                          )}

                          {/* Reject Button (only show for pending approval) */}
                          {!job.isApproved && (
                            <button
                              onClick={() => handleAction(job, 'reject')}
                              disabled={actionLoading}
                              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Reject Job"
                            >
                              <FaTimes className="w-4 h-4" />
                            </button>
                          )}

                          {/* Suspend/Activate Button */}
                          {job.isApproved && job.status === 'active' && (
                            <button
                              onClick={() => handleAction(job, 'suspend')}
                              disabled={actionLoading}
                              className="p-2 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Suspend Job"
                            >
                              <FaBan className="w-4 h-4" />
                            </button>
                          )}

                          {/* Activate Button for inactive or update jobs */}
                          {job.isApproved && (job.status === 'inactive' || job.status === 'update') && (
                            <button
                              onClick={() => handleAction(job, 'approve')}
                              disabled={actionLoading}
                              className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Activate Job"
                            >
                              <FaCheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            onClick={() => handleAction(job, 'delete')}
                            disabled={actionLoading}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete Job"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
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
        {filteredJobs.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to{' '}
              <span className="font-medium">{filteredJobs.length}</span> of{' '}
              <span className="font-medium">{totalJobs}</span> results
            </div>
            <nav className="flex space-x-2">
              <button className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium">
                1
              </button>
              <button className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Next
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Reject Job Modal */}
      {showRejectModal && selectedJob && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
                <FaTimes className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                Reject Job Posting
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Please provide a reason for rejecting "<strong>{selectedJob.jobTitle}</strong>". 
                This will change the job status to "Closed".
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter detailed reason for rejection..."
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Minimum 10 characters required.
                </p>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setSelectedJob(null);
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  disabled={actionLoading || rejectionReason.length < 10}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <span className="flex items-center">
                      <FaSync className="animate-spin mr-2" />
                      Processing...
                    </span>
                  ) : (
                    'Reject Job'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal (Approve/Suspend/Delete) */}
      {showConfirmModal && selectedJob && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className={`flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full ${
                actionType === 'approve' ? 'bg-green-100' :
                actionType === 'suspend' ? 'bg-yellow-100' :
                'bg-red-100'
              }`}>
                {actionType === 'approve' ? (
                  <FaCheck className="h-6 w-6 text-green-600" />
                ) : actionType === 'suspend' ? (
                  <FaBan className="h-6 w-6 text-yellow-600" />
                ) : (
                  <FaExclamationTriangle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                {actionType === 'approve' 
                  ? 'Approve Job Posting' 
                  : actionType === 'suspend'
                  ? 'Suspend Job Posting'
                  : 'Delete Job Posting'
                }
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                {actionType === 'approve' 
                  ? `Are you sure you want to approve "${selectedJob.jobTitle}"? This will change status to "Active".`
                  : actionType === 'suspend'
                  ? `Are you sure you want to suspend "${selectedJob.jobTitle}"? This will change status to "Inactive".`
                  : `Are you sure you want to permanently delete "${selectedJob.jobTitle}"? This action cannot be undone.`
                }
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  disabled={actionLoading}
                  className={`px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 ${
                    actionType === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : actionType === 'suspend'
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actionLoading ? (
                    <span className="flex items-center">
                      <FaSync className="animate-spin mr-2" />
                      Processing...
                    </span>
                  ) : (
                    actionType.charAt(0).toUpperCase() + actionType.slice(1)
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobListPage;