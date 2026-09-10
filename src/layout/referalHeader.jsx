
import { motion, AnimatePresence } from "framer-motion";

export default function ReferralHeader({ user }) {
 
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={user.id} // Animate when user changes
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl shadow mb-8"
      >
        {/* Left: User info */}
        <div className="flex items-center space-x-4">
          <motion.img
            key={user.avatar}
            src={user.avatar}
            alt={user.name}
            className="h-16 w-16 rounded-full border-2 border-blue-500"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          />
          <div>
            <motion.h2
              key={user.userName}
              className="text-lg font-semibold text-gray-800 dark:text-white"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              {user.userName}
            </motion.h2>
            <motion.p
              key={user.level}
              className="text-sm text-gray-500 dark:text-gray-300"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.5 }}
            >
              Level {user.level}
            </motion.p>
          </div>
        </div>

        {/* Right: Earnings info */}
        <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
          {[
            { label: "Earnings", value: user.totalEarned, bg: "bg-blue-50" },
            { label: "Withdrawable", value: user.totalEarned, bg: "bg-green-50" },
            { label: "Already Withdrawn", value: user.totalWithdrawn, bg: "bg-yellow-50" },
            { label: "Balance", value: user.totalEarned-user.totalWithdrawn, bg: "bg-purple-50" },
          ].map((item) => (
            <motion.div
              key={item.label}
              className={`${item.bg} dark:bg-gray-800 p-2 rounded text-center w-36`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="font-semibold text-gray-800 dark:text-white">₹{item.value}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
