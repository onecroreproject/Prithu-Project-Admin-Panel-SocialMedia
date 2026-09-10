import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, ChevronDown, ChevronRight, X, Info } from "lucide-react";
import { toast } from "react-hot-toast";

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [granted, setGranted] = useState(new Set());
  const [expandedGroups, setExpandedGroups] = useState(new Set(PERMISSION_HIERARCHY.map(g => g.name)));
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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

  // Sync state when data comes in
  useEffect(() => {
    if (permissions?.grantedPermissions) {
      setGranted(new Set(permissions.grantedPermissions));
    }
  }, [permissions]);

  const existingPermissions = useMemo(() => {
    return permissions?.grantedPermissions || [];
  }, [permissions]);

  const mutation = useMutation({
    mutationFn: (updated) => updateChildAdminPermissions(id, updated),
    onSuccess: () => {
      toast.success("Permissions updated successfully!");
      queryClient.invalidateQueries(["adminPermissions", id]);
      setIsConfirmOpen(false);
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

  const toggleGroupExpansion = (groupName) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupName)) next.delete(groupName);
      else next.add(groupName);
      return next;
    });
  };

  const handleConfirmSave = () => {
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
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium">Loading permission matrices...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto bg-gray-50 min-h-screen relative">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all shadow-sm group"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="text-blue-600" /> Manage Permissions
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <img
                src={admin?.profile?.profileAvatar || "/default-avatar.png"}
                className="w-5 h-5 rounded-full object-cover"
                alt=""
              />
              <p className="text-sm text-gray-500">{admin?.userName} • {admin?.email}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsConfirmOpen(true)}
          className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <CheckCircle2 size={18} />
          Give Permission
        </button>
      </header>

      <div className="space-y-4">
        {PERMISSION_HIERARCHY.map((group) => {
          const isMainGranted = granted.has(group.parent);
          const isExpanded = expandedGroups.has(group.name);
          const hasChildren = group.children.length > 0;

          return (
            <div
              key={group.name}
              className={`bg-white rounded-2xl border transition-all ${isMainGranted ? 'border-blue-100 shadow-sm' : 'border-gray-100'}`}
            >
              <div className="p-4 flex items-center justify-between gap-4">
                <div
                  className="flex items-center gap-4 cursor-pointer flex-1"
                  onClick={() => hasChildren && toggleGroupExpansion(group.name)}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isMainGranted ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{group.name}</h3>
                    <p className="text-xs text-gray-400 font-mono uppercase tracking-tighter">{group.parent}</p>
                  </div>
                  {hasChildren && (
                    <div className="ml-2 text-gray-300">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-end mr-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isMainGranted ? 'text-blue-600' : 'text-gray-300'}`}>
                      {isMainGranted ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={isMainGranted}
                      onChange={() => handleToggle(group.parent, true, group.children)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && hasChildren && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-gray-50/50"
                  >
                    <div className="p-4 pt-0 space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {group.children.map((child) => {
                          const isChildGranted = granted.has(child);
                          return (
                            <div
                              key={child}
                              onClick={() => isMainGranted && handleToggle(child)}
                              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${!isMainGranted ? 'opacity-40 cursor-not-allowed grayscale' : 'cursor-pointer'
                                } ${isChildGranted ? 'bg-white border-blue-200 shadow-sm' : 'bg-transparent border-gray-100 hover:border-gray-200'}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${isChildGranted ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-gray-300'}`} />
                                <span className="text-sm font-medium text-gray-700 capitalize">{formatLabel(child)}</span>
                              </div>
                              {isMainGranted ? (
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isChildGranted ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}>
                                  {isChildGranted && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                              ) : (
                                <Lock size={14} className="text-gray-400" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSave}
        existing={existingPermissions}
        next={Array.from(granted)}
        formatLabel={formatLabel}
        isLoading={mutation.isLoading}
      />

      {PERMISSION_HIERARCHY.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No permissions found in the registry.</p>
        </div>
      )}
    </div>
  );
}

function ConfirmationModal({ isOpen, onClose, onConfirm, existing, next, formatLabel, isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Shield size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Review Permission Changes</h2>
              <p className="text-sm text-gray-500">Please confirm the changes before saving to the database.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Existing Permissions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Info size={16} className="text-gray-400" />
                <h3 className="font-bold text-gray-700 uppercase tracking-wider text-xs">Exist Permissions ({existing.length})</h3>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4 min-h-[200px] shadow-sm">
                {existing.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {existing.map(p => (
                      <span key={p} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold border border-gray-200">
                        {formatLabel(p)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                    <AlertCircle size={32} strokeWidth={1.5} className="mb-2" />
                    <p className="text-sm">No permissions currently assigned.</p>
                  </div>
                )}
              </div>
            </div>

            {/* New Permissions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <CheckCircle2 size={16} className="text-blue-500" />
                <h3 className="font-bold text-blue-700 uppercase tracking-wider text-xs">Current Given Permissions ({next.length})</h3>
              </div>
              <div className="bg-blue-50/30 border border-blue-100 rounded-2xl p-4 min-h-[200px] shadow-sm ring-1 ring-blue-500/10">
                {next.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {next.map(p => (
                      <span key={p} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-sm shadow-blue-500/20">
                        {formatLabel(p)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                    <Shield size={32} strokeWidth={1.5} className="mb-2 opacity-50" />
                    <p className="text-sm">All permissions will be removed.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border-t border-gray-100 flex items-center justify-end gap-3 sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all border border-transparent"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-blue-600 text-white px-10 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 size={18} />}
            Confirm & Save
          </button>
        </div>
      </motion.div>
    </div>
  );
}
