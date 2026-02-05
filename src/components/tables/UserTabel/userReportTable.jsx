// components/UserReportTable.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReports, updateReportAction } from "../../../Services/ReportServices/reportService";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaEye,
  FaDownload,
  FaFilter,
  FaSync,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaChevronDown,
  FaImage,
  FaVideo,
  FaPlay,
  FaUser,
  FaExclamationTriangle,
  FaClock,
  FaFlag,
  FaUserCircle,
  FaBullhorn,
  FaComments,
  FaShieldAlt
} from "react-icons/fa";

// Default profile picture URLs
const DEFAULT_AVATARS = {
  male: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face",
  female: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
  default: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&crop=face",
};

// Helper function to get default avatar based on username
const getDefaultAvatar = (username = "") => {
  const lowerUsername = username.toLowerCase();

  if (lowerUsername.includes('john') || lowerUsername.includes('james') ||
    lowerUsername.includes('mike') || lowerUsername.includes('david') ||
    lowerUsername.includes('chris') || lowerUsername.includes('tom')) {
    return DEFAULT_AVATARS.male;
  } else if (lowerUsername.includes('sarah') || lowerUsername.includes('emma') ||
    lowerUsername.includes('lisa') || lowerUsername.includes('natalie') ||
    lowerUsername.includes('jennifer') || lowerUsername.includes('sophia')) {
    return DEFAULT_AVATARS.female;
  }

  return DEFAULT_AVATARS.default;
};

// Helper function to get user initials
const getUserInitials = (username = "") => {
  if (!username || typeof username !== 'string') return "U";

  const parts = username.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return username[0]?.toUpperCase() || "U";
};

export default function UserFeedReportTable() {
  const [selectedStatus, setSelectedStatus] = useState({});
  const [mediaToView, setMediaToView] = useState(null);
  const [statusChanged, setStatusChanged] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [reportTypeFilter, setReportTypeFilter] = useState("all");
  const [targetTypeFilter, setTargetTypeFilter] = useState("all");
  const [viewDetails, setViewDetails] = useState(null);
  const [showRejected, setShowRejected] = useState(false);

  const queryClient = useQueryClient();

  // Fetch reports with proper error handling
  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["reports"],
    queryFn: getReports,
    retry: 2,
    staleTime: 30000, // 30 seconds
  });

  // Safely extract reports from API response
  const reports = useMemo(() => {
    try {
      console.log("Raw API Response:", apiResponse);

      // If response is already an array, return it
      if (Array.isArray(apiResponse)) {
        return apiResponse;
      }

      // If response has a data property that's an array
      if (apiResponse?.data && Array.isArray(apiResponse.data)) {
        return apiResponse.data;
      }

      // If response has nested data.data property
      if (apiResponse?.data?.data && Array.isArray(apiResponse.data.data)) {
        return apiResponse.data.data;
      }

      // If response has message but no data (empty state)
      if (apiResponse?.message) {
        console.log("API Message:", apiResponse.message);
        return [];
      }

      // Default empty array
      return [];
    } catch (err) {
      console.error("Error parsing reports:", err);
      return [];
    }
  }, [apiResponse]);

  console.log("Processed reports:", reports);

  // Initialize selectedStatus for each report when data loads
  useEffect(() => {
    if (!reports || !Array.isArray(reports) || reports.length === 0) {
      return;
    }

    const initialStatus = {};
    reports.forEach((report) => {
      if (report && report._id) {
        initialStatus[report._id] = report.status || "Pending";
      }
    });

    setSelectedStatus((prev) => {
      const hasChanged = Object.keys(initialStatus).some(
        (key) => prev[key] !== initialStatus[key]
      );
      return hasChanged ? initialStatus : prev;
    });
  }, [reports]);

  // Mutation to update report status
  const mutation = useMutation({
    mutationFn: ({ reportId, status }) => updateReportAction(reportId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(["reports"]);
      alert("Report status updated successfully!");
    },
    onError: (err) => {
      console.error("Update failed:", err);
      alert("Failed to update report.");
    },
  });

  const handleStatusChange = (reportId, value) => {
    setSelectedStatus((prev) => ({ ...prev, [reportId]: value }));
    setStatusChanged((prev) => ({ ...prev, [reportId]: true }));
  };

  const handleProceed = (reportId) => {
    const status = selectedStatus[reportId];
    if (!status) return;

    mutation.mutate({ reportId, status });
    setStatusChanged((prev) => ({ ...prev, [reportId]: false }));
  };

  // Status functions
  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-50 text-gray-700 border border-gray-200';

    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'reviewed':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'action taken':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return <FaFlag className="w-3 h-3" />;

    switch (status.toLowerCase()) {
      case 'pending': return <FaClock className="w-3 h-3" />;
      case 'reviewed': return <FaEye className="w-3 h-3" />;
      case 'action taken': return <FaCheckCircle className="w-3 h-3" />;
      case 'rejected': return <FaTimesCircle className="w-3 h-3" />;
      default: return <FaFlag className="w-3 h-3" />;
    }
  };

  const getTypeIcon = (type) => {
    if (!type) return <FaFlag className="text-gray-500 w-4 h-4" />;

    const lowerType = type.toLowerCase();
    if (lowerType.includes('bullying') || lowerType.includes('harassment')) {
      return <FaExclamationTriangle className="text-red-500 w-4 h-4" />;
    } else if (lowerType.includes('inappropriate')) {
      return <FaShieldAlt className="text-orange-500 w-4 h-4" />;
    } else if (lowerType.includes('spam')) {
      return <FaBullhorn className="text-yellow-500 w-4 h-4" />;
    } else if (lowerType.includes('impersonation')) {
      return <FaUser className="text-purple-500 w-4 h-4" />;
    } else if (lowerType.includes('copyright')) {
      return <FaExclamationTriangle className="text-blue-500 w-4 h-4" />;
    }
    return <FaFlag className="text-gray-500 w-4 h-4" />;
  };

  const getTargetTypeIcon = (targetType) => {
    if (!targetType) return <FaFlag className="text-gray-500 w-4 h-4" />;

    switch (targetType.toLowerCase()) {
      case 'feed': return <FaImage className="text-blue-500 w-4 h-4" />;
      case 'user': return <FaUser className="text-green-500 w-4 h-4" />;
      case 'comment': return <FaComments className="text-purple-500 w-4 h-4" />;
      default: return <FaFlag className="text-gray-500 w-4 h-4" />;
    }
  };

  // Filter reports
  const filteredReports = useMemo(() => {
    if (!reports || !Array.isArray(reports)) return [];

    return reports.filter(report => {
      if (!report || typeof report !== 'object') return false;

      // Filter by rejected status
      if (showRejected && report.status !== "Rejected") return false;
      if (!showRejected && report.status === "Rejected") return false;

      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          (report.reportedBy?.userName?.toLowerCase() || '').includes(searchLower) ||
          (report.reportedTo?.userName?.toLowerCase() || '').includes(searchLower) ||
          (report.type?.toLowerCase() || '').includes(searchLower) ||
          (report._id?.toLowerCase() || '').includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Filter by report type
      if (reportTypeFilter !== "all" && report.type !== reportTypeFilter) {
        return false;
      }

      // Filter by target type
      if (targetTypeFilter !== "all" && report.targetType !== targetTypeFilter) {
        return false;
      }

      return true;
    });
  }, [reports, searchTerm, reportTypeFilter, targetTypeFilter, showRejected]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch (err) {
      return 'Invalid Date';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return '';
    }
  };

  // StatusBadge component
  const StatusBadge = ({ status }) => (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {getStatusIcon(status)}
      <span>{status || "Unknown"}</span>
    </div>
  );

  // Helper function to get first description from answers
  const getFirstDescription = (report) => {
    if (!report) return "No description available";

    if (Array.isArray(report.answers) && report.answers.length > 0) {
      const firstAnswer = report.answers[0];
      return firstAnswer.selectedOption || firstAnswer.questionText || "No description";
    }
    return "No description available";
  };

  // Component for user avatar with fallback
  const UserAvatar = ({ user, alt = "User" }) => {
    const [imgError, setImgError] = useState(false);

    if (!user || typeof user !== 'object') {
      return (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-medium text-sm">
          ?
        </div>
      );
    }

    const defaultAvatar = getDefaultAvatar(user?.userName);
    const initials = getUserInitials(user?.userName);

    return (
      <div className="relative">
        {(!user?.avatar || imgError) ? (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
            {initials}
          </div>
        ) : (
          <img
            src={user.avatar}
            alt={alt}
            className="w-8 h-8 rounded-full object-cover"
            onError={() => setImgError(true)}
          />
        )}
      </div>
    );
  };

  // Component for larger user avatar in modal
  const LargeUserAvatar = ({ user, alt = "User" }) => {
    const [imgError, setImgError] = useState(false);

    if (!user || typeof user !== 'object') {
      return (
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-medium text-base">
          ?
        </div>
      );
    }

    const defaultAvatar = getDefaultAvatar(user?.userName);
    const initials = getUserInitials(user?.userName);

    return (
      <div className="relative">
        {(!user?.avatar || imgError) ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-base">
            {initials}
          </div>
        ) : (
          <img
            src={user.avatar}
            alt={alt}
            className="w-10 h-10 rounded-full object-cover"
            onError={() => setImgError(true)}
          />
        )}
      </div>
    );
  };

  // Get unique report types for filter dropdown
  const uniqueReportTypes = useMemo(() => {
    if (!reports || !Array.isArray(reports)) return ["all"];

    const types = ["all"];
    reports.forEach(report => {
      if (report.type && !types.includes(report.type)) {
        types.push(report.type);
      }
    });
    return types;
  }, [reports]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Content Reports</h1>
              <p className="text-gray-600 mt-1">Manage and review reported content</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-red-500 text-lg font-medium mb-2">Failed to fetch reports.</p>
            <p className="text-gray-600 mb-4">Error: {error?.message || "Please check your connection or try again later."}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">


      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Content Reports</h1>
            <p className="text-gray-600 mt-1">Manage and review reported content ({reports.length} total)</p>
          </div>
          <div className="flex items-center gap-3">

            <button
              onClick={() => alert("Export feature would download CSV file")}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <FaDownload className="w-4 h-4" /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Filters Bar */}
        <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search reports by user, type, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="w-full md:w-48">
              <select
                value={reportTypeFilter}
                onChange={(e) => setReportTypeFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {uniqueReportTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type === "all" ? "All Report Types" : type}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Type Filter */}
            <div className="w-full md:w-48">
              <select
                value={targetTypeFilter}
                onChange={(e) => setTargetTypeFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Target Types</option>
                <option value="Feed">Feeds</option>
                <option value="User">Users</option>
                <option value="Comment">Comments</option>
              </select>
            </div>

            {/* Toggle Rejected */}
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={showRejected}
                    onChange={() => setShowRejected(!showRejected)}
                    className="sr-only"
                  />
                  <div className={`block w-12 h-6 rounded-full transition-colors ${showRejected ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showRejected ? 'transform translate-x-6' : ''}`}></div>
                </div>
                <span className="ml-3 text-sm text-gray-700">
                  Show Rejected
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Reporter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Reported User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Reported
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <FaSearch className="text-gray-400 text-2xl" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No reports found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <motion.tr
                      key={report._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Content */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getTargetTypeIcon(report.targetType)}
                          <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {report.targetType || "Unknown"}
                          </span>
                          {report.target?.contentUrl && (
                            <div
                              className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 cursor-pointer ml-auto"
                              onClick={() => setMediaToView({
                                url: report.target.contentUrl,
                                type: report.target.contentUrl?.match(/\.(mp4|mov|webm|ogg)$/i) ? 'video' : 'image'
                              })}
                            >
                              {report.target.contentUrl?.match(/\.(mp4|mov|webm|ogg)$/i) ? (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                  <FaVideo className="text-blue-500 w-6 h-6" />
                                </div>
                              ) : (
                                <img
                                  src={report.target.contentUrl}
                                  alt="Content"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/default-image.png";
                                  }}
                                />
                              )}
                            </div>
                          )}
                        </div>
                        {report.target?.commentText && (
                          <p className="text-xs text-gray-500 mt-2 truncate max-w-[150px]">
                            "{report.target.commentText}"
                          </p>
                        )}
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(report.type)}
                          <span className="text-sm font-medium text-gray-900">{report.type || "Unknown"}</span>
                        </div>
                      </td>

                      {/* Reporter */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            user={report.reportedBy}
                            alt={report.reportedBy?.userName || "Reporter"}
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {report.reportedBy?.userName || "Unknown"}
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-[120px]">
                              ID: {report.reportedBy?._id?.slice(0, 8) || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Reported User */}
                      <td className="px-6 py-4">
                        {report.reportedTo ? (
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              user={report.reportedTo}
                              alt={report.reportedTo?.userName || "Reported User"}
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {report.reportedTo?.userName || "Unknown"}
                              </div>
                              <div className="text-xs text-gray-500 truncate max-w-[120px]">
                                ID: {report.reportedTo?._id?.slice(0, 8) || "N/A"}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400 italic">Not specified</div>
                        )}
                      </td>

                      {/* Description */}
                      <td className="px-6 py-4">
                        <div className="max-w-[200px]">
                          <div className="text-sm text-gray-700 line-clamp-2">
                            {getFirstDescription(report)}
                          </div>
                          {Array.isArray(report.answers) && report.answers.length > 1 && (
                            <button
                              onClick={() => setViewDetails(report)}
                              className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                            >
                              +{report.answers.length - 1} more
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {/* Current Status Badge */}
                          <div className="flex items-center gap-2">
                            <StatusBadge status={report.status || "Pending"} />
                          </div>

                          {/* Status Change Dropdown */}
                          <div className="relative">
                            <select
                              value={selectedStatus[report._id] || report.status || ""}
                              onChange={(e) => handleStatusChange(report._id, e.target.value)}
                              className="w-28 text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Reviewed">Reviewed</option>
                              <option value="Action Taken">Action Taken</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                            <FaChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none" />
                          </div>

                          {/* Update Button */}
                          {statusChanged[report._id] && (
                            <button
                              onClick={() => handleProceed(report._id)}
                              disabled={mutation.isLoading}
                              className="w-28 text-xs bg-blue-600 text-white py-1.5 rounded hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {mutation.isLoading ? "Updating..." : "Update Status"}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Reported */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">
                            {report.createdAt ? formatDate(report.createdAt) : "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {report.createdAt ? formatTime(report.createdAt) : ""}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewDetails(report)}
                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              handleStatusChange(report._id, "Action Taken");
                              handleProceed(report._id);
                            }}
                            disabled={mutation.isLoading}
                            className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Take Action"
                          >
                            <FaCheckCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing <span className="font-semibold">{filteredReports.length}</span> of{" "}
                <span className="font-semibold">{reports.length}</span> reports
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-700">
                  Page 1 of 1
                </div>
                <div className="flex gap-1">
                  <button className="px-3 py-1.5 border border-gray-300 rounded-l-lg hover:bg-gray-50 text-sm transition-colors">
                    Previous
                  </button>
                  <button className="px-3 py-1.5 border border-gray-300 rounded-r-lg hover:bg-gray-50 text-sm transition-colors">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Modal */}
      <AnimatePresence>
        {mediaToView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setMediaToView(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setMediaToView(null)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <FaTimesCircle className="text-2xl" />
              </button>
              <div className="bg-gray-900 rounded-xl overflow-hidden">
                {mediaToView.type === 'image' ? (
                  <img
                    src={mediaToView.url}
                    alt="Content"
                    className="w-full h-auto max-h-[70vh] object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default-image.png";
                    }}
                  />
                ) : (
                  <video
                    src={mediaToView.url}
                    controls
                    autoPlay
                    className="w-full max-h-[70vh]"
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {viewDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setViewDetails(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Report Details</h3>
                    <p className="text-sm text-gray-600">Report ID: {viewDetails._id}</p>
                  </div>
                  <button
                    onClick={() => setViewDetails(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaTimesCircle className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-6">
                  {/* Report Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 mb-2">Type</p>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(viewDetails.type)}
                        <p className="font-medium text-gray-900">{viewDetails.type || "Unknown"}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 mb-2">Target Type</p>
                      <div className="flex items-center gap-2">
                        {getTargetTypeIcon(viewDetails.targetType)}
                        <p className="font-medium text-gray-900">{viewDetails.targetType || "Unknown"}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 mb-2">Status</p>
                      <StatusBadge status={viewDetails.status || "Pending"} />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 mb-2">Reported</p>
                      <p className="font-medium text-gray-900">
                        {viewDetails.createdAt ? formatDate(viewDetails.createdAt) : "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {viewDetails.createdAt ? formatTime(viewDetails.createdAt) : ""}
                      </p>
                    </div>
                  </div>

                  {/* Users */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Involved Users</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-2">Reporter</p>
                        <div className="flex items-center gap-3">
                          <LargeUserAvatar
                            user={viewDetails.reportedBy}
                            alt={viewDetails.reportedBy?.userName || "Reporter"}
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {viewDetails.reportedBy?.userName || "Unknown"}
                            </p>
                            <p className="text-sm text-gray-500">
                              ID: {viewDetails.reportedBy?._id?.slice(0, 8) || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-2">Reported User</p>
                        {viewDetails.reportedTo ? (
                          <div className="flex items-center gap-3">
                            <LargeUserAvatar
                              user={viewDetails.reportedTo}
                              alt={viewDetails.reportedTo?.userName || "Reported User"}
                            />
                            <div>
                              <p className="font-medium text-gray-900">
                                {viewDetails.reportedTo?.userName || "Unknown"}
                              </p>
                              <p className="text-sm text-gray-500">
                                ID: {viewDetails.reportedTo?._id?.slice(0, 8) || "N/A"}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-400 italic">Not specified</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content Preview */}
                  {viewDetails.target?.contentUrl && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Reported Content</h4>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div
                          className="w-full h-48 rounded-lg overflow-hidden cursor-pointer mb-3"
                          onClick={() => setMediaToView({
                            url: viewDetails.target.contentUrl,
                            type: viewDetails.target.contentUrl?.match(/\.(mp4|mov|webm|ogg)$/i) ? 'video' : 'image'
                          })}
                        >
                          {viewDetails.target.contentUrl?.match(/\.(mp4|mov|webm|ogg)$/i) ? (
                            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                              <FaPlay className="text-white w-12 h-12" />
                            </div>
                          ) : (
                            <img
                              src={viewDetails.target.contentUrl}
                              alt="Content"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/default-image.png";
                              }}
                            />
                          )}
                        </div>
                        {viewDetails.target?.commentText && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-1">Comment:</p>
                            <p className="text-gray-900 bg-white p-3 rounded border">
                              "{viewDetails.target.commentText}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Report Details</h4>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      {Array.isArray(viewDetails.answers) && viewDetails.answers.length > 0 ? (
                        viewDetails.answers.map((answer, index) => (
                          <div key={index} className="mb-4 last:mb-0">
                            <p className="text-sm text-gray-600 mb-1">{answer.questionText || "Question"}</p>
                            <p className="font-medium text-gray-900 bg-white p-2 rounded border">
                              {answer.selectedOption || "No answer"}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No details available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setViewDetails(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleStatusChange(viewDetails._id, "Action Taken");
                      handleProceed(viewDetails._id);
                      setViewDetails(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Take Action
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}