import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FilePlus,
  ListTree,
  GitBranch,
  Layers,
  FolderSearch,
} from "lucide-react";

// Forms
import AddReportTypeForm from "./forms/addReportForm";
import AddReportQuestionForm from "./forms/addQuestionForm";
import AddFollowUpQuestionForm from "./forms/addFollowUpQuestionFrom";

// Tables
import ReportTypeTable from "./tables/reportTypeTable";
import ReportQuestionTable from "./tables/reportQuestionTable";

export default function ReportManagementPage() {
  const [activeTab, setActiveTab] = useState("addType");

  const tabVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  };

  const tabs = [
    {
      id: "addType",
      label: "Add Report Type",
      icon: <Layers className="h-4 w-4 mr-2" />,
    },
    {
      id: "addQuestion",
      label: "Add Question",
      icon: <FilePlus className="h-4 w-4 mr-2" />,
    },
    {
      id: "addFollowUp",
      label: "Add Follow-Up Question",
      icon: <GitBranch className="h-4 w-4 mr-2" />,
    },
    {
      id: "typeManagement",
      label: "Manage Types",
      icon: <FolderSearch className="h-4 w-4 mr-2" />,
    },
    {
      id: "questionManagement",
      label: "Manage Questions",
      icon: <ListTree className="h-4 w-4 mr-2" />,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">

      {/* TAB SWITCHER */}
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

      {/* TAB CONTENT */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          {activeTab === "addType" && (
            <motion.div
              key="addType"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabVariants}
              transition={{ duration: 0.3 }}
            >
              <AddReportTypeForm />
            </motion.div>
          )}

          {activeTab === "addQuestion" && (
            <motion.div
              key="addQuestion"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabVariants}
              transition={{ duration: 0.3 }}
            >
              <AddReportQuestionForm />
            </motion.div>
          )}

          {activeTab === "addFollowUp" && (
            <motion.div
              key="addFollowUp"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabVariants}
              transition={{ duration: 0.3 }}
            >
              <AddFollowUpQuestionForm />
            </motion.div>
          )}

          {activeTab === "typeManagement" && (
            <motion.div
              key="typeManagement"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabVariants}
              transition={{ duration: 0.3 }}
            >
              <ReportTypeTable />
            </motion.div>
          )}

          {activeTab === "questionManagement" && (
            <motion.div
              key="questionManagement"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabVariants}
              transition={{ duration: 0.3 }}
            >
              <ReportQuestionTable />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
