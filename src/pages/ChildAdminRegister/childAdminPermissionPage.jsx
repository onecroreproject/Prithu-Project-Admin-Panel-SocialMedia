import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ChevronRight, Lock, Unlock, CheckCircle2, AlertCircle } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  getAdminPermissions,
  fetchChildAdminProfile,
  updateChildAdminPermissions,
} from "../../Services/childAdminServices/childAdminServices";
import { PERMISSION_HIERARCHY } from "../../Config/permissionConfig";

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function ChildAdminPermissionPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [granted, setGranted] = useState(new Set());

  // Fetch child admin profile
  const { data: admin, isLoading: loadingProfile } = useQuery({
    queryKey: ["childAdminProfile", id],
    queryFn: () => fetchChildAdminProfile(id),
    enabled: !!id,
  });

  // Fetch permissions
  const { data: permissions, isLoading: loadingPermissions } = useQuery({
    queryKey: ["adminPermissions", id],
    queryFn: () => getAdminPermissions(id),
    enabled: !!id,
  });

  // Sync state when data comes in (fallback if onSuccess doesn't fire or for refetches)
  useEffect(() => {
    if (permissions?.grantedPermissions) {
      setGranted(new Set(permissions.grantedPermissions));
    }
  }, [permissions]);

  const mutation = useMutation({
    mutationFn: (updated) => updateChildAdminPermissions(id, updated),
    onSuccess: () => {
      toast.success("Permissions updated successfully!");
      queryClient.invalidateQueries(["adminPermissions", id]);
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to update permissions");
    },
  });

  const handleToggle = useCallback((permission, isParent, children = []) => {
    setGranted(prev => {
      const next = new Set(prev);
      if (next.has(permission)) {
        // If unchecking a parent, uncheck all its children too
        next.delete(permission);
        if (isParent && children.length > 0) {
          children.forEach(child => next.delete(child));
        }
      } else {
        next.add(permission);
      }
      return next;
    });
  }, []);

  const handleSave = () => {
    mutation.mutate({
      grantedPermissions: Array.from(granted),
      menuPermissions: permissions?.menuPermissions || [],
      customPermissions: permissions?.customPermissions || [],
    });
  };

  const formatLabel = (str) => {
    return str.replace(/([A-Z])/g, ' $1').replace(/^can /, '').trim();
  };

  if (loadingProfile || loadingPermissions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 font-medium">Loading permission matrix...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-4 sm:p-8">
      <ToastContainer />

      {/* Header Card */}
      <motion.div
        initial="hidden" animate="visible" variants={fadeIn}
        className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <img
              src={admin?.profile?.profileAvatar || "/default-avatar.png"}
              alt={admin?.userName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-100 dark:border-gray-600 shadow-sm"
            />
            {admin?.isOnline && (
              <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-4 border-white dark:border-gray-800"></span>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
              {admin?.userName}
              <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-600 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                Child Admin
              </span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{admin?.email}</p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSave}
              disabled={mutation.isLoading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-md shadow-blue-200 dark:shadow-none disabled:opacity-50 flex items-center gap-2"
            >
              {mutation.isLoading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
              ) : (
                <CheckCircle2 size={18} />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>

      {/* Permission Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {PERMISSION_HIERARCHY.map((group, idx) => {
            const isMainGranted = granted.has(group.parent);
            return (
              <motion.div
                key={group.name}
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: idx * 0.05 }}
                className={`group bg-white dark:bg-gray-800 rounded-2xl border transition-all duration-300 ${isMainGranted
                  ? "border-blue-200 dark:border-blue-900/50 shadow-md shadow-blue-50/50"
                  : "border-gray-200 dark:border-gray-700 shadow-sm"
                  }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl transition-colors ${isMainGranted
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                        : "bg-gray-50 text-gray-400 dark:bg-gray-700/50"
                        }`}>
                        <Shield size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white leading-tight">
                          {group.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono uppercase tracking-wider">
                          {group.parent}
                        </p>
                      </div>
                    </div>
                    <div
                      onClick={() => handleToggle(group.parent, true, group.children)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isMainGranted ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                        }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isMainGranted ? "translate-x-5" : "translate-x-0"
                        }`} />
                    </div>
                  </div>

                  {/* Children permissions */}
                  <AnimatePresence>
                    {isMainGranted && group.children.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-5 space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                          {group.children.map((child) => (
                            <div
                              key={child}
                              onClick={() => handleToggle(child)}
                              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <div className={`h-1.5 w-1.5 rounded-full ${granted.has(child) ? "bg-blue-500" : "bg-gray-300"}`} />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                                  {formatLabel(child)}
                                </span>
                              </div>
                              <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${granted.has(child)
                                ? "bg-blue-600 border-blue-600 shadow-sm"
                                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                                }`}>
                                {granted.has(child) && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Locked placeholder when main is disabled */}
                  {!isMainGranted && group.children.length > 0 && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 bg-gray-50 dark:bg-gray-700/30 p-2 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                      <Lock size={12} />
                      Enable {group.name} to configure sub-permissions
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Empty State Guard */}
      {PERMISSION_HIERARCHY.length === 0 && (
        <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-gray-300">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 font-medium">No permissions configured in the system.</p>
        </div>
      )}
    </div>
  );
}
