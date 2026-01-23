import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../../Utils/axiosApi";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Users,
  XCircle,
  FileText,
  Eye,
  Edit,
  Trash2,
  Filter,
  Search,
  ChevronRight,
  Plus,
  BarChart,
  Target,
  Brain,
  Timer,
  AlertCircle,
  RefreshCw,
  ListChecks,
  Zap,
  Download,
  UsersIcon,
  Hash
} from "lucide-react";

const TestManagement = () => {
  // State for tests
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  
  // State for candidates (for future implementation)
  const [candidates, setCandidates] = useState([]);
   const navigate=useNavigate()
  // State for forms
  const [showCreateTest, setShowCreateTest] = useState(false);
  const [showEditTest, setShowEditTest] = useState(false);
  const [showTestDetails, setShowTestDetails] = useState(false);
  
  // Form data
  const [testForm, setTestForm] = useState({
    scheduleId: "",
    testId: "",
    testName: "",
    description: "",
    startTime: "",
    endTime: "",
    testDuration: 60,
    totalQuestions: 30,
    passScore: 60,
    isProctored: false,
    instructions: ""
  });
  
  // Filter and search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Calculate test status based on current time
  const calculateTestStatus = (test) => {
    if (test.status === "cancelled") return "cancelled";
    
    const now = new Date();
    const startTime = new Date(test.startTime);
    const endTime = new Date(test.endTime);
    
    if (now < startTime) return "upcoming";
    if (now >= startTime && now <= endTime) return "running";
    if (now > endTime) return "completed";
    return "unknown";
  };
  
  // Fetch all tests
  const fetchAllTests = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/get/all/aptitude/test");
      console.log("Fetched tests:", response.data);
      
      if (response.data.success) {
        const testsWithStatus = response.data.schedules.map(test => ({
          ...test,
          // Add computed properties for compatibility
          testId: test.testId,
          status: calculateTestStatus(test),
          name: test.testName,
          duration: test.testDuration,
          passingScore: test.passScore,
          scheduledAt: test.startTime,
          endsAt: test.endTime,
          createdAt: test.createdAt || new Date().toISOString(),
          totalCandidates: test.totalCandidates || 0,
          avgScore: test.avgScore || 0
        }));
        
        setTests(testsWithStatus);
        setFilteredTests(testsWithStatus);
        
        // If a test is selected, refresh its data
        if (selectedTest) {
          fetchTestDetails(selectedTest._id);
        }
      }
    } catch (error) {
      console.error("Error fetching tests:", error);
      alert("Failed to fetch tests. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch test details
  const fetchTestDetails = async (testId) => {
    try {
      const response = await axios.get(`/api/aptitude/get/single/schedule/${testId}`);
      
      if (response.data.success) {
        const test = response.data.schedule;
        const testWithStatus = {
          ...test,
          status: calculateTestStatus(test),
          name: test.testName,
          duration: test.testDuration,
          passingScore: test.passScore,
          scheduledAt: test.startTime,
          endsAt: test.endTime,
          createdAt: test.createdAt || new Date().toISOString(),
          totalCandidates: test.totalCandidates || 0,
          avgScore: test.avgScore || 0
        };
        
        setSelectedTest(testWithStatus);
      }
    } catch (error) {
      console.error("Error fetching test details:", error);
      alert("Failed to fetch test details. Please try again.");
    }
  };


  const handleAnalitical=async(testId)=>
  {
 navigate(`/aptitude/results/reports/${testId}`)
  }
  
  // Create new test
  const handleCreateTest = async (e) => {
    e.preventDefault();

    // Validate testId
    if (!testForm.testId || isNaN(testForm.testId)) {
      alert("Please enter a valid Test ID (numeric value).");
      return;
    }

    // Check if test ID already exists
    const existingTest = tests.find(test => test.testId === Number(testForm.testId));
    if (existingTest) {
      alert(`Test ID ${testForm.testId} already exists. Please choose a different Test ID.`);
      return;
    }

    try {
      // Convert datetime-local values to UTC for backend
      const createData = {
        ...testForm,
        testId: Number(testForm.testId),
        startTime: testForm.startTime ? new Date(testForm.startTime).toISOString() : null,
        endTime: testForm.endTime ? new Date(testForm.endTime).toISOString() : null
      };

      const response = await axios.post("/api/aptitude/create/test/schedule", createData);

      if (response.data.success) {
        alert("Test created successfully!");
        setShowCreateTest(false);
        resetTestForm();
        fetchAllTests();
      } else {
        alert(response.data.message || "Failed to create test");
      }
    } catch (error) {
      console.error("Error creating test:", error);
      alert(error.response?.data?.message || "Failed to create test. Please try again.");
    }
  };
  
  // Update test
  const handleUpdateTest = async (e) => {
    e.preventDefault();
    
    if (!testForm.scheduleId) {
      alert("Test ID is required for updating.");
      return;
    }
    
    // Validate testId if provided
    if (testForm.testId && isNaN(testForm.testId)) {
      alert("Please enter a valid Test ID (numeric value).");
      return;
    }
    
    try {
      setUpdating(true);
      // Prepare update data
      const updateData = {
        testId: testForm.testId ? Number(testForm.testId) : undefined,
        testName: testForm.testName,
        description: testForm.description,
        startTime: testForm.startTime ? new Date(testForm.startTime).toISOString() : null,
        endTime: testForm.endTime ? new Date(testForm.endTime).toISOString() : null,
        testDuration: testForm.testDuration,
        totalQuestions: testForm.totalQuestions,
        passScore: testForm.passScore,
        isProctored: testForm.isProctored,
        instructions: testForm.instructions
      };
      
      // Remove null, undefined, or empty string values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === null || updateData[key] === undefined || updateData[key] === "") {
          delete updateData[key];
        }
      });
      
      const response = await axios.put(
        `/api/aptitude/test/update/${testForm.scheduleId}`, 
        updateData
      );
      
      if (response.data.success) {
        alert("Test updated successfully!");
        setShowEditTest(false);
        resetTestForm();
        fetchAllTests();
      } else {
        alert(response.data.message || "Failed to update test");
      }
    } catch (error) {
      console.error("Error updating test:", error);
      alert(error.response?.data?.message || "Failed to update test. Please try again.");
    } finally {
      setUpdating(false);
    }
  };
  
  // Delete test
  const handleDeleteTest = async (testId) => {
    if (!testId) {
      alert("Test ID is required for deletion.");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this test? This action cannot be undone.")) {
      try {
        setDeleting(true);
        const response = await axios.delete(`/api/delete/aptitude/test/${testId}`);
        
        if (response.data.success) {
          alert("Test deleted successfully!");
          setSelectedTest(null);
          fetchAllTests();
        } else {
          alert(response.data.message || "Failed to delete test");
        }
      } catch (error) {
        console.error("Error deleting test:", error);
        alert(error.response?.data?.message || "Failed to delete test. Please try again.");
      } finally {
        setDeleting(false);
      }
    }
  };
  
  // View test details in modal
  const handleViewTest = (test) => {
    setSelectedTest(test);
    setShowTestDetails(true);
  };
  
  // Export test results
  const handleExportResults = async (testId) => {
    try {
      alert("Results exported! (Note: This is a simulated action. Implement export API)");
    } catch (error) {
      console.error("Error exporting results:", error);
      alert("Failed to export results.");
    }
  };
  
  // Filter tests
  useEffect(() => {
    let filtered = [...tests];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(test =>
        test.testName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.testId?.toString().includes(searchTerm)
      );
    }
    
    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(test => calculateTestStatus(test) === statusFilter);
    }
    
    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter(test => {
        const testDate = new Date(test.startTime);
        switch (dateFilter) {
          case "today":
            return testDate.toDateString() === now.toDateString();
          case "tomorrow":
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return testDate.toDateString() === tomorrow.toDateString();
          case "thisWeek":
            const weekStart = new Date(now);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            return testDate >= weekStart && testDate <= weekEnd;
          case "nextWeek":
            const nextWeekStart = new Date(now);
            nextWeekStart.setDate(nextWeekStart.getDate() + (7 - nextWeekStart.getDay()));
            const nextWeekEnd = new Date(nextWeekStart);
            nextWeekEnd.setDate(nextWeekEnd.getDate() + 6);
            return testDate >= nextWeekStart && testDate <= nextWeekEnd;
          default:
            return true;
        }
      });
    }
    
    setFilteredTests(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter, tests]);
  
  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTests = filteredTests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTests.length / itemsPerPage);
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format date and time together
  const formatDateTime = (dateString) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get status badge color
  const getStatusColor = (status) => {
    switch(status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'running': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'completed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  // Reset form
  const resetTestForm = () => {
    setTestForm({
      scheduleId: "",
      testId: "",
      testName: "",
      description: "",
      startTime: "",
      endTime: "",
      testDuration: 60,
      totalQuestions: 30,
      passScore: 60,
      isProctored: false,
      instructions: ""
    });
  };
  
  // Initialize form with selected test for editing
  const initEditForm = (test) => {
    // Format dates for datetime-local input (convert UTC to local time)
    const formatDateTimeLocal = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    setTestForm({
      scheduleId: test._id,
      testId: test.testId || "",
      testName: test.testName || test.name || "",
      description: test.description || "",
      startTime: formatDateTimeLocal(test.startTime),
      endTime: formatDateTimeLocal(test.endTime),
      testDuration: test.testDuration || test.duration || 60,
      totalQuestions: test.totalQuestions || 30,
      passScore: test.passScore || test.passingScore || 60,
      isProctored: test.isProctored || false,
      instructions: test.instructions || ""
    });
    setShowEditTest(true);
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchAllTests();
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading test management...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Test Management</h1>
            <p className="text-indigo-100 mt-2">Create, view, edit, and delete aptitude tests</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAllTests}
              className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => setShowCreateTest(true)}
              className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              Create Test
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tests List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by test name, description, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="running">Running</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="thisWeek">This Week</option>
                  <option value="nextWeek">Next Week</option>
                </select>
                
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Tests List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  All Tests ({filteredTests.length})
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTests.length)} of {filteredTests.length}
                  </span>
                </div>
              </div>
            </div>
            
            {currentTests.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {currentTests.map((test) => (
                  <div
                    key={test._id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer ${
                      selectedTest?._id === test._id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                    }`}
                    onClick={() => setSelectedTest(test)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white">{test.testName || test.name}</h4>
                              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded">
                                ID: {test.testId || "N/A"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{test.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 mt-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {formatDateTime(test.startTime)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {test.testDuration || test.duration} minutes
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <ListChecks className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {test.totalQuestions} questions
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              Pass: {test.passScore || test.passingScore}%
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(calculateTestStatus(test))}`}>
                          {calculateTestStatus(test).charAt(0).toUpperCase() + calculateTestStatus(test).slice(1)}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewTest(test);
                            }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                            title="View Test"
                          >
                            <Eye className="w-4 h-4 text-green-500" />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              initEditForm(test);
                            }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                            title="Edit Test"
                            disabled={updating}
                          >
                            <Edit className="w-4 h-4 text-blue-500" />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTest(test._id);
                            }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                            title="Delete Test"
                            disabled={deleting}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No tests found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                    ? 'Try changing your filters'
                    : 'Create your first test to get started'
                  }
                </p>
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg ${
                            currentPage === pageNum
                              ? 'bg-indigo-600 text-white'
                              : 'border border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column - Test Details */}
        <div className="space-y-6">
          {/* Selected Test Details */}
          {selectedTest ? (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedTest.testName || selectedTest.name}</h3>
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded">
                        ID: {selectedTest.testId || "N/A"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedTest.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewTest(selectedTest)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => initEditForm(selectedTest)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      title="Edit Test"
                    >
                      <Edit className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4 mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Start Time:</span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDateTime(selectedTest.startTime)}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">End Time:</span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDateTime(selectedTest.endTime)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Duration:</span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedTest.testDuration || selectedTest.duration} minutes
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <ListChecks className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Questions:</span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedTest.totalQuestions}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Passing Score:</span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedTest.passScore || selectedTest.passingScore}%
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Status:</span>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(calculateTestStatus(selectedTest))}`}>
                        {calculateTestStatus(selectedTest).charAt(0).toUpperCase() + calculateTestStatus(selectedTest).slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  {selectedTest.totalCandidates > 0 && (
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">Total Candidates:</span>
                        </div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedTest.totalCandidates}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <BarChart className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">Average Score:</span>
                        </div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedTest.avgScore}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleExportResults(selectedTest._id)}
                    className="px-4 py-2 border border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export Results
                  </button>
                  
                  <button
                    onClick={()=>handleAnalitical(selectedTest._id)}
                    className="px-4 py-2 border border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 flex items-center gap-2"
                  >
                    <BarChart className="w-4 h-4" />
                    View Analytics
                  </button>
                  
                  <button
                    onClick={() => handleDeleteTest(selectedTest._id)}
                    disabled={deleting}
                    className="px-4 py-2 border border-red-600 text-red-600 dark:text-red-400 dark:border-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deleting ? 'Deleting...' : 'Delete Test'}
                  </button>
                </div>
              </div>
              
              {/* Test Status Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Test Information</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Current Status</span>
                    <span className={`font-medium ${getStatusColor(calculateTestStatus(selectedTest)).replace('bg-', 'text-').replace(' dark:bg-', ' dark:text-')}`}>
                      {calculateTestStatus(selectedTest).toUpperCase()}
                    </span>
                  </div>
                  
                  {selectedTest.status === 'cancelled' && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-400">
                        This test has been cancelled.
                      </p>
                    </div>
                  )}
                  
                  {calculateTestStatus(selectedTest) === 'upcoming' && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        This test is scheduled to start on {formatDateTime(selectedTest.startTime)}.
                      </p>
                    </div>
                  )}
                  
                  {calculateTestStatus(selectedTest) === 'running' && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-700 dark:text-green-400">
                        This test is currently running and will end on {formatDateTime(selectedTest.endTime)}.
                      </p>
                    </div>
                  )}
                  
                  {calculateTestStatus(selectedTest) === 'completed' && (
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm text-purple-700 dark:text-purple-400">
                        This test was completed on {formatDateTime(selectedTest.endTime)}.
                      </p>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Time Status</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {calculateTestStatus(selectedTest) === 'running' ? (
                          <>Ends {formatTime(selectedTest.endTime)}</>
                        ) : calculateTestStatus(selectedTest) === 'upcoming' ? (
                          <>Starts {formatTime(selectedTest.startTime)}</>
                        ) : (
                          'Completed'
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Test Selected</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Select a test from the list to view details and manage settings
              </p>
              <button
                onClick={() => setShowCreateTest(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create New Test
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Modals */}
      
      {/* Create/Edit Test Modal */}
      {(showCreateTest || showEditTest) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {showEditTest ? 'Edit Test Schedule' : 'Create New Test Schedule'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateTest(false);
                    setShowEditTest(false);
                    resetTestForm();
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <form onSubmit={showEditTest ? handleUpdateTest : handleCreateTest}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Test Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={testForm.testName}
                      onChange={(e) => setTestForm({...testForm, testName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., Frontend Developer Aptitude Test"
                    />
                  </div>
                  
                  {/* Test ID Field - Only show for create, hide for edit (if you want testId to be immutable) */}
                  {showCreateTest && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Test ID *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={testForm.testId}
                        onChange={(e) => setTestForm({...testForm, testId: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter unique test ID number"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Must be a unique number identifier for the test
                      </p>
                    </div>
                  )}
                  
                  {/* For edit mode, show testId as read-only */}
                  {showEditTest && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Test ID
                      </label>
                      <input
                        type="text"
                        value={testForm.testId}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Test ID cannot be changed after creation
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={testForm.description}
                      onChange={(e) => setTestForm({...testForm, description: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Describe the test purpose and what it measures"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={testForm.startTime}
                        onChange={(e) => setTestForm({...testForm, startTime: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={testForm.endTime}
                        onChange={(e) => setTestForm({...testForm, endTime: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave empty to auto-calculate from duration
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Duration (minutes) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={testForm.testDuration}
                        onChange={(e) => setTestForm({...testForm, testDuration: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Total Questions *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={testForm.totalQuestions}
                        onChange={(e) => setTestForm({...testForm, totalQuestions: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Passing Score (%) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        max="100"
                        value={testForm.passScore}
                        onChange={(e) => setTestForm({...testForm, passScore: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-3 mt-6">
                        <input
                          type="checkbox"
                          id="proctored"
                          checked={testForm.isProctored}
                          onChange={(e) => setTestForm({...testForm, isProctored: e.target.checked})}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="proctored" className="text-sm text-gray-700 dark:text-gray-300">
                          Enable proctoring
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Instructions (Optional)
                    </label>
                    <textarea
                      value={testForm.instructions}
                      onChange={(e) => setTestForm({...testForm, instructions: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Provide test instructions for candidates"
                      rows={4}
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-8">
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {showEditTest ? (updating ? 'Updating...' : 'Update Test') : 'Create Test'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateTest(false);
                      setShowEditTest(false);
                      resetTestForm();
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* View Test Details Modal */}
      {showTestDetails && selectedTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Test Details
                </h3>
                <button
                  onClick={() => setShowTestDetails(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedTest.testName || selectedTest.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Hash className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Test ID: {selectedTest.testId || "Not assigned"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h5>
                  <p className="text-gray-900 dark:text-white">
                    {selectedTest.description || "No description provided"}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Test ID
                    </label>
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900 dark:text-white font-mono">
                        {selectedTest.testId || "Not assigned"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(calculateTestStatus(selectedTest))}`}>
                      {calculateTestStatus(selectedTest).charAt(0).toUpperCase() + calculateTestStatus(selectedTest).slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Start Time
                    </label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900 dark:text-white">
                        {formatDateTime(selectedTest.startTime)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      End Time
                    </label>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900 dark:text-white">
                        {formatDateTime(selectedTest.endTime)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Duration
                    </label>
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900 dark:text-white">
                        {selectedTest.testDuration || selectedTest.duration} minutes
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Questions
                    </label>
                    <div className="flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900 dark:text-white">
                        {selectedTest.totalQuestions}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Passing Score
                    </label>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900 dark:text-white">
                        {selectedTest.passScore || selectedTest.passingScore}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Proctoring
                    </label>
                    <p className={`font-medium ${selectedTest.isProctored ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      {selectedTest.isProctored ? '✓ Enabled' : '✗ Disabled'}
                    </p>
                  </div>
                </div>
                
                {selectedTest.instructions && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Instructions
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-900 dark:text-white whitespace-pre-line">
                        {selectedTest.instructions}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowTestDetails(false);
                        initEditForm(selectedTest);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Edit Test
                    </button>
                    <button
                      onClick={() => setShowTestDetails(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestManagement;