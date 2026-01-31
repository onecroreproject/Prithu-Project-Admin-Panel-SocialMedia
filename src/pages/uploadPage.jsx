import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Eye } from "lucide-react";

import FeedUploadPage from "../components/FeedUpload/FeedUploadPage";
import FeedManagement from "../pages/Tables/feedManagementTable";

export default function UploadPage() {
  const [activeTab, setActiveTab] = useState("feedUpload");

  const tabVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  };

  const tabs = [
    { id: "feedUpload", label: "Feed Upload", icon: <PlusCircle className="h-4 w-4 mr-2" /> },
    { id: "feedManagement", label: "Feed Management", icon: <Eye className="h-4 w-4 mr-2" /> },
  ];

  return (
    <div className="mx-auto mt-6 px-4 md:px-8">
      {/* Tab Switcher */}
      <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700 -mb-0.5 max-w-6xl mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === tab.id
              ? "border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10"
              : "border-transparent text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        <AnimatePresence mode="wait">
          {activeTab === "feedUpload" && (
            <motion.div
              key="feedUpload"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabVariants}
              transition={{ duration: 0.3 }}
            >
              <FeedUploadPage />
            </motion.div>
          )}

          {activeTab === "feedManagement" && (
            <motion.div
              key="feedManagement"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabVariants}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto bg-white dark:bg-white/[0.03] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm"
            >
              <FeedManagement />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

