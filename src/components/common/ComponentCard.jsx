import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, ChevronDown, FileText, FileSpreadsheet, FileCode } from "lucide-react";
 
export default function ComponentCard({ title, children, className = "", desc = "" }) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
 
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
 
  const fileFormats = [
    { label: "PDF Format", ext: "pdf", icon: FileText },
    { label: "Excel Format", ext: "xlsx", icon: FileSpreadsheet },
    { label: "CSV Format", ext: "csv", icon: FileCode },
  ];
 
  const handleDownload = (ext) => {
    alert(`Downloading file in ${ext.toUpperCase()} format - implement download logic!`);
    setDropdownOpen(false);
  };
 
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      {/* Card Header */}
      <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {desc && <p className="text-sm text-gray-500 mt-1">{desc}</p>}
        </div>
 
        {/* Download Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!isDropdownOpen)}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            aria-expanded={isDropdownOpen}
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>
 
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
              >
                {fileFormats.map((format) => {
                  const Icon = format.icon;
                  return (
                    <button
                      key={format.ext}
                      onClick={() => handleDownload(format.ext)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      <Icon className="w-4 h-4 text-gray-400" />
                      {format.label}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
 
      {/* Card Body */}
      <div className="p-4 sm:p-6">
        <div className="overflow-x-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
 