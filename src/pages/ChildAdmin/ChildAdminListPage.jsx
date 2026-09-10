import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getChildAdmins, deleteChildAdmin } from "../../Services/childAdminServices/childAdminServices";
import { Eye, Trash2, Mail, User, Clock, ShieldCheck } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import defaultAvatar from "../../Assets/Images/default-avatar.png";

const ChildAdminListPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isDeleting, setIsDeleting] = useState(null);

    const { data: admins, isLoading, isError } = useQuery({
        queryKey: ["childAdmins"],
        queryFn: getChildAdmins,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteChildAdmin,
        onSuccess: (data) => {
            toast.success(data.message || "Admin deleted successfully");
            queryClient.invalidateQueries(["childAdmins"]);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to delete admin");
        },
        onSettled: () => setIsDeleting(null)
    });

    const handleDelete = (id, name) => {
        if (window.confirm(`Are you sure you want to delete admin "${name}"?`)) {
            setIsDeleting(id);
            deleteMutation.mutate(id);
        }
    };

    const formatOnlineTime = (hours) => {
        if (!hours || hours === 0) return "0h 0m";
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h}h ${m}m`;
    };

    if (isLoading) return <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;

    if (isError) return <div className="p-8 text-center text-red-600">Failed to load child admins.</div>;

    return (
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <ToastContainer />
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="text-blue-600" />
                        Admin Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        View and manage all sub-admin accounts
                    </p>
                </div>
                <button
                    onClick={() => navigate("/settings/child/admin/page")}
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                    + Create New Admin
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin Detail</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID / Type</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Online Time (Today)</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {admins?.length > 0 ? (
                                admins.map((admin) => (
                                    <tr key={admin._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                                                    <img
                                                        src={admin.profileAvatar || defaultAvatar}
                                                        alt={admin.userName}
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => e.target.src = defaultAvatar}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                                        {admin.userName}
                                                        {admin.isOnline && <span className="h-2 w-2 rounded-full bg-green-500" title="Online now"></span>}
                                                    </div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" /> {admin.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 dark:text-white font-mono">{admin.childAdminId}</div>
                                            <div className="text-xs text-gray-500">{admin.childAdminType || "Standard"}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                <Clock className="w-4 h-4 text-blue-500" />
                                                {formatOnlineTime(admin.onlineHoursToday)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/settings/childadmin/permission/${admin._id}`)}
                                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                                    title="Edit Permissions"
                                                >
                                                    <ShieldCheck className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/settings/child/admin/profile/${admin._id}`)}
                                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                                    title="View Profile"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(admin._id, admin.userName)}
                                                    disabled={isDeleting === admin._id}
                                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                    title="Delete Admin"
                                                >
                                                    {isDeleting === admin._id ? (
                                                        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent animate-spin rounded-full"></div>
                                                    ) : (
                                                        <Trash2 className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                        No child admins found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ChildAdminListPage;
