import { motion } from "framer-motion";

const tabs = [
  { id: "posts", label: "Posts", icon: "📝" },
  { id: "following", label: "Following", icon: "👥" },
  { id: "followers", label: "Followers", icon: "🤝" },
  { id: "interested", label: "Interested", icon: "👍" },
  { id: "nonInterested", label: "Not Interested", icon: "👎" },
  { id: "hidden", label: "Hidden", icon: "👁️" },
  { id: "liked", label: "Liked", icon: "❤️" },
  { id: "disliked", label: "Disliked", icon: "👎" },
  { id: "commented", label: "Comments", icon: "💬" },
  { id: "shared", label: "Shared", icon: "🔄" },
  { id: "downloaded", label: "Downloads", icon: "📥" },
  { id: "saved", label: "Saved", icon: "⭐" },
];

export default function UserAnalyticsTabs({ activeTab, onTabChange }) {
  return (
    <div className="relative">
      <div className="flex space-x-1 px-6 pt-4 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative px-4 py-3 text-sm font-medium transition-all duration-200 rounded-t-lg whitespace-nowrap ${
              activeTab === tab.id
                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </div>
            
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}