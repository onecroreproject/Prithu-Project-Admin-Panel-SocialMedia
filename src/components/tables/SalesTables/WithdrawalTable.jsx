import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Search,
    Download,
    ChevronLeft,
    ChevronRight,
    User,
    Wallet,
    Clock,
    CheckCircle,
    FileText
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { getRecentWithdrawalUsers } from "../../../Services/SalesDashboardSecrvices/metricServices";
import { exportToCSV } from "../../../Utils/exportUtils";

export default function WithdrawalTable() {
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    const { data: allWithdrawals = [], isLoading, isError } = useQuery({
        queryKey: ["allWithdrawalUsers"],
        queryFn: () => getRecentWithdrawalUsers(100),
    });

    const filteredData = useMemo(() => {
        return allWithdrawals.filter(w =>
            w.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allWithdrawals, searchQuery]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentItems = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const handleExport = () => {
        const headers = [
            { label: "User Name", key: "userName" },
            { label: "Email", key: "email" },
            { label: "Amount", key: "amount" },
            { label: "Processed At", key: "processedAt" },
        ];
        exportToCSV(filteredData, "Withdrawal_History", headers);
        toast.success("Exported successfully");
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading withdrawals...</div>;
    if (isError) return <div className="p-8 text-center text-red-500">Failed to load data.</div>;

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <Toaster />
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search withdrawals..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all"
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

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-gray-800">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Processed Date</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {currentItems.map((w, idx) => (
                            <tr key={w.id || idx} className="hover:bg-rose-50/10 dark:hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600">
                                            {w.avatar ? (
                                                <img src={w.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <User size={16} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">{w.userName}</p>
                                            <p className="text-xs text-gray-500">{w.email || "No email"}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-bold text-gray-900 dark:text-gray-100">
                                        ₹{w.amount?.toLocaleString() || "0"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} />
                                        {new Date(w.processedAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-800/50">
                                        <CheckCircle size={12} />
                                        Completed
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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
