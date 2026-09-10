import React, { useState, useEffect } from "react";
import { FaTrash, FaBan, FaEdit, FaCamera } from "react-icons/fa";
import { toast } from "react-toastify";
import Info from "./Info";
import { useAdminAuth } from "../../../context/adminAuthContext";
import { updateChildAdminProfile } from "../../../Services/childAdminServices/childAdminServices";
import defaultAvatar from "../../../Assets/Images/default-avatar.png";

export default function ProfileSidebar({
  profile,
  handleAction,
  isEditing,
  setIsEditing,
  formData,
  setFormData,
  newAvatar,
  setNewAvatar,
  handleSaveAll,
  handleCancel,
  isSaving
}) {
  const { admin, role: currentUserRole } = useAdminAuth();
  // Super Admin can edit anyone. Child Admin can only edit their own profile.
  const isOwnProfile = admin?._id === profile?._id || admin?.id === profile?._id || admin?.userId === profile?._id;
  const canEdit = currentUserRole === "Admin" || (currentUserRole === "Child_Admin" && isOwnProfile);

  const [previewAvatar, setPreviewAvatar] = useState(null);

  useEffect(() => {
    return () => {
      if (previewAvatar) URL.revokeObjectURL(previewAvatar);
    };
  }, [previewAvatar]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [name]: value },
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAvatar(file);
      const url = URL.createObjectURL(file);
      if (previewAvatar) URL.revokeObjectURL(previewAvatar);
      setPreviewAvatar(url);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 w-full lg:max-w-xs flex flex-col items-center shadow-lg h-fit">
      {/* Profile Avatar */}
      <div className="relative group">
        <img
          src={previewAvatar || (profile.profile?.profileAvatar || profile.profileAvatar) || defaultAvatar}
          alt="Profile Avatar"
          className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-white shadow-md"
          onError={(e) => {
            e.target.src = defaultAvatar;
          }}
        />
        {isEditing && (
          <label className="absolute bottom-4 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 shadow-lg transition-transform hover:scale-110">
            <FaCamera />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Basic Info */}
      <div className="text-center w-full mb-6">
        <h3 className="text-xl font-bold text-gray-800">
          {isEditing ? (
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleInputChange}
              className="bg-gray-50 border border-gray-300 px-3 py-1 rounded w-full text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            profile.userName
          )}
        </h3>
        <p className="text-sm text-gray-500">{profile.email}</p>
        <div className="mt-2 inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold uppercase tracking-wider">
          {profile.role || "Child Admin"}
        </div>
      </div>

      {/* Action Buttons (Block/Delete) - only for Super Admin */}
      {currentUserRole === "Admin" && (
        <div className="flex justify-center space-x-3 w-full mb-6 border-t border-gray-100 pt-6">
          <button
            onClick={() => handleAction(profile.isActive ? "block" : "unblock")}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${profile.isActive
              ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
              : "bg-green-50 text-green-700 hover:bg-green-100"
              }`}
          >
            <FaBan />
            {profile.isActive ? "Block" : "Unblock"}
          </button>
          <button
            onClick={() => handleAction("delete")}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium transition"
          >
            <FaTrash /> Delete
          </button>
        </div>
      )}

      {/* Social Links */}
      <div className="w-full border-t border-gray-100 pt-6">
        <div className="flex items-center justify-between mb-5">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            Social Presence
          </h4>
          {canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase transition-colors hover:underline"
            >
              Edit
            </button>
          )}
        </div>

        <div className="space-y-4 w-full">
          {["facebook", "instagram", "twitter", "youtube"].map((key) => (
            <div key={key} className="w-full">
              {isEditing ? (
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-xs font-bold uppercase">{key.charAt(0)}</span>
                  </div>
                  <input
                    type="text"
                    name={key}
                    value={formData.socialLinks?.[key] || ""}
                    onChange={handleSocialChange}
                    placeholder={`${key.charAt(0).toUpperCase() + key.slice(1)} URL`}
                    className="bg-gray-50 border border-gray-200 pl-8 pr-3 py-2.5 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-xs"
                  />
                </div>
              ) : (
                <Info
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={profile.profile?.socialLinks?.[key] || "-"}
                  link={profile.profile?.socialLinks?.[key]}
                  className="text-xs"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Unified Action Buttons */}
      {isEditing && (
        <div className="mt-8 w-full space-y-3">
          <button
            onClick={handleSaveAll}
            className="w-full py-3.5 text-white font-bold rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : "Save Changes"}
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="w-full py-3.5 text-gray-700 font-bold rounded-xl bg-gray-100 hover:bg-gray-200 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
