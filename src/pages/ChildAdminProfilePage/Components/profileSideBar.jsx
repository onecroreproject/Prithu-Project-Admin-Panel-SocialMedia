import React, { useState } from "react";
import { FaTrash, FaBan, FaEdit, FaCamera } from "react-icons/fa";
import { toast } from "react-toastify";
import Info from "./Info";
import { useAdminAuth } from "../../../context/adminAuthContext";
import { useAdminProfile } from "../../../context/adminProfileContext";

export default function ProfileSidebar({ profile, handleAction, setProfile }) {
  const { role } = useAdminAuth(); 
  const {updateProfile}=useAdminProfile()
  const isChildAdmin = role === "Child_Admin";

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile || {});
  const [isUpdating, setIsUpdating] = useState(false);
  const [newAvatar, setNewAvatar] = useState(null);

  const handleEditToggle = () => {
    if (!isChildAdmin) return; // Only Child_Admin can edit
    setIsEditing(!isEditing);
    setFormData(profile);
    setNewAvatar(null);
  };

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
    if (file) setNewAvatar(file);
  };

  const handleUpdateProfile = async () => {
    if (!isChildAdmin || isUpdating) return;
    setIsUpdating(true);

    try {
      const { success, message } = await updateProfile(formData, newAvatar);

      if (success) {
        setProfile((prev) => ({
          ...prev,
          ...formData,
          profileAvatar: newAvatar ? URL.createObjectURL(newAvatar) : prev.profileAvatar,
        }));
        toast.success(message);
        setIsEditing(false);
        setNewAvatar(null);
      } else {
        toast.error(message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Update failed!");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 w-full lg:max-w-xs flex flex-col items-center shadow-lg">
      {/* Profile Avatar */}
      <div className="relative">
        <img
          src={newAvatar ? URL.createObjectURL(newAvatar) : profile.profileAvatar}
          alt="Profile Avatar"
          className="w-24 h-24 rounded-full object-cover mb-3"
        />
        {/* Edit overlay shown only for Child_Admin while editing */}
        {isChildAdmin && isEditing && (
          <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
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

      {/* Name */}
      <h3 className="text-lg font-semibold mb-1">
        {isEditing ? (
          <input
            type="text"
            name="userName"
            value={formData.userName || ""}
            onChange={handleInputChange}
            className="bg-gray-50 px-3 py-2 rounded w-full text-center"
          />
        ) : (
          profile.userName
        )}
      </h3>

      <p className="text-sm text-gray-600 mb-2">{profile.email}</p>
      <p className="text-xs text-gray-500 mb-4">Role: {profile.role}</p>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-3 mb-4">
        <button
          onClick={() => handleAction(profile.isActive ? "block" : "unblock")}
          className={`px-3 py-1 rounded ${
            profile.isActive ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
          }`}
        >
          <FaBan className="inline-block mr-1" />
          {profile.isActive ? "Block" : "Unblock"}
        </button>
        <button
          onClick={() => handleAction("delete")}
          className="px-3 py-1 rounded bg-red-100 text-red-600"
        >
          <FaTrash className="inline-block mr-1" /> Delete
        </button>
      </div>

      {/* Social Links */}
      <div className="w-full mt-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          Social Media Links
          {isChildAdmin&&<button
            onClick={handleEditToggle}
            className="ml-auto flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <FaEdit /> {isEditing ? "Cancel" : "Edit"}
          </button>}
       
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700 w-full">
          {["facebook", "instagram", "twitter", "linkedin", "github", "youtube", "website"].map(
            (key,idx) => (
              <div key={idx}>
                {isEditing ? (
                  <input
                    type="text"
                    name={key}
                    value={formData.socialLinks?.[key] || ""}
                    onChange={handleSocialChange}
                    className="bg-gray-50 px-3 py-2 rounded w-full"
                  />
                ) : (
                  <Info
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    value={profile.socialLinks?.[key] || "-"}
                    link={profile.socialLinks?.[key]}
                  />
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* Update Button */}
      {isEditing && isChildAdmin && (
        <div className="mt-4 flex justify-center w-full">
          <button
            onClick={handleUpdateProfile}
            className="px-4 py-2 text-white rounded bg-blue-600 hover:bg-blue-700"
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Update Profile"}
          </button>
        </div>
      )}
    </div>
  );
}
