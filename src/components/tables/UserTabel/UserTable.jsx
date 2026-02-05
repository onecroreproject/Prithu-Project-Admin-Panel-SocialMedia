import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  Trash2,
  User,
  Check,
  AlertCircle,
  Ban,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  CheckCircle,
  FileDown,
  Calendar,
  Clock,
  Phone,
  Shield,
  Users,
  ChevronsLeft,
  ChevronsRight,
  X,
  Eye,
  FileText
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { fetchUsers, searchUsers, deleteUser, blockUser } from "../../../Services/UserServices/userServices";
import { exportToCSV } from "../../../Utils/exportUtils";

// Pagination hook
function usePagination(items = [], itemsPerPage = 10) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const currentItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return items.slice(start, end);
  }, [items, page, itemsPerPage]);

  const nextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const resetPage = () => setPage(1);

  const goToPage = (pageNumber) => {
    const newPage = Math.max(1, Math.min(pageNumber, totalPages));
    setPage(newPage);
  };

  return {
    page,
    totalPages,
    currentItems,
    nextPage,
    prevPage,
    resetPage,
    goToPage,
    setPage,
  };
}

export default function UserTable({ externalFilter, onClearExternalFilter }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [filters, setFilters] = useState({
    status: {
      active: true,
      inactive: true,
      blocked: false,
      suspended: false
    },
    gender: "all",
    registered: "all",
    lastActive: "all",
    subscription: "all"
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterNotification, setFilterNotification] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [trialStatusFilter, setTrialStatusFilter] = useState("all");

  // Track previous state to detect changes
  const prevSearchQueryRef = useRef("");
  const prevFiltersRef = useRef(filters);

  // Fetch all users
  const { data: users = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 1000 * 60 * 5,
  });

  // Search users
  const searchMutation = useMutation({
    mutationFn: searchUsers,
    onSuccess: (data) => {
      setSearchResults(data.users || []);
      setIsSearching(false);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Search failed");
      setIsSearching(false);
      setSearchResults([]);
    },
  });

  // Handle search on input change (debounced)
  useEffect(() => {
    const query = searchQuery.trim();

    if (query === "") {
      clearSearch();
      return;
    }

    const timeoutId = setTimeout(() => {
      setIsSearching(true);
      searchMutation.mutate(query);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
  }, []);

  // Apply filters to data
  const applyFilters = useCallback((data) => {
    return data.filter(user => {
      // Status filter
      const statusFilters = filters.status;
      const userStatus = user.isBlocked ? "blocked" :
        user.isOnline ? "active" : "inactive";

      if (!statusFilters[userStatus] && userStatus !== "suspended") {
        return false;
      }

      // Gender filter
      if (filters.gender !== "all" && user.gender !== filters.gender) {
        return false;
      }

      // Registered date filter
      if (filters.registered !== "all") {
        const userCreatedAt = new Date(user.createdAt);
        const now = new Date();
        let daysAgo;

        switch (filters.registered) {
          case "7days":
            daysAgo = 7;
            break;
          case "30days":
            daysAgo = 30;
            break;
          case "90days":
            daysAgo = 90;
            break;
          default:
            return true;
        }

        const daysDiff = Math.floor((now - userCreatedAt) / (1000 * 60 * 60 * 24));
        if (daysDiff > daysAgo) {
          return false;
        }
      }

      // Last active filter
      if (filters.lastActive !== "all" && user.lastActiveAt) {
        const lastActive = new Date(user.lastActiveAt);
        const now = new Date();
        let daysAgo;

        switch (filters.lastActive) {
          case "today":
            daysAgo = 1;
            break;
          case "week":
            daysAgo = 7;
            break;
          case "month":
            daysAgo = 30;
            break;
          default:
            return true;
        }

        const daysDiff = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
        if (daysDiff > daysAgo) {
          return false;
        }
      }

      // Subscription filter
      if (filters.subscription !== "all") {
        const isSubscribed = user.subscriptionActive === true;
        if (filters.subscription === "subscribed" && !isSubscribed) {
          return false;
        }
        if (filters.subscription === "free" && isSubscribed) {
          return false;
        }
      }

      // Trial Status filter
      if (trialStatusFilter !== "all") {
        if (trialStatusFilter === "Used") {
          if (user.trialStatus === "Not Used") return false;
        } else if (user.trialStatus !== trialStatusFilter) {
          return false;
        }
      }

      return true;
    });
  }, [filters, trialStatusFilter]);

  // Calculate filtered data
  const filteredUsers = useMemo(() => {
    // Only fall back to all users if there's no search query
    const dataToFilter = searchQuery.trim() !== "" ? searchResults : users;
    return applyFilters(dataToFilter);
  }, [users, searchResults, searchQuery, applyFilters]);

  // Check if any filters are active
  const isFilterActive = useMemo(() => {
    return (
      filters.gender !== "all" ||
      filters.registered !== "all" ||
      filters.lastActive !== "all" ||
      filters.subscription !== "all" ||
      trialStatusFilter !== "all" ||
      !filters.status.active ||
      !filters.status.inactive ||
      filters.status.blocked ||
      filters.status.suspended
    );
  }, [filters, trialStatusFilter]);

  // Show filter notification
  const showFilterNotification = useCallback((message) => {
    setFilterNotification(message);
    setTimeout(() => {
      setFilterNotification(null);
    }, 3000);
  }, []);

  // Handle filter changes
  const handleStatusChange = (status) => {
    setFilters(prev => ({
      ...prev,
      status: {
        ...prev.status,
        [status]: !prev.status[status]
      }
    }));
    showFilterNotification(`Status filter updated: ${status}`);
  };

  const handleGenderChange = (gender) => {
    setFilters(prev => ({ ...prev, gender }));
    showFilterNotification(`Gender filter: ${gender === "all" ? "All genders" : gender}`);
  };

  const handleRegisteredChange = (period) => {
    setFilters(prev => ({ ...prev, registered: period }));
    showFilterNotification(`Registered date: ${period === "all" ? "All time" : `Last ${period}`}`);
  };

  const handleLastActiveChange = (period) => {
    setFilters(prev => ({ ...prev, lastActive: period }));
    showFilterNotification(`Last active: ${period === "all" ? "Any time" : period}`);
  };

  const handleSubscriptionChange = (type) => {
    setFilters(prev => ({ ...prev, subscription: type }));
    showFilterNotification(`Subscription: ${type === "all" ? "All" : type}`);
  };

  const handleClearAllFilters = () => {
    setFilters({
      status: {
        active: true,
        inactive: true,
        blocked: false,
        suspended: false
      },
      gender: "all",
      registered: "all",
      lastActive: "all",
      subscription: "all"
    });
    setTrialStatusFilter("all");
    showFilterNotification("All filters cleared");
  };

  const handleApplyFilters = () => {
    setIsFilterOpen(false);
    showFilterNotification("Filters applied");
  };

  // Initialize pagination with filtered data
  const {
    page,
    totalPages,
    currentItems,
    nextPage,
    prevPage,
    resetPage,
    goToPage,
    setPage: setPaginationPage,
  } = usePagination(filteredUsers, itemsPerPage);

  // Reset page when data changes or filters/search changes - FIXED VERSION
  useEffect(() => {
    // Check if search query changed
    const searchQueryChanged = searchQuery !== prevSearchQueryRef.current;

    // Check if filters changed (deep comparison)
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify(prevFiltersRef.current);

    if (searchQueryChanged || filtersChanged) {
      resetPage();
    }

    // Update refs
    prevSearchQueryRef.current = searchQuery;
    prevFiltersRef.current = filters;
  }, [searchQuery, filters, trialStatusFilter, resetPage]);

  // Synchronize with external metric filter
  useEffect(() => {
    if (!externalFilter) return;

    // Reset everything first
    handleClearAllFilters();
    clearSearch();

    switch (externalFilter) {
      case "total":
        // Reset everything (handled above)
        break;
      case "online":
        setFilters(prev => ({
          ...prev,
          status: { active: true, inactive: false, blocked: false, suspended: false }
        }));
        break;
      case "subscribed":
        setFilters(prev => ({ ...prev, subscription: "subscribed" }));
        break;
      case "trial":
        setTrialStatusFilter("Used");
        break;
    }
  }, [externalFilter]);

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    resetPage();
  };

  const blockMutation = useMutation({
    mutationFn: blockUser,
    onSuccess: (data, userId) => {
      queryClient.setQueryData(["users"], (oldUsers) =>
        oldUsers.map((u) =>
          u.userId === userId ? { ...u, isBlocked: data.isBlocked } : u
        )
      );
      // Also update search results if user is in search results
      if (searchResults.length > 0) {
        setSearchResults(prev =>
          prev.map((u) =>
            u.userId === userId ? { ...u, isBlocked: data.isBlocked } : u
          )
        );
      }
      toast.success(data.message);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Action failed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: (data, userId) => {
      // Update both main users list and search results
      queryClient.setQueryData(["users"], (oldUsers) =>
        oldUsers.filter((u) => u.userId !== userId)
      );

      if (searchResults.length > 0) {
        setSearchResults(prev => prev.filter((u) => u.userId !== userId));
      }

      // Reset to page 1 if the last item on the current page was deleted
      if (currentItems.length === 1 && page > 1) {
        resetPage();
      }
      toast.success(data.message || "User deleted successfully");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to delete user");
    },
  });

  // Handle Export to CSV
  const handleExport = () => {
    if (!filteredUsers || filteredUsers.length === 0) {
      toast.error("No users found to export");
      return;
    }

    const headers = [
      { label: "Name", key: "userName" },
      { label: "Email", key: "email" },
      { label: "Phone", key: "phoneNumber" },
      { label: "Gender", key: "gender" },
      { label: "Status", key: "status" },
      { label: "Trial Status", key: "trialStatus" },
      { label: "Trial Used", key: "trialUsed" },
      { label: "Online Status", key: "isOnline" },
      { label: "Subscription Active", key: "subscriptionActive" },
      { label: "Registered At", key: "createdAt" },
      { label: "Referral Code", key: "referralCode" },
    ];

    // Map data to handle boolean displays or formatting if needed
    const dataToExport = filteredUsers.map(user => ({
      ...user,
      userName: user.userName || "N/A",
      phoneNumber: user.phone || user.phoneNumber || "N/A",
      gender: user.gender || "N/A",
      referralCode: user.referralCode || user.referalCode || user.referealCode || "N/A",
      status: user.isBlocked ? "Blocked" : (user.isOnline ? "Active" : "Inactive"),
      trialUsed: user.trialUsed ? "Yes" : "No",
      isOnline: user.isOnline ? "Online" : "Offline",
      subscriptionActive: user.subscriptionActive ? "Active" : "Inactive",
      createdAt: formatDate(user.createdAt)
    }));

    exportToCSV(dataToExport, "User_Directory", headers);
    toast.success("Users exported successfully");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTrialStatus = (user) => {
    switch (user.trialStatus) {
      case "Active":
        return { label: "Active", color: "bg-green-100 text-green-800" };
      case "Expired":
        return { label: "Expired", color: "bg-red-100 text-red-800" };
      case "Not Used":
      default:
        return { label: "Not Used", color: "bg-gray-100 text-gray-800" };
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-600 text-sm">Loading users...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-8 text-center">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <Ban className="w-6 h-6 text-red-500" />
        </div>
        <p className="text-red-600 font-medium">Failed to load users</p>
        <p className="text-gray-500 text-sm mt-1">Please try again later</p>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      {/* Filter Notification */}
      {filterNotification && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-700">{filterNotification}</span>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors"
              placeholder="Search by name, email, phone, or referral code..."
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {searchQuery && !isSearching && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${isFilterActive
                ? "border-blue-600 bg-blue-50 text-blue-700 hover:bg-blue-100"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
            >
              <Filter className="w-5 h-5" />
              <span className="text-sm font-medium">Filter</span>
              {isFilterActive && (
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              )}
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            title="Export to CSV"
          >
            <FileDown className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium">Export</span>
          </button>

          {/* Filter Dropdown */}
          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <div className="py-1 max-h-96 overflow-y-auto">
                {/* Active Filters Info */}
                {isFilterActive && (
                  <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-blue-700">Active Filters</span>
                      <button
                        onClick={handleClearAllFilters}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                )}

                {/* Status Filter */}
                <div className="px-4 py-2">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</h4>
                  <div className="space-y-2">
                    {["active", "inactive", "blocked", "suspended"].map((status) => (
                      <label key={status} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded text-blue-600 focus:ring-blue-500"
                          checked={filters.status[status]}
                          onChange={() => handleStatusChange(status)}
                        />
                        <span className="text-sm text-gray-700 capitalize">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100"></div>

                {/* Gender Filter */}
                <div className="px-4 py-2">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Gender</h4>
                  <div className="space-y-2">
                    {["all", "male", "female", "other"].map((gender) => (
                      <label key={gender} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          className="rounded-full text-blue-600 focus:ring-blue-500"
                          checked={filters.gender === gender}
                          onChange={() => handleGenderChange(gender)}
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {gender === "all" ? "All Genders" : gender}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100"></div>

                {/* Registered Date Filter */}
                <div className="px-4 py-2">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Registered Date</h4>
                  <div className="space-y-2">
                    {["all", "7days", "30days", "90days"].map((period) => (
                      <label key={period} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="registered"
                          className="rounded-full text-blue-600 focus:ring-blue-500"
                          checked={filters.registered === period}
                          onChange={() => handleRegisteredChange(period)}
                        />
                        <span className="text-sm text-gray-700">
                          {period === "all" ? "All Time" : `Last ${period.replace("days", " Days")}`}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100"></div>

                {/* Last Active Filter */}
                <div className="px-4 py-2">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Last Active</h4>
                  <div className="space-y-2">
                    {["all", "today", "week", "month"].map((period) => (
                      <label key={period} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="lastActive"
                          className="rounded-full text-blue-600 focus:ring-blue-500"
                          checked={filters.lastActive === period}
                          onChange={() => handleLastActiveChange(period)}
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {period === "all" ? "Any Time" : period === "week" ? "This Week" : period === "month" ? "This Month" : "Today"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100"></div>

                {/* Subscription Filter */}
                <div className="px-4 py-2">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Subscription</h4>
                  <div className="space-y-2">
                    {["all", "subscribed", "free"].map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="subscription"
                          className="rounded-full text-blue-600 focus:ring-blue-500"
                          checked={filters.subscription === type}
                          onChange={() => handleSubscriptionChange(type)}
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {type === "all" ? "All" : type}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100"></div>

                <div className="px-4 py-2">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Trial Status</h4>
                  <div className="space-y-2">
                    {["all", "Used", "Active", "Expired", "Not Used"].map((status) => (
                      <label key={status} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="trialStatus"
                          className="rounded-full text-blue-600 focus:ring-blue-500"
                          checked={trialStatusFilter === status}
                          onChange={() => setTrialStatusFilter(status)}
                        />
                        <span className="text-sm text-gray-700">{status === "all" ? "All" : status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-100"></div>
                <div className="flex gap-2 p-3">
                  <button
                    onClick={handleClearAllFilters}
                    className="flex-1 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={handleApplyFilters}
                    className="flex-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div >

      {/* Search and Filter Status */}
      < div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600" >
        {searchQuery && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded">
            Search: "{searchQuery}"
            <button onClick={clearSearch} className="text-blue-500 hover:text-blue-700">
              <X className="w-3 h-3" />
            </button>
          </span>
        )
        }
        {
          isFilterActive && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded">
              Filters Active
              <button onClick={handleClearAllFilters} className="text-green-500 hover:text-green-700">
                <X className="w-3 h-3" />
              </button>
            </span>
          )
        }
        {
          (searchQuery || isFilterActive) && (
            <span className="text-gray-500">
              Showing {filteredUsers.length} of {users.length} users
            </span>
          )
        }
      </div>

      {/* Table */}
      < div className="overflow-x-auto rounded-lg border border-gray-200" >
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Users
                </div>
              </th>
              {/* Registered Date removed, Last Active moved here */}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Last Active
                </div>
              </th>
              {/* New Trial Status column */}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Trial Status
                </div>
              </th>
              {/* New Mobile column */}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Mobile
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Status
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Gender
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {currentItems.length === 0 ? (
              <tr>
                {/* colSpan updated from 6 to 8 to accommodate new columns */}
                <td colSpan={8} className="px-4 py-12 text-center">
                  <div className="text-gray-500">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="font-medium">No users found</p>
                    <p className="text-sm mt-1">
                      {searchQuery || isFilterActive
                        ? "Try adjusting your search or filters"
                        : "Start by adding your first user"}
                    </p>
                    {(searchQuery || isFilterActive) && (
                      <div className="mt-3 flex gap-2 justify-center">
                        {searchQuery && (
                          <button
                            onClick={clearSearch}
                            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            Clear search
                          </button>
                        )}
                        {isFilterActive && (
                          <button
                            onClick={handleClearAllFilters}
                            className="px-4 py-2 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              currentItems.map((user) => (
                <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                  {/* User Info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {user.profileAvatar ? (
                          <img
                            src={user.profileAvatar}
                            alt={user.userName || "User"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {user.userName || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.email || "No email"}
                        </div>
                        {user.referralCode && (
                          <div className="text-xs text-gray-500 mt-1">
                            Ref: {user.referralCode}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Last Active (moved from original position, now under Calendar icon) */}
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{formatDate(user.lastActiveAt)}</div>
                    {user.lastActiveAt && (
                      <div className="text-xs text-gray-500">{formatTime(user.lastActiveAt)}</div>
                    )}
                  </td>

                  {/* Trial Status (new column) */}
                  <td className="px-4 py-3">
                    {(() => {
                      const status = getTrialStatus(user);
                      return (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      );
                    })()}
                  </td>

                  {/* Mobile Number (new column) */}
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{user.phone || user.phoneNumber || "N/A"}</div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${user.isBlocked ? "bg-red-500" :
                          user.isOnline ? "bg-green-500" :
                            "bg-gray-400"
                          }`}
                      />
                      <span className="text-sm text-gray-700">
                        {user.isBlocked ? "Blocked" :
                          user.isOnline ? "Online" :
                            "Offline"}
                      </span>
                    </div>
                    {typeof user.subscriptionActive === "boolean" && (
                      <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${user.subscriptionActive
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                        }`}>
                        {user.subscriptionActive ? "Subscribed" : "Free"}
                      </div>
                    )}
                  </td>

                  {/* Gender */}
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-700 font-medium">
                      {user.gender || "N/A"}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {/* View Profile */}
                      <button
                        onClick={() => navigate(`/social/individual/user/profile/${user.userId}`)}
                        disabled={!user.userId}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* View Activity Log */}
                      <button
                        onClick={() => navigate(`/social/user/analitical/page/${user.userId}`)}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="View Activity Log"
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      {/* Block/Unblock */}
                      <button
                        onClick={() => blockMutation.mutate(user.userId)}
                        disabled={blockMutation.isLoading || !user.userId}
                        className={`p-2 rounded-lg transition-colors ${user.isBlocked
                          ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                          : "text-red-400 hover:text-red-600 hover:bg-red-50"
                          }`}
                        title={user.isBlocked ? "Unblock User" : "Block User"}
                      >
                        <Ban className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Are you sure you want to delete ${user.userName || "this user"}? This action cannot be undone.`
                            )
                          ) {
                            deleteMutation.mutate(user.userId);
                          }
                        }}
                        disabled={deleteMutation.isLoading || !user.userId}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div >

      {/* Pagination Controls - ALWAYS SHOW WHEN THERE ARE ITEMS */}
      {
        filteredUsers.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-200 bg-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-2 sm:mb-0">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(page - 1) * itemsPerPage + 1}</span> to{" "}
                <span className="font-medium">{Math.min(page * itemsPerPage, filteredUsers.length)}</span> of{" "}
                <span className="font-medium">{filteredUsers.length}</span> users
                {searchResults.length > 0 && (
                  <span className="text-blue-600 ml-2">(Search results)</span>
                )}
                {isFilterActive && searchResults.length === 0 && (
                  <span className="text-green-600 ml-2">(Filtered)</span>
                )}
              </div>

              {/* Items per page selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {/* First Page */}
              <button
                onClick={() => goToPage(1)}
                disabled={page === 1}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Previous Page */}
              <button
                onClick={prevPage}
                disabled={page === 1}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === pageNum
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Page */}
              <button
                onClick={nextPage}
                disabled={page === totalPages}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => goToPage(totalPages)}
                disabled={page === totalPages}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )
      }
    </>
  );
}