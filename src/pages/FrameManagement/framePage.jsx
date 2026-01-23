import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Images, Upload, Folder } from "lucide-react";

import FrameUploadForm from "./Component/frameUpload";
import FrameManagementTable from "./Component/frameManagement";

export default function FrameUploadPage() {
  const [activeTab, setActiveTab] = useState("frameUpload");

  const tabVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  };

  const tabs = [
    { id: "frameUpload", label: "Frame Upload", icon: <Upload className="h-4 w-4 mr-2" /> },
    { id: "frameManagement", label: "Frame Management", icon: <Folder className="h-4 w-4 mr-2" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Tab Switcher */}
      <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700 -mb-0.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          {activeTab === "frameUpload" && (
            <motion.div
              key="frameUpload"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabVariants}
              transition={{ duration: 0.3 }}
            >
              <FrameUploadForm />
            </motion.div>
          )}

          {activeTab === "frameManagement" && (
            <motion.div
              key="frameManagement"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabVariants}
              transition={{ duration: 0.3 }}
            >
              <FrameManagementTable />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
