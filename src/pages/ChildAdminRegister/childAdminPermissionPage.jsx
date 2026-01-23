import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAdminPermissions,
  fetchChildAdminProfile,
  updateChildAdminPermissions,
} from "../../Services/childAdminServices/childAdminServices";

const fadeInOut = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", duration: 0.5, bounce: 0.15 } },
  exit: { opacity: 0, x: 40, transition: { duration: 0.3 } },
};

export default function ChildAdminPermissionPage() {
  const { id } = useParams(); 
  const prevAdminId = useRef(null);
  const [granted, setGranted] = useState([]);
  const [ungranted, setUngranted] = useState([]);
  const [selectedGranted, setSelectedGranted] = useState([]);
  const [selectedUngranted, setSelectedUngranted] = useState([]);

  // ✅ Fetch child admin profile
  const { data: admin, isLoading: loadingProfile, isError: errorProfile } = useQuery({
    queryKey: ["childAdminProfile", id],
    queryFn: () => fetchChildAdminProfile(id),
    enabled: !!id,
  });

  // ✅ Fetch permissions
  const { data: permissions, isLoading: loadingPermissions, isError: errorPermissions } = useQuery({
    queryKey: ["adminPermissions", id],
    queryFn: () => getAdminPermissions(id),
    enabled: !!id,
  });
 console.log(permissions)
  // ✅ Populate granted/ungranted when permissions load
  useEffect(() => {
    if (!permissions) return;
    if (id !== prevAdminId.current) {
      setGranted(permissions.grantedPermissions || []);
      setUngranted(permissions.ungrantedPermissions || []);
      setSelectedGranted([]);
      setSelectedUngranted([]);
      prevAdminId.current = id;
    }
  }, [id, permissions]);

  // ✅ Update permissions
  const mutation = useMutation({
    mutationFn: (updated) => updateChildAdminPermissions(id, updated),
    onSuccess: () => {
      alert("✅ Permissions updated successfully!");
    },
    onError: (err) => {
      console.error(err);
      alert("❌ Failed to update permissions");
    },
  });

  const toggleSelect = (permission, type) => {
    if (type === "granted") {
      setSelectedGranted((prev) =>
        prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission]
      );
    } else {
      setSelectedUngranted((prev) =>
        prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission]
      );
    }
  };

  const moveToUngranted = () => {
    setGranted((prev) => prev.filter((p) => !selectedGranted.includes(p)));
    setUngranted((prev) => [...prev, ...selectedGranted]);
    setSelectedGranted([]);
  };

  const moveToGranted = () => {
    setUngranted((prev) => prev.filter((p) => !selectedUngranted.includes(p)));
    setGranted((prev) => [...prev, ...selectedUngranted]);
    setSelectedUngranted([]);
  };

  const handleSave = () => {

    mutation.mutate({
      grantedPermissions: granted,
      menuPermissions: permissions.menuPermissions || [],
      customPermissions: permissions.customPermissions || [],
    });
  };

  if (loadingProfile || loadingPermissions)
    return <p className="p-6 text-center text-gray-600">Loading admin permissions...</p>;
  if (errorProfile || errorPermissions)
    return <p className="p-6 text-center text-red-500">Failed to load permissions or profile.</p>;

  const profile = admin?.profile || {};
  const avatar = profile.profileAvatar || "/default-avatar.png";

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-6 flex flex-col"
      variants={fadeInOut}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <div className="flex items-center space-x-4">
          <img
            src={avatar}
            alt={admin.userName}
            className="w-16 h-16 rounded-full object-cover border border-gray-300"
          />
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{admin.userName}</h2>
            <p className="text-gray-600 text-sm">{admin.email}</p>
          </div>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p><strong>Parent Admin:</strong> {admin.parentAdmin?.userName || "N/A"}</p>
          <p><strong>Role:</strong> Child Admin</p>
          <p><strong>Status:</strong> {admin.isActive ? "Active ✅" : "Inactive ❌"}</p>
        </div>
      </div>

      {/* Permission Editor */}
      <div className="flex flex-1 gap-6 mt-2 overflow-y-auto">
        {/* Granted */}
        <div className="flex-1 rounded-lg border border-gray-300 p-5 shadow-sm bg-white">
          <h3 className="font-semibold text-lg mb-4 text-gray-800 border-b border-gray-200 pb-2">
            Granted Permissions
          </h3>
          <ul className="space-y-2 max-h-[400px] overflow-auto">
            {granted.length === 0 && (
              <li className="text-gray-400 italic">No granted permissions</li>
            )}
            {granted.map((permission) => (
              <li key={permission}>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedGranted.includes(permission)}
                    onChange={() => toggleSelect(permission, "granted")}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="capitalize text-gray-700">{permission}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex flex-col justify-center items-center space-y-4">
          <button
            onClick={moveToUngranted}
            disabled={selectedGranted.length === 0}
            className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-red-300 transition"
          >
            Remove &gt;&gt;
          </button>
          <button
            onClick={moveToGranted}
            disabled={selectedUngranted.length === 0}
            className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300 transition"
          >
            &lt;&lt; Add
          </button>
        </div>

        {/* Ungranted */}
        <div className="flex-1 rounded-lg border border-gray-300 p-5 shadow-sm bg-white">
          <h3 className="font-semibold text-lg mb-4 text-gray-800 border-b border-gray-200 pb-2">
            Ungranted Permissions
          </h3>
          <ul className="space-y-2 max-h-[400px] overflow-auto">
            {ungranted.length === 0 && (
              <li className="text-gray-400 italic">No ungranted permissions</li>
            )}
            {ungranted.map((permission) => (
              <li key={permission}>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedUngranted.includes(permission)}
                    onChange={() => toggleSelect(permission, "ungranted")}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="capitalize text-gray-700">{permission}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 text-right">
        <button
          onClick={handleSave}
          className="px-7 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-blue-400"
          disabled={mutation.isLoading}
        >
          {mutation.isLoading ? "Saving..." : "Save Permissions"}
        </button>
      </div>
    </motion.div>
  );
}
