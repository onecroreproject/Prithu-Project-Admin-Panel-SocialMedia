import React, { useEffect, useState } from "react";
import { FaCopy, FaEdit, FaLink } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminProfile } from "../context/adminProfileContext";

export default function AdminProfileEdit({ isOpen = true, onClose }) {
  const { profile, updateProfile, updating } = useAdminProfile();
 
  // ✅ Initialize formData and socialLinks with fallback
  const getInitialFormData = () => ({
    displayName: profile?.displayName || "N/A",
    bio: profile?.bio || "N/A",
    phoneNumber: profile?.phoneNumber || "N/A",
    dateOfBirth: profile?.dateOfBirth || "N/A",
    maritalStatus: profile?.maritalStatus || "N/A",
    maritalDate: profile?.maritalDate || "N/A",
    theme: profile?.theme || "light",
    language: profile?.language || "en",
    timezone: profile?.timezone || "Asia/Kolkata",
    gender: profile?.gender || "N/A",
    userName: profile?.userName || "N/A",
    email: profile?.userEmail || "N/A",
  });

  const getInitialSocialLinks = () => ({
    facebook: profile?.socialLinks?.facebook || "",
    instagram: profile?.socialLinks?.instagram || "",
    twitter: profile?.socialLinks?.twitter || "",
    linkedin: profile?.socialLinks?.linkedin || "",
    github: profile?.socialLinks?.github || "",
    youtube: profile?.socialLinks?.youtube || "",
    website: profile?.socialLinks?.website || "",
  });

  const [formData, setFormData] = useState(getInitialFormData());
  const [socialLinks, setSocialLinks] = useState(getInitialSocialLinks());
  const [originalSocialLinks, setOriginalSocialLinks] = useState(getInitialSocialLinks());
  const [originalData, setOriginalData] = useState(getInitialFormData());
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [socialEditMode, setSocialEditMode] = useState(false);
  const [show, setShow] = useState(false);

  const fadeLeft = {
    hidden: { opacity: 0, x: -40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", duration: 0.55, bounce: 0.17 },
    },
  };

  useEffect(() => {
    if (isOpen) setShow(true);
    else {
      const timeout = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // ✅ Reset on profile update
  useEffect(() => {
    const initData = getInitialFormData();
    const initLinks = getInitialSocialLinks();
    setFormData(initData);
    setOriginalData(initData);
    setSocialLinks(initLinks);
    setOriginalSocialLinks(initLinks);
    setPreview(profile?.profileAvatar || null);
  }, [profile, isOpen]);

  // ✅ Handle field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setSocialLinks((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  // ✅ Submit Profile Update
const handleSubmit = async (e) => {
  e.preventDefault();

  const changedData = {};
  Object.keys(formData).forEach((key) => {
    if (formData[key] !== originalData[key] && formData[key] !== "N/A") {
      changedData[key] = formData[key];
    }
  });

  const changedSocialLinks = {};
  Object.keys(socialLinks).forEach((key) => {
    if (socialLinks[key] !== originalSocialLinks[key]) {
      changedSocialLinks[key] = socialLinks[key];
    }
  });

  if (Object.keys(changedSocialLinks).length > 0) changedData.socialLinks = changedSocialLinks;

  if (Object.keys(changedData).length === 0 && !avatar) {
    alert("No changes to update.");
    return;
  }

  const res = await updateProfile(changedData, avatar);
  if (res?.success) {
    alert("Profile updated successfully!");
    setEditMode(false);
    setSocialEditMode(false);
    onClose && onClose();
    setOriginalData(formData);
    setOriginalSocialLinks(socialLinks);
  } else {
    alert(res?.message || "Update failed");
  }
};


  const handleCopy = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      alert("Copied!");
    }
  };

  if (!show) return null;

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 w-full">
      {/* Sidebar */}
      <motion.div
        variants={fadeLeft}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-xl border border-gray-200 p-6 w-full md:max-w-xs flex flex-col items-center shadow"
      >
        <img
          src={preview || "/default-avatar.png"}
          alt={formData.email || "avatar"}
          className="w-20 h-20 rounded-full object-cover mb-2"
        />
        <div className="text-center w-full">
          <div className="font-semibold text-lg text-gray-900 mb-1">
            {formData.email !== "N/A" ? formData.email : "No email"}
          </div>
          <div className="text-xs text-gray-500 mb-2">
            {profile?.lastLogin || "Last login not available"}
          </div>
          <div className="flex items-center justify-center space-x-2 mb-5">
            <span className="bg-gray-100 rounded px-2 py-1 text-xs font-mono text-gray-600">
              User ID: {profile?.id || "N/A"}
            </span>
            <button
              onClick={() => handleCopy(profile?.userId)}
              className="bg-gray-200 px-2 py-1 rounded text-xs flex items-center gap-1 hover:bg-gray-300"
            >
              <FaCopy className="w-3 h-3" /> Copy
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Personal Info Section */}
        <motion.div
          variants={fadeLeft}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl border border-gray-200 p-6 relative shadow"
        >
          <h2 className="text-base font-semibold mb-3 flex items-center justify-between">
            Personal Information
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="ml-2 px-2 py-1 rounded hover:bg-gray-100 flex items-center gap-2 text-blue-600"
              >
                <FaEdit className="w-4 h-4" /> Edit
              </button>
            )}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Avatar Upload */}
            {editMode && (
              <motion.div
                layout
                className="md:col-span-2 flex items-center gap-4 mb-3"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
              >
                <img
                  src={preview || "/default-avatar.png"}
                  alt="avatar"
                  className="w-20 h-20 rounded-full border object-cover"
                />
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </motion.div>
            )}

            {/* Fields */}
            {["userName", "displayName", "bio", "phoneNumber"].map((key) => (
              <div key={key} className="md:col-span-2">
                <label className="block mb-1 text-sm text-gray-600 capitalize">{key}</label>
                {editMode ? (
                  key === "bio" ? (
                    <textarea
                      name={key}
                      value={formData[key] || ""}
                      onChange={handleChange}
                      className="w-full border px-3 py-2 rounded"
                      placeholder="N/A"
                    />
                  ) : (
                    <input
                      type="text"
                      name={key}
                      value={formData[key] || ""}
                      onChange={handleChange}
                      className="w-full border px-3 py-2 rounded"
                      placeholder="N/A"
                    />
                  )
                ) : (
                  <div className="bg-gray-50 rounded px-3 py-2">{formData[key] || "-"}</div>
                )}
              </div>
            ))}

            {editMode && (
              <div className="md:col-span-2 flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-2"
                >
                  {updating ? "Updating..." : "Update Profile"}
                </button>
              </div>
            )}
          </form>
        </motion.div>

        {/* ✅ Social Media Section */}
        <motion.div
          variants={fadeLeft}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl border border-gray-200 p-6 mt-2 shadow"
        >
          <h2 className="text-base font-semibold mb-3 flex justify-between items-center">
            Social Media Accounts
            {!socialEditMode && (
              <button
                onClick={() => setSocialEditMode(true)}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
              >
                <FaEdit className="w-4 h-4" /> Edit
              </button>
            )}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Object.entries(socialLinks).map(([key, value]) => (
              <div key={key}>
                <label className="block mb-1 text-sm text-gray-600 capitalize flex items-center gap-2">
                  <FaLink className="text-gray-400" /> {key}
                </label>
                {socialEditMode ? (
                  <input
                    type="url"
                    name={key}
                    value={value}
                    onChange={handleSocialChange}
                    className="w-full border px-3 py-2 rounded"
                    placeholder={`Enter ${key} link`}
                  />
                ) : (
                  <div className="bg-gray-50 rounded px-3 py-2">
                    {value ? (
                      <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        {value}
                      </a>
                    ) : (
                      "-"
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {socialEditMode && (
            <div className="flex justify-end mt-4 gap-2">
              <button
                type="button"
                onClick={() => setSocialEditMode(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={updating}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                {updating ? "Updating..." : "Save Links"}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
