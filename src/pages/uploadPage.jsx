import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Eye, Calendar } from "lucide-react";

import FeedUploadPage from "../components/FeedUpload/FeedUploadPage";
import FeedManagement from "../pages/Tables/feedManagementTable";
import ScheduledFeedTable from "../pages/Tables/ScheduledFeedTable";

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
    { id: "scheduledFeed", label: "Scheduled Feed", icon: <Calendar className="h-4 w-4 mr-2" /> },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto mt-4 px-3 sm:px-6">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          {activeTab === "feedUpload" && (
            <motion.div
              key="feedUpload"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabVariants}
              transition={{ duration: 0.2 }}
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
              transition={{ duration: 0.2 }}
              className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm"
            >
              <FeedManagement />
            </motion.div>
          )}
          {activeTab === "scheduledFeed" && (
            <motion.div
              key="scheduledFeed"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabVariants}
              transition={{ duration: 0.2 }}
              className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm"
            >
              <ScheduledFeedTable />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

