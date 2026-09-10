import { useQuery } from "@tanstack/react-query";
import { FaTimes } from "react-icons/fa";
import { fetchUserById } from "../../Services/UserServices/userServices.js";

export default function CreatorDetailModal({ userId, onClose }) {
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(userId),
    enabled: !!userId,
  });

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

  return (
    <div className="fixed inset-0 z-[9999] animate-fadeInUp">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="relative w-full max-w-6xl bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden z-[10000]">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 z-[10001]"
          >
            <FaTimes />
          </button>

          {/* Top User Header */}
          <div className="flex items-center gap-6 p-6 border-b border-gray-200 dark:border-gray-700">
            <img
              src={user.profile?.profileAvatar}
              alt={user.userName}
              className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-800 shadow-lg object-cover"
            />
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                {user.userName || "Unnamed"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">📧 {user.email}</p>
              <p className="text-gray-500 dark:text-gray-400">
                Role: <span className="font-medium">{user.role}</span>
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {/* Profile */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-700 dark:text-white mb-2">Profile</h3>
              <p><span className="text-gray-500">Gender:</span> {user.profile?.gender || "-"}</p>
              <p><span className="text-gray-500">DOB:</span> {user.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth).toLocaleDateString() : "-"}</p>
              <p><span className="text-gray-500">Marital Status:</span> {user.profile?.maritalStatus === "true" ? "Married" : "Single"}</p>
              <p><span className="text-gray-500">Phone:</span> {user.profile?.phoneNumber || "-"}</p>
              <p><span className="text-gray-500">Timezone:</span> {user.profile?.timezone || "-"}</p>
              <p><span className="text-gray-500">Bio:</span> {user.profile?.bio || "-"}</p>
            </div>

            {/* Account */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-700 dark:text-white mb-2">Account</h3>
              <p><span className="text-gray-500">Referral Code:</span> {user.referralCode || "-"}</p>
              <p><span className="text-gray-500">Referred By:</span> {user.referredByUserId || "-"}</p>
              <p><span className="text-gray-500">Level:</span> {user.currentLevel || "-"}</p>
              <p><span className="text-gray-500">Tier:</span> {user.currentTier || "-"}</p>
              <p><span className="text-gray-500">Total Earnings:</span> ${user.totalEarnings || 0}</p>
              <p><span className="text-gray-500">Withdrawable:</span> ${user.withdrawableEarnings || 0}</p>
            </div>

            {/* Subscription */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-700 dark:text-white mb-2">Subscription</h3>
              <p><span className="text-gray-500">Active:</span> {user.subscription?.subscriptionActive ? "✅ Yes" : "❌ No"}</p>
              <p><span className="text-gray-500">Start:</span> {user.subscription?.startDate ? new Date(user.subscription.startDate).toLocaleDateString() : "-"}</p>
              <p><span className="text-gray-500">End:</span> {user.subscription?.endDate ? new Date(user.subscription.endDate).toLocaleDateString() : "-"}</p>
              <p><span className="text-gray-500">Activated At:</span> {user.subscription?.subscriptionActiveDate ? new Date(user.subscription.subscriptionActiveDate).toLocaleDateString() : "-"}</p>
            </div>

            {/* Device */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-700 dark:text-white mb-2">Device</h3>
              <p><span className="text-gray-500">Type:</span> {user.device?.deviceType || "-"}</p>
              <p><span className="text-gray-500">Name:</span> {user.device?.deviceName || "-"}</p>
              <p><span className="text-gray-500">IP:</span> {user.device?.ipAddress || "-"}</p>
            </div>

            {/* Activity */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl shadow-sm md:col-span-2 lg:col-span-2">
              <h3 className="font-semibold text-gray-700 dark:text-white mb-2">Activity</h3>
              <p><span className="text-gray-500">Active:</span> {user.isActive ? "✅ Yes" : "❌ No"}</p>
              <p><span className="text-gray-500">Active At:</span> {user.isActiveAt ? new Date(user.isActiveAt).toLocaleString() : "-"}</p>
              <p><span className="text-gray-500">Last Login:</span> {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "-"}</p>
              <p><span className="text-gray-500">Languages:</span> App - {user.language?.appLanguageCode || "en"}, Feed - {user.language?.feedLanguageCode || "en"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
