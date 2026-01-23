import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateChildAdminPermissions } from "../../Services/childAdminServices/childAdminServices";
import { motion } from "framer-motion";

export default function PermissionEditor({ admin, permissions, onPermissionsUpdated }) {
  const [granted, setGranted] = useState([]);
  const [ungranted, setUngranted] = useState([]);
  const [selectedGranted, setSelectedGranted] = useState([]);
  const [selectedUngranted, setSelectedUngranted] = useState([]);
  const prevAdminId = useRef(null);

  useEffect(() => {
    if (!permissions) return;
    if (admin?.childAdminId !== prevAdminId.current) {
      setGranted(permissions.grantedPermissions || []);
      setUngranted(permissions.ungrantedPermissions || []);
      setSelectedGranted([]);
      setSelectedUngranted([]);
      prevAdminId.current = admin?.childAdminId;
    }
  }, [admin?.childAdminId, permissions]);

  const mutation = useMutation({
    mutationFn: (updated) => updateChildAdminPermissions(admin.childAdminId, updated),
    onSuccess: () => {
      alert("Permissions updated successfully!");
      onPermissionsUpdated && onPermissionsUpdated();
    },
    onError: (err) => {
      console.error(err);
      alert("Failed to update permissions");
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
      menuPermissions: permissions.menuPermissions,
      customPermissions: permissions.customPermissions,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center mb-6">
        <img
          src={admin.avatarUrl || "/default-avatar.png"}
          alt={admin.userName}
          className="w-14 h-14 rounded-full mr-4 object-cover"
        />
        <h2 className="text-2xl font-semibold text-gray-900">{admin.userName}</h2>
      </div>

      {/* Permission Lists */}
      <div className="flex flex-1 gap-6 overflow-y-auto">
        {/* Granted */}
        <div className="flex-1 rounded-lg border border-gray-300 p-5 shadow-sm bg-white">
          <h3 className="font-semibold text-lg mb-4 text-gray-800 border-b border-gray-200 pb-2">Granted Permissions</h3>
          <ul className="space-y-2 max-h-[350px] overflow-auto">
            {granted.length === 0 && <li className="text-gray-400 italic">No granted permissions</li>}
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
          <h3 className="font-semibold text-lg mb-4 text-gray-800 border-b border-gray-200 pb-2">Ungranted Permissions</h3>
          <ul className="space-y-2 max-h-[350px] overflow-auto">
            {ungranted.length === 0 && <li className="text-gray-400 italic">No ungranted permissions</li>}
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
