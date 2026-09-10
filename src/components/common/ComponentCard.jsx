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
 