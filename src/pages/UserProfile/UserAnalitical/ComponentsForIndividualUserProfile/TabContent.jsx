// components/TabContent.jsx
import { motion } from "framer-motion";
import TableDisplay from "./TableDisplay";

export default function TabContent({ user, activeTab }) {
  const render = (rows) => <TableDisplay rows={rows} />;

  // Helper: format date
  const formatDate = (date) =>
    date ? new Date(date).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "-";

  // Helper: calculate remaining subscription days
  const calculateRemainingDays = (endDate) => {
    if (!endDate) return "-";
    const now = new Date();
    const end = new Date(endDate);
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days` : "Expired";
  };

  switch (activeTab) {
    case "Profile":
      return (
        <motion.div key="Profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {render([
            { label: "Gender", value: user.profile?.gender || "-" },
            {
              label: "Date of Birth",
              value: user.profile?.dateOfBirth
                ? new Date(user.profile.dateOfBirth).toLocaleDateString()
                : "-",
            },
            {
              label: "Marital Status",
              value: user.profile?.maritalStatus === "true" ? "Married" : "Single",
            },
            { label: "Timezone", value: user.profile?.timezone || "-" },
            { label: "Bio", value: user.profile?.bio || "-" },
            { label: "Phone Number", value: user.profile?.phoneNumber || "-" },
          ])}
        </motion.div>
      );

    case "Account":
      return (
        <motion.div key="Account" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {render([
            { label: "User Name", value: user.userName },
            { label: "Email", value: user.email },
            { label: "Referral Code", value: user.referralCode },
            { label: "Total Earnings", value: `$${user.totalEarnings || 0}` },
            { label: "Withdrawable Earnings", value: `$${user.withdrawableEarnings || 0}` },
            { label: "Active Status", value: user.isActive ? "Active" : "Inactive" },
            { label: "Active Since", value: formatDate(user.isActiveAt) },
          ])}
        </motion.div>
      );

    case "Subscription":
      return (
        <motion.div key="Subscription" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {render([
            { label: "Subscription ID", value: user.subscription?._id || "-" },
            { label: "Start Date", value: formatDate(user.subscription?.startDate) },
            { label: "End Date", value: formatDate(user.subscription?.endDate) },
            {
              label: "Remaining Days",
              value: calculateRemainingDays(user.subscription?.endDate),
            },
            { label: "Status", value: user.isActive ? "Active" : "Inactive" },
          ])}
        </motion.div>
      );

    case "Device":
      return (
        <motion.div key="Device" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {render([
            { label: "Device Type", value: user.device?.deviceType || "-" },
            { label: "IP Address", value: user.device?.ipAddress || "-" },
                  {
              label: "Last Active",
              value: formatDate(user.isActiveAt),
            },
          ])}
        </motion.div>
      );

case "Referrals":
  return (
    <motion.div key="Referrals" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {user.directReferrals && user.directReferrals.length > 0 ? (
        <TableDisplay
          rows={user.directReferrals.map((referral) => ({
            label: referral.userName, // can be any label
            value: (
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {referral.profileAvatar ? (
                    <img
                      src={referral.profileAvatar}
                      alt={referral.userName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">N/A</span>
                  )}
                </div>
                {/* Name + join date */}
                <div className="flex flex-col">
                  <span className="font-medium">{referral.userName}</span>
                  <span className="text-gray-500 text-sm">
                    {referral.joinDate
                      ? new Date(referral.joinDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "No Data"}
                  </span>
                </div>
              </div>
            ),
          }))}
        />
      ) : (
        <div className="text-gray-500 py-6 text-center">No referrals found</div>
      )}
    </motion.div>
  );


    // Future tabs
    case "Education":
    case "Employment":
      return (
        <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="text-gray-400 px-2">No data available yet.</div>
        </motion.div>
      );

    default:
      return <div className="text-gray-400 px-2">No data available.</div>;
  }
}
