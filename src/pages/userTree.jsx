import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ReferralHeader from "../layout/referalHeader";
import { fetchUserLevel } from "../Services/UserServices/userServices";

const MAX_LEVEL = 10;

export default function ReferralTreePage() {
  const { userId } = useParams();
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [glowSteps, setGlowSteps] = useState([]);

  // Fetch user & referral data
  const { data, isLoading, error } = useQuery({
    queryKey: ["referralTree", userId],
    queryFn: () => fetchUserLevel(userId),
  });

  // Animate node glow sequentially
  useEffect(() => {
    if (data) {
      setSelectedLevel(data.level || 1);

      let steps = [];
      for (let i = 1; i <= (data.level || 1); i++) steps.push(i);

      steps.forEach((lvl, idx) => {
        setTimeout(() => {
          setGlowSteps((prev) => [...prev, lvl]);
        }, idx * 500); // delay between nodes
      });
    }
  }, [data]);

  const rowVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 },
  };

  if (isLoading) return <p className="p-6">Loading referral tree...</p>;
  if (error) return <p className="p-6 text-red-500">Error loading data</p>;

  // If user level is 0 or not started
  if ((data?.level || 0) === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <ReferralHeader
          user={{
            userName: data?.user?.userName || "Unknown User",
            avatar: data?.user?.profileAvatar || "/default-avatar.png",
            totalEarned: data?.totalEarned || 0,
            totalWithdrawn: data?.totalWithdrawn || 0,
            pendingWithdrawable: data?.pendingWithdrawable || 0,
          }}
        />
        <p className="mt-6 text-center text-gray-500 dark:text-gray-400 text-lg">
          User Not Start Earning Process
        </p>
      </div>
    );
  }

  const user = data || {};
  const leftUsers = user.leftUsers || [];
  const rightUsers = user.rightUsers || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <ReferralHeader
        user={{
          userName: user.user?.userName || "Unknown User",
          avatar: user.user?.profileAvatar || "/default-avatar.png",
          totalEarned: user.totalEarned || 0,
          totalWithdrawn: user.totalWithdrawn || 0,
          pendingWithdrawable: user.pendingWithdrawable || 0,
        }}
      />

      <div className="flex flex-col md:flex-row gap-8 mt-6">
        {/* Left: Level Tree */}
        <div className="flex-1 overflow-auto p-4 bg-white dark:bg-gray-900 rounded-xl shadow flex flex-col items-center">
          {[...Array(MAX_LEVEL)].map((_, idx) => {
            const level = idx + 1;
            const isActive = level <= (user.level || 1);
            const isGlowing = glowSteps.includes(level);

            return (
              <div key={level} className="flex flex-col items-center relative">
                <motion.div
                  className={`h-12 w-12 flex items-center justify-center rounded-full border-2 cursor-pointer mb-6 ${
                    isActive
                      ? "border-blue-500 bg-blue-100 dark:bg-blue-900 shadow-md"
                      : "border-gray-300 bg-gray-100 dark:bg-gray-800"
                  }`}
                  animate={{
                    boxShadow: isGlowing
                      ? "0 0 15px 4px rgba(59, 130, 246, 0.7)"
                      : "0 0 0px 0px transparent",
                    scale: isGlowing ? 1.2 : 1,
                  }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setSelectedLevel(level)}
                >
                  <span
                    className={`font-semibold ${
                      isActive ? "text-blue-700" : "text-gray-400"
                    }`}
                  >
                    {level}
                  </span>
                </motion.div>

                {level < MAX_LEVEL && (
                  <motion.div
                    className={`w-1 h-6 mb-6 rounded ${
                      level < user.level
                        ? "bg-blue-500"
                        : "bg-gray-300 dark:bg-gray-700"
                    }`}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: glowSteps.includes(level + 1) ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ originY: 0 }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Left & Right Users */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          {/* Left Users */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4">
            <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">
              Left Users (Level {selectedLevel})
            </h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="p-2">#</th>
                  <th className="p-2">Avatar</th>
                  <th className="p-2">Name</th>
                </tr>
              </thead>
              <tbody>
                {leftUsers.length > 0 ? (
                  leftUsers.map((u, idx) => (
                    <motion.tr
                      key={u._id}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      transition={{ delay: idx * 0.1 }}
                      className="border-b border-gray-200 dark:border-gray-700"
                    >
                      <td className="p-2">{idx + 1}</td>
                      <td className="p-2">
                        <img
                          src={u.profileAvatar || "/default-avatar.png"}
                          alt={u.userName}
                          className="h-10 w-10 rounded-full"
                        />
                      </td>
                      <td className="p-2">{u.userName || "Unknown User"}</td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-2 text-gray-500 text-center">
                      No users
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Right Users */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4">
            <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">
              Right Users (Level {selectedLevel})
            </h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="p-2">#</th>
                  <th className="p-2">Avatar</th>
                  <th className="p-2">Name</th>
                </tr>
              </thead>
              <tbody>
                {rightUsers.length > 0 ? (
                  rightUsers.map((u, idx) => (
                    <motion.tr
                      key={u._id}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      transition={{ delay: idx * 0.1 }}
                      className="border-b border-gray-200 dark:border-gray-700"
                    >
                      <td className="p-2">{idx + 1}</td>
                      <td className="p-2">
                        <img
                          src={u.profileAvatar || "/default-avatar.png"}
                          alt={u.userName}
                          className="h-10 w-10 rounded-full"
                        />
                      </td>
                      <td className="p-2">{u.userName || "Unknown User"}</td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-2 text-gray-500 text-center">
                      No users
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
