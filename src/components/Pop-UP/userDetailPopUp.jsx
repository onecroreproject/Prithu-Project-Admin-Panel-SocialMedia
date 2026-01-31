import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { fetchUserById } from "../../Services/UserServices/userServices.js";

export default function UserDetailModal({ userId, onClose }) {
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(userId),
    enabled: !!userId,
  });

  const [activeTab, setActiveTab] = useState("Profile");

  const tabVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 z-[10000]">
          Loading...
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 text-red-500 z-[10000]">
          Failed to load user
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "Profile", label: "Profile" },
    { id: "Account", label: "Account" },
    { id: "Subscription", label: "Subscription" },
    { id: "Device", label: "Device" },
    { id: "Activity", label: "Activity" },
    { id: "Activity", label: "Activity" },
  ];

  const renderTable = (rows) => (
    <table className="min-w-full border-collapse border border-gray-200 dark:border-gray-700">
      <tbody>
        {rows.map(({ label, value }, idx) => (
          <tr key={idx} className="border-b border-gray-200 dark:border-gray-700">
            <td className="w-1/3 px-4 py-2 font-medium text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
              {label}
            </td>
            <td className="w-2/3 px-4 py-2 text-gray-800 dark:text-gray-200">
              {value || "-"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );


  return (
    <div className="fixed inset-0 z-[9999] animate-fadeInUp">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="relative w-[900px] h-[600px] bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden z-[10000] flex flex-col">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 z-[10001]"
          >
            <FaTimes />
          </button>

          {/* Top User Header */}
          <div className="flex items-center gap-6 p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <img
              src={user.profile?.profileAvatar || "/fallback-avatar.png"}
              alt={user.userName}
              className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-800 shadow-lg object-cover"
            />
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                {user.userName || "Unnamed"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">📧 {user.email || "-"}</p>
              <p className="text-gray-500 dark:text-gray-400">
                Role: <span className="font-medium">{user.role || "-"}</span>
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === "Profile" && (
              <motion.div key="Profile" initial="hidden" animate="visible" exit="exit" variants={tabVariants} transition={{ duration: 0.3 }}>
                {renderTable([
                  { label: "Gender", value: user.profile?.gender },
                  { label: "DOB", value: user.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth).toLocaleDateString() : null },
                  { label: "Marital Status", value: user.profile?.maritalStatus === "true" ? "Married" : "Single" },
                  { label: "Phone", value: user.profile?.phoneNumber },
                  { label: "Timezone", value: user.profile?.timezone },
                  { label: "Bio", value: user.profile?.bio },
                ])}
              </motion.div>
            )}

            {activeTab === "Account" && (
              <motion.div key="Account" initial="hidden" animate="visible" exit="exit" variants={tabVariants} transition={{ duration: 0.3 }}>
                {renderTable([
                  { label: "Referral Code", value: user.referralCode },
                  { label: "Referred By", value: user.referredByUserId },
                  { label: "Level", value: user.currentLevel },
                  { label: "Tier", value: user.currentTier },
                  { label: "Total Earnings", value: `$${user.totalEarnings || 0}` },
                  { label: "Withdrawable", value: `$${user.withdrawableEarnings || 0}` },
                ])}
              </motion.div>
            )}

            {activeTab === "Subscription" && (
              <motion.div key="Subscription" initial="hidden" animate="visible" exit="exit" variants={tabVariants} transition={{ duration: 0.3 }}>
                {renderTable([
                  { label: "Active", value: user.subscription?.subscriptionActive ? "✅ Yes" : "❌ No" },
                  { label: "Start Date", value: user.subscription?.startDate ? new Date(user.subscription.startDate).toLocaleDateString() : null },
                  { label: "End Date", value: user.subscription?.endDate ? new Date(user.subscription.endDate).toLocaleDateString() : null },
                  { label: "Activated At", value: user.subscription?.subscriptionActiveDate ? new Date(user.subscription.subscriptionActiveDate).toLocaleDateString() : null },
                ])}
              </motion.div>
            )}

            {activeTab === "Device" && (
              <motion.div key="Device" initial="hidden" animate="visible" exit="exit" variants={tabVariants} transition={{ duration: 0.3 }}>
                {renderTable([
                  { label: "Type", value: user.device?.deviceType },
                  { label: "Name", value: user.device?.deviceName },
                  { label: "IP", value: user.device?.ipAddress },
                ])}
              </motion.div>
            )}

            {activeTab === "Activity" && (
              <motion.div key="Activity" initial="hidden" animate="visible" exit="exit" variants={tabVariants} transition={{ duration: 0.3 }}>
                {renderTable([
                  { label: "Active", value: user.isActive ? "✅ Yes" : "❌ No" },
                  { label: "Active At", value: user.isActiveAt ? new Date(user.isActiveAt).toLocaleString() : null },
                  { label: "Last Login", value: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : null },
                  { label: "Languages", value: `App - ${user.language?.appLanguageCode || "en"}, Feed - ${user.language?.feedLanguageCode || "en"}` },
                ])}
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
