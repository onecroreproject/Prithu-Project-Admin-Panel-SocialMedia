import React, { useEffect, useState } from "react";
import { useAdminProfile } from "../../context/adminProfileContext";


export default function AdminProfileEdit({ isOpen, onClose }) {
  const { profile, updateProfile, updating } = useAdminProfile();

  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    phoneNumber: "",
    dateOfBirth: "",
    maritalStatus: "",
    maritalDate: "",
    theme: "light",
    language: "en",
    timezone: "Asia/Kolkata",
    gender: "",
    userName: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);

  // Animation state
  const [show, setShow] = useState(false);

  // ✅ Fade-in / fade-out logic
  useEffect(() => {
    if (isOpen) {
      setShow(true);
    } else {
      const timeout = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // ✅ Pre-fill form when modal opens
  useEffect(() => {
    if (isOpen && profile) {
      setFormData((prev) => ({ ...prev, ...profile }));
      if (profile.profileAvatar) setPreview(profile.profileAvatar);
    }
  }, [isOpen, profile]);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle avatar upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await updateProfile(formData,avatar);
    if (res.success) {
      onClose();
    } else {
      alert(res.message);
    }
  };

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-[9] 
        transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] 
        ${isOpen ? "opacity-100 bg-black/50" : "opacity-0 bg-black/0"}`}
    >
      <div
        className={`w-full mx-4 p-6 bg-white dark:bg-gray-900 shadow-lg rounded-lg
          transform transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"}
          sm:max-w-lg md:max-w-2xl lg:max-w-3xl`}
      >
        <h2 className="text-2xl font-semibold mb-4">Edit Admin Profile</h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[70vh] overflow-y-auto"
        >
          {/* Avatar */}
          <div className="flex items-center space-x-4">
            <img
              src={preview || "/default-avatar.png"}
              alt="avatar"
              className="w-20 h-20 rounded-full border object-cover"
            />
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>

          {/* Username */}
          <div>
            <label className="block font-medium">Username</label>
            <input
              type="text"
              name="userName"
              value={formData.userName || ""}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          {/* Display Name */}
          <div>
            <label className="block font-medium">Display Name</label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName || ""}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block font-medium">Bio</label>
            <textarea
              name="bio"
              value={formData.bio || ""}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block font-medium">Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber || ""}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block font-medium">Gender</label>
            <select
              name="gender"
              value={formData.gender || ""}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block font-medium">Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth?.split("T")[0] || ""}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          {/* Marital Status */}
          <div>
            <label className="block font-medium">Marital Status</label>
            <select
              name="maritalStatus"
              value={formData.maritalStatus || ""}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Select</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
            </select>
          </div>

          {/* Marital Date */}
          {formData.maritalStatus === "married" && (
            <div>
              <label className="block font-medium">Marital Date</label>
              <input
                type="date"
                name="maritalDate"
                value={formData.maritalDate?.split("T")[0] || ""}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          )}

          {/* Theme */}
          <div>
            <label className="block font-medium">Theme</label>
            <select
              name="theme"
              value={formData.theme || "light"}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block font-medium">Language</label>
            <input
              type="text"
              name="language"
              value={formData.language || ""}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          {/* Timezone */}
          <div>
            <label className="block font-medium">Timezone</label>
            <input
              type="text"
              name="timezone"
              value={formData.timezone || ""}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              {updating ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
