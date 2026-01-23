import { useState } from "react";
import { FiMoreVertical } from "react-icons/fi";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function RecentWithdrawalUsers() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const users = [
    { id: 1, name: "Vikram Singh", email: "vikram@example.com", withdrawn: "11 Oct 2025", amount: "$250", profilePic: "https://randomuser.me/api/portraits/men/45.jpg" },
    { id: 2, name: "Neha Gupta", email: "neha@example.com", withdrawn: "12 Oct 2025", amount: "$150", profilePic: "https://randomuser.me/api/portraits/women/30.jpg" },
    { id: 3, name: "Rohit Kumar", email: "rohit@example.com", withdrawn: "13 Oct 2025", amount: "$50", profilePic: "https://randomuser.me/api/portraits/men/28.jpg" },
    { id: 4, name: "Priya Sharma", email: "priya@example.com", withdrawn: "14 Oct 2025", amount: "$300", profilePic: "https://randomuser.me/api/portraits/women/24.jpg" },
    { id: 5, name: "Karthik R", email: "karthik@example.com", withdrawn: "15 Oct 2025", amount: "$100", profilePic: "https://randomuser.me/api/portraits/men/22.jpg" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative rounded-2xl border border-gray-200 bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-5 pb-5 pt-5 shadow-md dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 sm:px-4 sm:pt-5 transition-all duration-500 hover:shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Recent Withdrawal Users</h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">Latest users who withdrew recently</p>
        </div>

        {/* Dropdown */}
        <div
          className="relative"
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <button className="p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-700 transition">
            <FiMoreVertical className="text-gray-600 dark:text-gray-300" />
          </button>

          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg z-10"
            >
              <ul className="text-sm">
                <li>
                  <button
                    onClick={() => navigate("/withdrawals")}
                    className="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                  >
                    View All Withdrawals
                  </button>
                </li>
              </ul>
            </motion.div>
          )}
        </div>
      </div>

      {/* Table with max 4 rows */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(4 * 3rem)' }}>
        <table className="w-full text-sm text-left text-gray-700 dark:text-gray-200 table-fixed">
          <thead className="text-gray-600 uppercase text-xs border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="py-2 px-2 w-1/4 truncate">User</th>
              <th className="py-2 px-2 w-1/4 truncate">Withdrawn</th>
              <th className="py-2 px-2 w-1/4 truncate">Amount</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-indigo-50/20 dark:hover:bg-white/5 transition-all"
              >
                <td className="py-2 px-2 flex items-center gap-2 truncate">
                  <img
                    src={user.profilePic}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-indigo-300"
                  />
                  <div className="truncate">
                    <p className="font-medium text-gray-800 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </td>
                <td className="py-2 px-2 text-gray-600 dark:text-gray-400 truncate">{user.withdrawn}</td>
                <td className="py-2 px-2 text-gray-600 dark:text-gray-400 font-medium truncate">{user.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Glow */}
      <div className="absolute -top-5 -right-5 w-24 h-24 bg-indigo-300 rounded-full blur-2xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-pink-300 rounded-full blur-2xl opacity-20 animate-pulse"></div>
    </motion.div>
  );
}
