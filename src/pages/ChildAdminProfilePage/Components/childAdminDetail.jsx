// ChildAdminDetails.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEdit, FaTimes } from "react-icons/fa";
import Info from "./Info";

const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", duration: 0.55, bounce: 0.17 } },
};

export default function ChildAdminDetails({ profile }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile || {});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    navigate(`/social/childadmin/permission/${profile._id}`);
  };

  return (
    <motion.div
      variants={fadeLeft}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg relative"
    >
      <motion.button
        onClick={() => navigate(-1)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
      >
        <FaTimes />
      </motion.button>

      <h2 className="text-xl font-semibold mb-4">Child Admin Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
        <Info
          label="Name"
          value={
            isEditing ? (
              <input
                type="text"
                name="userName"
                value={formData.userName || ""}
                onChange={handleInputChange}
                className="bg-gray-50 px-3 py-2 rounded w-full"
              />
            ) : (
              profile.userName
            )
          }
        />
        <Info
          label="Phone Number"
          value={
            isEditing ? (
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber || ""}
                onChange={handleInputChange}
                className="bg-gray-50 px-3 py-2 rounded w-full"
              />
            ) : (
              profile.phoneNumber || "-"
            )
          }
        />
        <Info
          label="Bio"
          value={
            isEditing ? (
              <textarea
                name="bio"
                value={formData.bio || ""}
                onChange={handleInputChange}
                className="bg-gray-50 px-3 py-2 rounded w-full"
              />
            ) : (
              profile.bio || "-"
            )
          }
        />
        <Info label="Email" value={profile.email} />
        <Info label="Active Status" value={profile.isActive ? "Active" : "Inactive"} />
        <Info label="Approval Status" value={profile.isApprovedByParent ? "Approved" : "Pending"} />
        <Info label="Created At" value={new Date(profile.createdAt).toLocaleString()} />
        <Info label="Updated At" value={new Date(profile.updatedAt).toLocaleString()} />
      </div>

      {/* Only show Edit button if role is Child_Admin */}
      {profile.role === "Child_Admin" && (
        <button
          onClick={handleEdit}
          className="absolute top-4 right-4 flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          <FaEdit /> Edit
        </button>
      )}
    </motion.div>
  );
}
