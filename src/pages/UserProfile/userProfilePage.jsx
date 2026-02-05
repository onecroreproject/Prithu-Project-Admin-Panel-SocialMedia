import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import UserProfileMetricks from "./userProfileMetricks";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import UserTable from "../../components/tables/UserTabel/UserTable";

const dashboardFade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
};

export default function UserProfilePage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: {
      active: true,
      inactive: true,
      suspended: false
    },
    gender: "all",
    registered: "all",
    lastActive: "all"
  });

  const handleStatusChange = (status) => {
    setFilters(prev => ({
      ...prev,
      status: {
        ...prev.status,
        [status]: !prev.status[status]
      }
    }));
  };

  const handleGenderChange = (gender) => {
    setFilters(prev => ({ ...prev, gender }));
  };

  const handleRegisteredChange = (period) => {
    setFilters(prev => ({ ...prev, registered: period }));
  };

  const handleLastActiveChange = (period) => {
    setFilters(prev => ({ ...prev, lastActive: period }));
  };

  const handleClearAll = () => {
    setFilters({
      status: {
        active: true,
        inactive: true,
        suspended: false
      },
      gender: "all",
      registered: "all",
      lastActive: "all"
    });
  };

  const handleApplyFilters = () => {
    setIsFilterOpen(false);
    // Here you would typically apply filters to your data
    console.log("Applied filters:", filters);
  };

  const [metricFilter, setMetricFilter] = useState(null);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="user-profile-page"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={dashboardFade}
        className="min-h-screen bg-gray-50"
      >
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <PageBreadcrumb pageTitle="User Management" />
            <div className="mb-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">User Management Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Monitor and manage all user accounts and activities</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          {/* Metrics Section */}
          <motion.div
            variants={dashboardFade}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mb-6 sm:mb-8"
          >
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">User Overview</h2>
                <p className="text-sm text-gray-500">Real-time user statistics and metrics</p>
              </div>
              <UserProfileMetricks onMetricClick={setMetricFilter} activeMetric={metricFilter} />
            </div>
          </motion.div>


          {/* User Table Section */}
          <motion.div
            variants={dashboardFade}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <ComponentCard
              title="User Directory"
              desc="Manage all user accounts and permissions"
              className="shadow-sm"
            >
              <UserTable externalFilter={metricFilter} onClearExternalFilter={() => setMetricFilter(null)} />
            </ComponentCard>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
