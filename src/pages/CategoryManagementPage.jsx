import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, Sparkles } from "lucide-react";

import CategoryManagement from "./Tables/categoryManagementTable";
import DropdownManagement from "./Forms/dropdownManagement";

export default function CategoryManagementPage() {
  const [activeTab, setActiveTab] = useState("categoryManagement");

  const tabVariants = {
    hidden: { opacity: 0, y: -8 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 },
  };

  const tabs = [
    { id: "categoryManagement", label: "Category Management", icon: <Folder className="h-4 w-4" /> },
    { id: "dropdownManagement", label: "Post Global Options", icon: <Sparkles className="h-4 w-4" /> },
  ];

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "categoryManagement" && (
          <motion.div
            key="categoryManagement"
            initial="hidden" animate="visible" exit="exit"
            variants={tabVariants} transition={{ duration: 0.2 }}
          >
            <CategoryManagement />
          </motion.div>
        )}

        {activeTab === "dropdownManagement" && (
          <motion.div
            key="dropdownManagement"
            initial="hidden" animate="visible" exit="exit"
            variants={tabVariants} transition={{ duration: 0.2 }}
          >
            <DropdownManagement />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
