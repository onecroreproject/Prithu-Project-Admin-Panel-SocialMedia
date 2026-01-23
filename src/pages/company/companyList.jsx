import React, { useState, useEffect, useCallback } from 'react';
import { companyService,suspendCompany } from '../../Services/companyServices/companyService';
import { useNavigate } from 'react-router';
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
  FaBuilding,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaTag,
  FaUserTie,
  FaExclamationTriangle
} from 'react-icons/fa';

const CompanyListPage = () => {
  // State management
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalCompanies, setTotalCompanies] = useState(0);
const navigate=useNavigate()
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    businessCategory: '',
    country: '',
    state: '',
    city: '',
    accountType: '',
    isVerified: '',
    status: ''
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Available filters data
  const [availableFilters, setAvailableFilters] = useState({
    businessCategories: [],
    countries: [],
    states: [],
    cities: [],
    accountTypes: ['basic', 'premium', 'enterprise'],
  });

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch companies data
  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Build query params for your API
      const params = {
        search: debouncedSearch || undefined,
        businessCategory: filters.businessCategory || undefined,
        country: filters.country || undefined,
        state: filters.state || undefined,
        city: filters.city || undefined,
        accountType: filters.accountType || undefined,
        isVerified: filters.isVerified || undefined,
        status: filters.status || undefined,
        sortBy,
        sortOrder
      };

      // Clean up undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });

      const response = await companyService.getAllCompanies(params);
      
      if (response.success) {
        setCompanies(response.data);
        setFilteredCompanies(response.data);
        setTotalCompanies(response.count);
        
        // Extract unique values for filters
        extractFilterOptions(response.data);
      } else {
        setError('Failed to fetch companies');
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError(err.response?.data?.message || 'Failed to load companies');
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

    data.forEach(company => {
      if (company.profile?.businessCategory) {
        categories.add(company.profile.businessCategory);
      }
      if (company.profile?.country) {
        countries.add(company.profile.country);
      }
      if (company.profile?.state) {
        states.add(company.profile.state);
      }
      if (company.profile?.city) {
        cities.add(company.profile.city);
      }
    });

    setAvailableFilters(prev => ({
      ...prev,
      businessCategories: Array.from(categories),
      countries: Array.from(countries),
      states: Array.from(states),
      cities: Array.from(cities)
    }));
  };

  // Initial fetch
  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
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
      businessCategory: '',
      country: '',
      state: '',
      city: '',
      accountType: '',
      isVerified: '',
      status: ''
    });
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Action handlers
  const handleViewCompany = (company) => {
  
    console.log('View company:', company);
    navigate(`/company/profile/view/${company._id}`);
  };

  const handleRemoveCompany = (company) => {
    setSelectedCompany(company);
    
    setActionType('remove');
    setShowConfirmModal(true);
  };

  const handleSuspendCompany = (company) => {
    setSelectedCompany(company);
    setActionType('suspend');
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    if (!selectedCompany) return;

    try {
      if (actionType === 'remove') {
        // Call remove API
        await companyService.removeCompany(selectedCompany._id);
        // Remove from state
        setCompanies(prev => prev.filter(c => c._id !== selectedCompany._id));
        setFilteredCompanies(prev => prev.filter(c => c._id !== selectedCompany._id));
      } else if (actionType === 'suspend') {
        // Call suspend API
        await suspendCompany(selectedCompany._id);
        // Update status in state
        setCompanies(prev => prev.map(c => 
          c._id === selectedCompany._id ? { ...c, status: 'suspended' } : c
        ));
        setFilteredCompanies(prev => prev.map(c => 
          c._id === selectedCompany._id ? { ...c, status: 'suspended' } : c
        ));
      }
      
      setShowConfirmModal(false);
      setSelectedCompany(null);
    } catch (error) {
      console.error('Error performing action:', error);
      setError('Failed to perform action');
    }
  };

  // Status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>;
      case 'suspended':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Suspended</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Inactive</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Unknown</span>;
    }
  };

  // Verification badge
  const getVerificationBadge = (isVerified) => {
    return isVerified ? (
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
        <FaCheckCircle className="mr-1" /> Verified
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
        Not Verified
      </span>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading companies...</p>
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
                Companies Directory
              </h1>
              <p className="text-gray-600">
                {totalCompanies} {totalCompanies === 1 ? 'company' : 'companies'} found
              </p>
            </div>
            <button
              onClick={fetchCompanies}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <FaSync className="mr-2" />
              Refresh
            </button>
          </div>
        </div>

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
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div className="lg:col-span-8">
              <div className="flex flex-wrap gap-3">
                <select
                  value={filters.businessCategory}
                  onChange={(e) => handleFilterChange('businessCategory', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {availableFilters.businessCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  value={filters.accountType}
                  onChange={(e) => handleFilterChange('accountType', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Account Types</option>
                  {availableFilters.accountTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.isVerified}
                  onChange={(e) => handleFilterChange('isVerified', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Verification</option>
                  <option value="true">Verified Only</option>
                  <option value="false">Not Verified</option>
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                </select>

                <button
                  onClick={resetFilters}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
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
              onClick={() => handleSortChange('companyName')}
              className={`px-3 py-1 text-sm rounded ${
                sortBy === 'companyName'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Company Name {sortBy === 'companyName' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
          </div>
        </div>

        {/* Companies Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {filteredCompanies.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FaBuilding className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <button
                onClick={resetFilters}
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
                      Company
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCompanies.map((company) => (
                    <tr key={company._id} className="hover:bg-gray-50">
                      {/* Company Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {company.profile?.logo || company.profileAvatar ? (
                              <img
                                className="h-10 w-10 rounded-lg object-cover"
                                src={company.profile?.logo || company.profileAvatar}
                                alt={company.companyName}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <FaBuilding className="text-blue-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">
                                {company.companyName}
                              </div>
                              {company.isVerified && (
                                <FaCheckCircle className="ml-2 text-green-500" title="Verified" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              <div className="flex items-center mt-1">
                                <FaUserTie className="mr-1 text-gray-400" />
                                {company.name}
                                {company.position && (
                                  <span className="text-gray-400 ml-1">({company.position})</span>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {company.accountType && (
                                <span className="inline-block px-2 py-0.5 bg-gray-100 rounded">
                                  {company.accountType}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {company.email && (
                            <div className="flex items-center text-sm text-gray-900">
                              <FaEnvelope className="mr-2 text-gray-400" />
                              {company.email}
                            </div>
                          )}
                          {company.phone && (
                            <div className="flex items-center text-sm text-gray-500">
                              <FaPhone className="mr-2 text-gray-400" />
                              {company.phone}
                            </div>
                          )}
                          {company.companyEmail && (
                            <div className="flex items-center text-sm text-gray-500">
                              <FaBuilding className="mr-2 text-gray-400" />
                              {company.companyEmail}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(company.profile?.city || company.profile?.state || company.profile?.country) ? (
                          <div className="flex items-center text-sm text-gray-900">
                            <FaMapMarkerAlt className="mr-2 text-gray-400" />
                            <div>
                              {company.profile.city && <div>{company.profile.city}</div>}
                              {company.profile.state && <div>{company.profile.state}</div>}
                              {company.profile.country && <div>{company.profile.country}</div>}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Not specified</span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {company.profile?.businessCategory ? (
                          <div className="flex items-center">
                            <FaTag className="mr-2 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {company.profile.businessCategory}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div>{getStatusBadge(company.status)}</div>
                          <div>{getVerificationBadge(company.isVerified)}</div>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-2 text-gray-400" />
                          {formatDate(company.createdAt)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleViewCompany(company)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                            title="View Details"
                          >
                            <FaEye className="mr-1" />
                            View
                          </button>
                          
                          <button
                            onClick={() => handleSuspendCompany(company)}
                            disabled={company.status === 'suspended'}
                            className={`flex items-center ${
                              company.status === 'suspended'
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-yellow-600 hover:text-yellow-900'
                            }`}
                            title={company.status === 'suspended' ? 'Already Suspended' : 'Suspend Company'}
                          >
                            <FaBan className="mr-1" />
                            {company.status === 'suspended' ? 'Suspended' : 'Suspend'}
                          </button>
                          
                          <button
                            onClick={() => handleRemoveCompany(company)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                            title="Remove Company"
                          >
                            <FaTrash className="mr-1" />
                            Remove
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
        {filteredCompanies.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to{' '}
              <span className="font-medium">{filteredCompanies.length}</span> of{' '}
              <span className="font-medium">{totalCompanies}</span> results
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

        {/* Confirmation Modal */}
        {showConfirmModal && selectedCompany && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
                  <FaExclamationTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                  {actionType === 'remove' ? 'Remove Company' : 'Suspend Company'}
                </h3>
                <p className="text-sm text-gray-500 text-center mb-6">
                  Are you sure you want to {actionType} <strong>{selectedCompany.companyName}</strong>?
                  {actionType === 'suspend' && " This will prevent the company from accessing their account."}
                  {actionType === 'remove' && " This action cannot be undone."}
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      setSelectedCompany(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmAction}
                    className={`px-4 py-2 rounded-lg text-white transition-colors ${
                      actionType === 'remove'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-yellow-600 hover:bg-yellow-700'
                    }`}
                  >
                    {actionType === 'remove' ? 'Remove' : 'Suspend'}
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

export default CompanyListPage;