import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchUserDeleteLogs } from "../../Services/UserServices/userServices";
import { motion } from "framer-motion";
import { 
  UserX, 
  Clock, 
  User, 
  Phone, 
  MessageSquare, 
  ShieldAlert,
  ArrowRight
} from "lucide-react";

export default function UserDeletionLogsPage() {
  const [page, setPage] = React.useState(1);
  const limit = 20;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["userDeleteLogs", page],
    queryFn: () => fetchUserDeleteLogs({ page, limit }),
    keepPreviousData: true,
  });

  const logs = data?.logs || [];
  const pagination = data?.pagination || {};

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" /> Error Loading Logs
        </h3>
        <p className="mt-1">{error.message || "Failed to fetch deletion logs."}</p>
        <button 
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <UserX className="w-8 h-8 text-red-500" /> Account Deletion Logs
          </h1>
          <p className="text-gray-500 mt-1">
            Track user deactivations and deletions with their provided reasons.
          </p>
        </div>
      </header>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User Snapshot</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500 italic">
                    No deletion logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <motion.tr 
                    key={log._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" /> {formatDate(log.actionDate || log.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                          <User className="w-4 h-4 text-blue-500" /> {log.nameSnapshot || log.userId?.userName || "Unknown User"}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Phone className="w-3.5 h-3.5 text-gray-400" /> {log.mobileSnapshot || "No phone snapshot"}
                        </div>
                        {log.userId?.email && (
                          <div className="text-[10px] text-gray-400 font-mono pl-6">
                            ID: {log.userId._id}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.actionType === "delete_now" 
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" 
                          : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                      }`}>
                        {log.actionType === "delete_now" ? "Permanent Deletion" : "Account Deactivation"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 max-w-md">
                        <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                          "{log.reason || "No reason provided."}"
                        </p>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Page {page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
              >
                Previous
              </button>
              <button
                disabled={page === pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
