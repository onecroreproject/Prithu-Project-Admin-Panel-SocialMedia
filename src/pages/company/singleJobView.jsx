import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../Utils/axiosApi";
import { 
  FiChevronLeft, FiBriefcase, FiMapPin, FiDollarSign, 
  FiUsers, FiCalendar, FiAward, FiCode, FiCheck,
  FiMail, FiPhone, FiGlobe, FiHome, FiClock, 
  FiNavigation, FiFlag, FiTag, FiUser, FiLayers
} from "react-icons/fi";

const SingleJobView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!id) {
        setError("No job ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/admin/get/job/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log("Job data response:", response.data);
        
        if (response.data.success) {
          // Parse stringified data
          const parsedJobData = parseStringifiedData(response.data.job);
          setJobData(parsedJobData);
        } else {
          setError(response.data.message || "Failed to fetch job details");
        }
      } catch (err) {
        console.error("Error fetching job details:", err);
        if (err.response) {
          setError(err.response.data?.message || `Server error: ${err.response.status}`);
        } else if (err.request) {
          setError("No response from server. Please check your connection.");
        } else {
          setError(err.message || "Failed to fetch job details");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  // Helper function to parse stringified JSON data
  const parseStringifiedData = (job) => {
    const newJob = { ...job };
    
    // Parse social links - handle both array and object/string cases
    if (newJob.companyProfile?.socialLinks) {
      const socialLinks = newJob.companyProfile.socialLinks;
      
      // If it's a string, try to parse it
      if (typeof socialLinks === 'string') {
        try {
          newJob.companyProfile.socialLinks = JSON.parse(socialLinks);
        } catch (e) {
          console.warn('Failed to parse socialLinks string:', e);
          newJob.companyProfile.socialLinks = {};
        }
      }
      // If it's an array, process each item
      else if (Array.isArray(socialLinks)) {
        newJob.companyProfile.socialLinks = socialLinks.map(link => {
          if (typeof link === 'string') {
            try {
              return JSON.parse(link);
            } catch (e) {
              console.warn('Failed to parse socialLinks array item:', e);
              return {};
            }
          }
          return link;
        });
      }
      // If it's already an object, leave as is
      else if (typeof socialLinks === 'object') {
        // Already parsed or is object
      }
    }
    
    // Helper function to parse array fields that might contain stringified JSON
    const parseField = (field) => {
      if (!field) return field;
      
      // If it's a string, try to parse it
      if (typeof field === 'string') {
        try {
          const parsed = JSON.parse(field);
          // If the parsed result is also a string, it might be double-encoded
          if (typeof parsed === 'string') {
            try {
              return JSON.parse(parsed);
            } catch {
              return parsed;
            }
          }
          return parsed;
        } catch {
          return field;
        }
      }
      // If it's an array, process each item
      else if (Array.isArray(field)) {
        return field.map(item => {
          if (typeof item === 'string') {
            try {
              return JSON.parse(item);
            } catch {
              return item;
            }
          }
          return item;
        });
      }
      return field;
    };
    
    // Parse other company profile fields
    if (newJob.companyProfile) {
      const fieldsToParse = ['awards', 'clients', 'servicesOffered', 'hiringProcess'];
      fieldsToParse.forEach(field => {
        if (newJob.companyProfile[field]) {
          newJob.companyProfile[field] = parseField(newJob.companyProfile[field]);
        }
      });
      
      // Handle googleLocation which appears to be an array of strings
      if (newJob.companyProfile.googleLocation && Array.isArray(newJob.companyProfile.googleLocation)) {
        newJob.companyProfile.googleLocation = newJob.companyProfile.googleLocation.map(loc => {
          if (typeof loc === 'string') {
            try {
              return JSON.parse(loc);
            } catch {
              return loc;
            }
          }
          return loc;
        });
      }
    }
    
    // Clean up any nested stringified arrays
    const cleanNestedArrays = (obj) => {
      if (!obj || typeof obj !== 'object') return obj;
      
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string' && 
            (obj[key].startsWith('["') || obj[key].startsWith('[\\"'))) {
          try {
            obj[key] = JSON.parse(obj[key]);
            // If result is an array of strings that look like JSON, parse them too
            if (Array.isArray(obj[key])) {
              obj[key] = obj[key].map(item => {
                if (typeof item === 'string' && 
                    (item.startsWith('{"') || item.startsWith('[{"'))) {
                  try {
                    return JSON.parse(item);
                  } catch {
                    return item;
                  }
                }
                return item;
              });
            }
          } catch {
            // Leave as is if parsing fails
          }
        } else if (Array.isArray(obj[key])) {
          obj[key] = obj[key].map(cleanNestedArrays);
        } else if (typeof obj[key] === 'object') {
          obj[key] = cleanNestedArrays(obj[key]);
        }
      });
      
      return obj;
    };
    
    return cleanNestedArrays(newJob);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Safely render social links
  const renderSocialLinks = (socialLinks) => {
    if (!socialLinks) return null;
    
    let linksToRender = socialLinks;
    
    // If it's an array, use the first item
    if (Array.isArray(socialLinks) && socialLinks.length > 0) {
      linksToRender = socialLinks[0];
    }
    
    // If it's an object, render the links
    if (typeof linksToRender === 'object' && linksToRender !== null) {
      return (
        <div className="space-y-2">
          {Object.entries(linksToRender).map(([platform, url]) => (
            url && typeof url === 'string' && (
              <div key={platform} className="flex items-center gap-2">
                <span className="text-sm text-gray-600 capitalize w-24">{platform}:</span>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 truncate"
                >
                  {url.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )
          ))}
        </div>
      );
    }
    
    return <p className="text-gray-500 italic">No social links available</p>;
  };

  // Function to safely render HTML content
  const renderHTML = (htmlString) => {
    if (!htmlString) return null;
    
    try {
      // Clean and format the HTML
      const cleanHTML = htmlString
        .replace(/<div><br><\/div>/g, '<br>')
        .replace(/<div><\/div>/g, '')
        .replace(/<div>(.*?)<\/div>/g, '<p>$1</p>')
        .replace(/<p><br><\/p>/g, '<br>')
        .replace(/•/g, '•'); // Ensure bullet points display correctly
      
      return { __html: cleanHTML };
    } catch (error) {
      console.error('Error rendering HTML:', error);
      return { __html: htmlString };
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <FiChevronLeft />
            Back
          </button>
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Job</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!jobData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <FiChevronLeft />
            Back
          </button>
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <p className="text-gray-600">No job data found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <FiChevronLeft className="group-hover:-translate-x-1 transition-transform" />
          Back to Jobs
        </button>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header Card */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      jobData.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {jobData.status || 'inactive'}
                    </span>
                    {jobData.urgencyLevel && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        jobData.urgencyLevel === 'immediate'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {jobData.urgencyLevel}
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {jobData.jobTitle || 'No Title'}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-600">
                    <span className="flex items-center gap-1">
                      <FiBriefcase className="text-sm" />
                      {jobData.jobIndustry || 'Industry not specified'}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiMapPin className="text-sm" />
                      {[jobData.area, jobData.city, jobData.state, jobData.country]
                        .filter(Boolean)
                        .join(', ') || 'Location not specified'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(jobData.salaryMin)} - {formatCurrency(jobData.salaryMax)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Per {jobData.salaryType} • {jobData.salaryCurrency}
                    </p>
                  </div>
                </div>
              </div>

              {/* Job Roles */}
              {jobData.jobRole && jobData.jobRole.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Job Roles</h3>
                  <div className="flex flex-wrap gap-2">
                    {jobData.jobRole.map((role, index) => (
                      <span key={index} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-gray-200 pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{jobData.openingsCount || 0}</div>
                  <div className="text-sm text-gray-600">Openings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{jobData.applyCount || 0}</div>
                  <div className="text-sm text-gray-600">Applications</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{jobData.viewCount || 0}</div>
                  <div className="text-sm text-gray-600">Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{jobData.saveCount || 0}</div>
                  <div className="text-sm text-gray-600">Saved</div>
                </div>
              </div>
            </div>

            {/* Job Details Sections */}
            <div className="space-y-6">
              {/* Job Description */}
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiBriefcase />
                  Job Description
                </h2>
                {jobData.jobDescription ? (
                  <div 
                    className="prose max-w-none text-gray-700"
                    dangerouslySetInnerHTML={renderHTML(jobData.jobDescription)}
                  />
                ) : (
                  <p className="text-gray-500 italic">No description provided</p>
                )}
              </div>

              {/* Requirements Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Required Skills */}
                {jobData.requiredSkills && jobData.requiredSkills.length > 0 && (
                  <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FiCode />
                      Required Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {jobData.requiredSkills.map((skill, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Qualifications */}
                {jobData.qualifications && jobData.qualifications.length > 0 && (
                  <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FiAward />
                      Qualifications
                    </h2>
                    <ul className="space-y-3">
                      {jobData.qualifications.map((qual, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                          <div>
                            <span className="font-medium text-gray-900">{qual.educationLevel}</span>
                            {qual.course && qual.course.trim() && (
                              <span className="text-gray-700"> - {qual.course}</span>
                            )}
                            {qual.specialization && qual.specialization.trim() && (
                              <p className="text-sm text-gray-600 mt-1">Specialization: {qual.specialization}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Experience */}
                <div className="bg-white rounded-xl shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Experience</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Minimum:</span>
                      <span className="font-medium">{jobData.minimumExperience || 0} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Maximum:</span>
                      <span className="font-medium">{jobData.maximumExperience || 0} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Freshers Allowed:</span>
                      <span className={`font-medium ${jobData.freshersAllowed ? 'text-green-600' : 'text-red-600'}`}>
                        {jobData.freshersAllowed ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                {jobData.benefits && jobData.benefits.length > 0 && (
                  <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Benefits</h2>
                    <ul className="space-y-2">
                      {jobData.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-700">
                          <FiCheck className="text-green-500" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Job Settings */}
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Job Settings</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Employment Type</p>
                    <p className="font-medium capitalize">{jobData.employmentType?.replace('-', ' ') || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Work Mode</p>
                    <p className="font-medium capitalize">{jobData.workMode || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Shift Type</p>
                    <p className="font-medium capitalize">{jobData.shiftType || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Remote Eligibility</p>
                    <p className={`font-medium ${jobData.remoteEligibility ? 'text-green-600' : 'text-red-600'}`}>
                      {jobData.remoteEligibility ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="font-medium">{formatDate(jobData.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">End Date</p>
                    <p className="font-medium">{formatDate(jobData.endDate)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Company & Hiring Info */}
          <div className="space-y-6">
            {/* Company Profile */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiHome />
                Company Details
              </h2>
              
              {jobData.companyProfile ? (
                <div className="space-y-4">
                  {/* Company Header */}
                  <div className="flex items-start gap-4">
                    {jobData.companyProfile.logo && (
                      <img 
                        src={jobData.companyProfile.logo} 
                        alt="Company logo"
                        className="w-16 h-16 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {jobData.companyProfile.companyEmail?.split('@')[0] || 'Company'}
                      </h3>
                      <p className="text-sm text-gray-600">{jobData.companyProfile.businessCategory || 'Business Category'}</p>
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-700">
                      <FiMail className="text-gray-400" />
                      <span className="text-sm truncate">{jobData.companyProfile.companyEmail || 'No email'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <FiPhone className="text-gray-400" />
                      <span className="text-sm">{jobData.companyProfile.companyPhone || 'No phone'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <FiMapPin className="text-gray-400" />
                      <span className="text-sm">{jobData.companyProfile.address || 'No address'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <FiUsers className="text-gray-400" />
                      <span className="text-sm">{jobData.companyProfile.employeeCount || 0} employees</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <FiCalendar className="text-gray-400" />
                      <span className="text-sm">Est. {jobData.companyProfile.yearEstablished || 'N/A'}</span>
                    </div>
                    {jobData.companyProfile.workingDays && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <FiClock className="text-gray-400" />
                        <span className="text-sm">{jobData.companyProfile.workingDays}</span>
                      </div>
                    )}
                    {jobData.companyProfile.workingHours && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <FiClock className="text-gray-400" />
                        <span className="text-sm">{jobData.companyProfile.workingHours} hours/day</span>
                      </div>
                    )}
                  </div>

                  {/* Company Description */}
                  {jobData.companyProfile.description && (
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">About Company</h4>
                      <p className="text-sm text-gray-600 line-clamp-4">{jobData.companyProfile.description}</p>
                    </div>
                  )}

                  {/* Social Links */}
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Social Links</h4>
                    {renderSocialLinks(jobData.companyProfile.socialLinks)}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No company profile available</p>
              )}
            </div>

            {/* Hiring Information */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiUser />
                Hiring Contact
              </h2>
              
              {jobData.hiringInfo ? (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Contact Person</p>
                      <p className="font-medium">{jobData.hiringInfo.name || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Position</p>
                      <p className="font-medium">{jobData.hiringInfo.position || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <a 
                        href={`mailto:${jobData.hiringInfo.email}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {jobData.hiringInfo.email || 'Not specified'}
                      </a>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <a 
                        href={`tel:${jobData.hiringInfo.phone}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {jobData.hiringInfo.phone || 'Not specified'}
                      </a>
                    </div>
                    {jobData.hiringInfo.whatsAppNumber && (
                      <div>
                        <p className="text-sm text-gray-600">WhatsApp</p>
                        <a 
                          href={`https://wa.me/${jobData.hiringInfo.whatsAppNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          {jobData.hiringInfo.whatsAppNumber}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No hiring information available</p>
              )}
            </div>

            {/* Job Metadata */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiLayers />
                Job Metadata
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Job ID:</span>
                  <span className="font-mono text-sm truncate ml-2">{jobData.jobId || jobData._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Company ID:</span>
                  <span className="font-mono text-sm truncate ml-2">{jobData.companyId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="text-sm">{formatDate(jobData.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="text-sm">{formatDate(jobData.updatedAt)}</span>
                </div>
                {jobData.fullAddress && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Address:</p>
                    <p className="text-sm">{jobData.fullAddress}</p>
                  </div>
                )}
                {jobData.pincode && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pincode:</span>
                    <span className="text-sm">{jobData.pincode}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleJobView;