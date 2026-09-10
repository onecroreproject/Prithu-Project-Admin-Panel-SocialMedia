import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Search,
    Download,
    ChevronLeft,
    ChevronRight,
    X,
    User,
    CreditCard,
    Calendar,
    CheckCircle,
    AlertCircle
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { getRecentSubscriptionUsers } from "../../../Services/SalesDashboardSecrvices/metricServices";
import { exportToCSV } from "../../../Utils/exportUtils";

export default function SubscriptionTable() {
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch data (using the same service but maybe we need one without limit later)
    const { data: allUsers = [], isLoading, isError } = useQuery({
        queryKey: ["allSubscriptionUsers"],
        queryFn: () => getRecentSubscriptionUsers(100), // Get more for the table
    });

    // Filter logic
    const filteredData = useMemo(() => {
        return allUsers.filter(user =>
            user.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.planType?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allUsers, searchQuery]);

    // Pagination logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentItems = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const handleExport = () => {
        const headers = [
            { label: "User Name", key: "userName" },
            { label: "Email", key: "email" },
            { label: "Plan", key: "planType" },
            { label: "Start Date", key: "startDate" },
        ];
        exportToCSV(filteredData, "Subscription_Users", headers);
        toast.success("Exported successfully");
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading subscriptions...</div>;
    if (isError) return <div className="p-8 text-center text-red-500">Failed to load data.</div>;

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <Toaster />

            {/* Table Header */}
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search subscriptions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                </div>

                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
                >
                    <Download className="w-4 h-4" />
                    Export
                </button>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-gray-800">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Plan Type</th>
                            <th className="px-6 py-4">Start Date</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {currentItems.map((user, idx) => (
                            <tr key={user.userId || idx} className="hover:bg-indigo-50/10 dark:hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <User size={16} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">{user.userName}</p>
                                            <p className="text-xs text-gray-500">{user.email || "No email"}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
                                        <CreditCard size={12} />
                                        {user.planType?.toUpperCase() || "BASIC"}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <Calendar size={14} />
                                        {new Date(user.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                        <CheckCircle size={12} />
                                        Active
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/30 dark:bg-gray-800/30">
                <p className="text-sm text-gray-500">
                    Showing <span className="font-medium">{(page - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(page * itemsPerPage, filteredData.length)}</span> of <span className="font-medium">{filteredData.length}</span> results
                </p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 transition-all shadow-sm"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 transition-all shadow-sm"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
