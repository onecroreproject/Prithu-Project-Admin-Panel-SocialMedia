import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { viewCompany } from '../../Services/companyServices/companyService';
import {
  FaArrowLeft,
  FaBuilding,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaTag,
  FaUserTie,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaTrash,
  FaBan,
  FaCheck,
  FaFileAlt,
  FaGlobe,
  FaWhatsapp,
  FaIdCard,
  FaChartLine,
  FaExclamationTriangle,
  FaHistory,
  FaIndustry,
  FaCity,
  FaFlag,
  FaCreditCard,
  FaShieldAlt,
  FaSync,
  FaTrophy,
  FaUsers,
  FaBriefcase,
  FaCertificate,
  FaMapPin,
  FaClock,
  FaAward
} from 'react-icons/fa';

const CompanyProfileView = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [company, setCompany] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Action states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch company data
  useEffect(() => {
    fetchCompanyData();
  }, [companyId]);

  const fetchCompanyData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await viewCompany(companyId);
   
      
      if (response.data.success && response.data) {
           console.log('API Response:', response.data);
        // Handle the nested structure
        setCompany(response.data.data.company || response.data);
        setProfile(response.data.data.profile || response.data.company?.profile || {});
      } else {
        setError('Failed to load company data');
      }
    } catch (err) {
      console.error('Error fetching company:', err);
      setError(err.response?.data?.message || 'Failed to load company profile');
    } finally {
      setLoading(false);
    }
  };
console.log("company",company)
  // Handle actions
  const handleAction = (type) => {
    setActionType(type);
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    if (!company) return;
    
    setActionLoading(true);
    try {
      let response;
      switch (actionType) {
        case 'suspend':
          // response = await companyService.suspendCompany(company._id);
          break;
        case 'activate':
          // response = await companyService.activateCompany(company._id);
          break;
        case 'remove':
          // response = await companyService.removeCompany(company._id);
          break;
        default:
          return;
      }

      if (response?.success) {
        setMessage({ 
          type: 'success', 
          text: `Company ${actionType}d successfully!` 
        });
        
        // Update company data if not removing
        if (actionType !== 'remove') {
          fetchCompanyData();
        } else {
          // Navigate back to companies list after removal
          setTimeout(() => {
            navigate('/company/company/list');
          }, 1500);
        }
      } else {
        setMessage({ 
          type: 'error', 
          text: response?.message || `Failed to ${actionType} company` 
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
      setShowConfirmModal(false);
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status badge
  const getStatusBadge = (status) => {
    if (!status) return null;
    
    switch (status.toLowerCase()) {
      case 'active':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1.5" /> Active
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <FaBan className="mr-1.5" /> Suspended
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <FaTimesCircle className="mr-1.5" /> Inactive
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  // Verification badge
  const getVerificationBadge = (isVerified) => {
    return isVerified ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
        <FaShieldAlt className="mr-1.5" /> Verified
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
        Not Verified
      </span>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <FaExclamationTriangle className="text-red-600 text-2xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {error || 'Company not found'}
          </h3>
          <button
            onClick={() => navigate('/company/company/list')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
          >
            <FaArrowLeft className="mr-2" />
            Back to Companies List
          </button>
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
            <div className="flex items-center mb-4 md:mb-0">
              <button
                onClick={() => navigate('/company/company/list')}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <FaArrowLeft className="text-xl" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Company Profile
                </h1>
                <p className="text-gray-600">Detailed view of company information</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* Status and Verification Badges */}
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(company.status)}
                {getVerificationBadge(company.isVerified)}
              </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Company Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Company Overview Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-lg bg-blue-100 flex items-center justify-center border-4 border-white shadow">
                      <FaBuilding className="text-blue-600 text-3xl" />
                    </div>
                  </div>
                  <div className="ml-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {company.companyName}
                    </h2>
                    {profile?.tagline && (
                      <p className="text-gray-600 italic mt-1">
                        "{profile.tagline}"
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        <FaIndustry className="mr-1.5" />
                        {profile?.businessCategory || 'IT Services'}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <FaCalendarAlt className="mr-1.5" />
                        Est. {profile?.yearEstablished || '2014'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleAction(company.status === 'active' ? 'suspend' : 'activate')}
                    disabled={actionLoading}
                    className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
                      company.status === 'active'
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    } ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {actionLoading ? (
                      <FaSync className="animate-spin mr-2" />
                    ) : company.status === 'active' ? (
                      <FaBan className="mr-2" />
                    ) : (
                      <FaCheck className="mr-2" />
                    )}
                    {company.status === 'active' ? 'Suspend Company' : 'Activate Company'}
                  </button>
                  
                  <button
                    onClick={() => handleAction('remove')}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaTrash className="mr-2" />
                    Remove Company
                  </button>
                  
                  <button
                    onClick={() => navigate(`/company/company/edit/${company._id}`)}
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center"
                  >
                    <FaEdit className="mr-2" />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white rounded-xl shadow-lg">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  {['overview', 'contact', 'business', 'documents', 'activity'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-6 text-sm font-medium border-b-2 ${
                        activeTab === tab
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* About Company */}
                    {profile?.about && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <FaFileAlt className="mr-2 text-blue-500" />
                          About Company
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700 whitespace-pre-line">
                            {profile.about}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {profile?.description && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <FaFileAlt className="mr-2 text-blue-500" />
                          Company Description
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700 whitespace-pre-line">
                            {profile.description}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Mission & Vision */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {profile?.mission && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <FaFlag className="mr-2 text-blue-500" />
                            Mission
                          </h3>
                          <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-gray-700 italic">
                              "{profile.mission}"
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {profile?.vision && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <FaFlag className="mr-2 text-blue-500" />
                            Vision
                          </h3>
                          <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-gray-700 italic">
                              "{profile.vision}"
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Tab */}
                {activeTab === 'contact' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Primary Contact */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <FaUserTie className="mr-2 text-blue-500" />
                          HR Contact
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-500">
                              HR Manager
                            </label>
                            <p className="mt-1 text-sm text-gray-900 flex items-center">
                              <FaUserTie className="mr-2 text-gray-400" />
                              {company.name || profile?.hrName}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">
                              Position
                            </label>
                            <p className="mt-1 text-sm text-gray-900">
                              {company.position || 'HR Manager'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">
                              HR Phone
                            </label>
                            <p className="mt-1 text-sm text-gray-900 flex items-center">
                              <FaPhone className="mr-2 text-gray-400" />
                              {profile?.hrPhone || company.phone}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">
                              Hiring Email
                            </label>
                            <p className="mt-1 text-sm text-gray-900 flex items-center">
                              <FaEnvelope className="mr-2 text-gray-400" />
                              {profile?.hiringEmail || company.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Company Contact */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <FaBuilding className="mr-2 text-blue-500" />
                          Company Contact
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-500">
                              Company Email
                            </label>
                            <p className="mt-1 text-sm text-gray-900 flex items-center">
                              <FaEnvelope className="mr-2 text-gray-400" />
                              {company.companyEmail || profile?.companyEmail || company.email}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">
                              Company Phone
                            </label>
                            <p className="mt-1 text-sm text-gray-900 flex items-center">
                              <FaPhone className="mr-2 text-gray-400" />
                              {profile?.companyPhone || company.phone}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">
                              Working Hours
                            </label>
                            <p className="mt-1 text-sm text-gray-900 flex items-center">
                              <FaClock className="mr-2 text-gray-400" />
                              {profile?.workingHours || '9 AM - 6 PM'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500">
                              Working Days
                            </label>
                            <p className="mt-1 text-sm text-gray-900">
                              {profile?.workingDays || 'Monday to Friday'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Business Tab */}
                {activeTab === 'business' && (
                  <div className="space-y-6">
                    {/* Location Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-blue-500" />
                        Location Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">
                            <FaCity className="inline mr-1" /> City
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {profile?.city || 'Chennai'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">
                            <FaFlag className="inline mr-1" /> State
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {profile?.state || 'Tamil Nadu'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">
                            Country
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {profile?.country || 'India'}
                          </p>
                        </div>
                      </div>
                      {profile?.address && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">
                            <FaMapPin className="inline mr-1" /> Full Address
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {profile.address}
                          </p>
                        </div>
                      )}
                      {profile?.pincode && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">
                            Pincode
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {profile.pincode}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Business Stats */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <FaChartLine className="mr-2 text-blue-500" />
                        Business Statistics
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-blue-900">
                            {profile?.employeeCount || '250'}
                          </div>
                          <div className="text-sm text-blue-700 flex items-center justify-center">
                            <FaUsers className="mr-1" /> Employees
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-green-900">
                            {profile?.yearEstablished || '2014'}
                          </div>
                          <div className="text-sm text-green-700">
                            Year Established
                          </div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-purple-900">
                            {profile?.clients?.length || '3'}
                          </div>
                          <div className="text-sm text-purple-700 flex items-center justify-center">
                            <FaBriefcase className="mr-1" /> Major Clients
                          </div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-yellow-900">
                            {profile?.awards?.length || '2'}
                          </div>
                          <div className="text-sm text-yellow-700 flex items-center justify-center">
                            <FaTrophy className="mr-1" /> Awards
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Services & Clients */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Services Offered */}
                      {profile?.servicesOffered && profile.servicesOffered.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <FaBriefcase className="mr-2 text-blue-500" />
                            Services Offered
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {profile.servicesOffered.map((service, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Major Clients */}
                      {profile?.clients && profile.clients.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <FaBriefcase className="mr-2 text-blue-500" />
                            Major Clients
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {profile.clients.map((client, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                              >
                                {client}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Hiring Process */}
                    {profile?.hiringProcess && profile.hiringProcess.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <FaUsers className="mr-2 text-blue-500" />
                          Hiring Process
                        </h3>
                        <div className="space-y-2">
                          {profile.hiringProcess.map((step, index) => (
                            <div key={index} className="flex items-center">
                              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                                {index + 1}
                              </div>
                              <span className="text-gray-700">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Awards & Recognition */}
                    {profile?.awards && profile.awards.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <FaAward className="mr-2 text-blue-500" />
                          Awards & Recognition
                        </h3>
                        <div className="space-y-2">
                          {profile.awards.map((award, index) => (
                            <div key={index} className="flex items-center">
                              <FaTrophy className="text-yellow-500 mr-2" />
                              <span className="text-gray-700">{award}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Company Documents */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <FaCertificate className="mr-2 text-blue-500" />
                          Company Documents
                        </h3>
                        <div className="space-y-3">
                          {profile?.cinNumber && (
                            <div>
                              <label className="block text-sm font-medium text-gray-500">
                                CIN Number
                              </label>
                              <p className="mt-1 text-sm text-gray-900 font-mono">
                                {profile.cinNumber}
                              </p>
                            </div>
                          )}
                          {profile?.gstNumber && (
                            <div>
                              <label className="block text-sm font-medium text-gray-500">
                                GST Number
                              </label>
                              <p className="mt-1 text-sm text-gray-900 font-mono">
                                {profile.gstNumber}
                              </p>
                            </div>
                          )}
                          {profile?.panNumber && (
                            <div>
                              <label className="block text-sm font-medium text-gray-500">
                                PAN Number
                              </label>
                              <p className="mt-1 text-sm text-gray-900 font-mono">
                                {profile.panNumber}
                              </p>
                            </div>
                          )}
                          {profile?.registrationCertificate && (
                            <div>
                              <label className="block text-sm font-medium text-gray-500">
                                Registration Certificate
                              </label>
                              <p className="mt-1 text-sm text-gray-900">
                                {profile.registrationCertificate}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ISO Certification */}
                      {profile?.about && profile.about.includes('ISO') && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <FaShieldAlt className="mr-2 text-blue-500" />
                            Certifications
                          </h3>
                          <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center mb-2">
                              <FaShieldAlt className="text-green-600 mr-2" />
                              <span className="font-medium text-green-800">ISO Certified</span>
                            </div>
                            <p className="text-sm text-green-700">
                              {profile.about}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <FaHistory className="mr-2 text-blue-500" />
                        Activity Timeline
                      </h3>
                      <div className="space-y-4">
                        <div className="border-l-4 border-blue-500 pl-4 py-2">
                          <div className="text-sm text-gray-500">
                            {formatDate(company.createdAt)}
                          </div>
                          <div className="text-gray-900 font-medium">
                            Company Registered
                          </div>
                          <p className="text-sm text-gray-600">
                            {company.companyName} was registered on the platform
                          </p>
                        </div>
                        
                        {profile?.createdAt && (
                          <div className="border-l-4 border-green-500 pl-4 py-2">
                            <div className="text-sm text-gray-500">
                              {formatDate(profile.createdAt)}
                            </div>
                            <div className="text-gray-900 font-medium">
                              Profile Created
                            </div>
                            <p className="text-sm text-gray-600">
                              Company profile created
                            </p>
                          </div>
                        )}
                        
                        {company.updatedAt && (
                          <div className="border-l-4 border-green-500 pl-4 py-2">
                            <div className="text-sm text-gray-500">
                              {formatDate(company.updatedAt)}
                            </div>
                            <div className="text-gray-900 font-medium">
                              Last Updated
                            </div>
                            <p className="text-sm text-gray-600">
                              Last profile update
                            </p>
                          </div>
                        )}
                        
                        <div className="border-l-4 border-yellow-500 pl-4 py-2">
                          <div className="text-sm text-gray-500">
                            Recently
                          </div>
                          <div className="text-gray-900 font-medium">
                            Account Verified
                          </div>
                          <p className="text-sm text-gray-600">
                            Account verification completed
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Activity Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-xl font-bold text-blue-900">15</div>
                        <div className="text-sm text-blue-700">Logins (30 days)</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-xl font-bold text-green-900">3</div>
                        <div className="text-sm text-green-700">Profile Updates</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <div className="text-xl font-bold text-purple-900">0</div>
                        <div className="text-sm text-purple-700">Jobs Posted</div>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4 text-center">
                        <div className="text-xl font-bold text-yellow-900">98%</div>
                        <div className="text-sm text-yellow-700">Profile Complete</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Account Age</span>
                  <span className="font-medium text-gray-900">
                    {Math.floor((new Date() - new Date(company.createdAt)) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Profile Completion</span>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 mr-2">98%</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Employee Count</span>
                  <span className="font-medium text-gray-900">
                    {profile?.employeeCount || '250'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Services Offered</span>
                  <span className="font-medium text-gray-900">
                    {profile?.servicesOffered?.length || '3'}
                  </span>
                </div>
              </div>
            </div>

            {/* Admin Notes */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Admin Notes
              </h3>
              <div className="space-y-3">
                <textarea
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add notes about this company..."
                  defaultValue={company.adminNotes || ''}
                />
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Save Notes
                </button>
              </div>
            </div>

            {/* System Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                System Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Company ID:</span>
                  <span className="font-mono text-gray-900 truncate ml-2" title={company._id}>
                    {company._id?.substring(0, 8) || 'N/A'}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Profile ID:</span>
                  <span className="font-mono text-gray-900 truncate ml-2" title={profile?._id}>
                    {profile?._id?.substring(0, 8) || 'N/A'}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Registration Date:</span>
                  <span className="text-gray-900">
                    {formatDate(company.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Updated:</span>
                  <span className="text-gray-900">
                    {company.updatedAt ? formatDate(company.updatedAt) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
                <FaExclamationTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                {actionType === 'remove' 
                  ? 'Remove Company' 
                  : actionType === 'suspend'
                  ? 'Suspend Company'
                  : 'Activate Company'
                }
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Are you sure you want to {actionType} <strong>{company.companyName}</strong>?
                {actionType === 'suspend' && " This will prevent the company from accessing their account."}
                {actionType === 'activate' && " This will restore company access to their account."}
                {actionType === 'remove' && " This action cannot be undone. All company data will be permanently deleted."}
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
                    actionType === 'remove'
                      ? 'bg-red-600 hover:bg-red-700'
                      : actionType === 'suspend'
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-green-600 hover:bg-green-700'
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

export default CompanyProfileView;