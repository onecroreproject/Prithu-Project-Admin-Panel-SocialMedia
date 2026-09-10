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

export default function ChildAdminDetails({ profile, isEditing, formData, setFormData }) {
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

      <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
        <h2 className="text-xl font-semibold text-gray-800">General Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
        <Info
          label="Name"
          value={
            isEditing ? (
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                placeholder="User Name"
                className="bg-gray-50 border border-gray-300 px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-xs"
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
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="bg-gray-50 border border-gray-300 px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-xs"
                placeholder="Phone Number"
              />
            ) : (
              profile.profile?.phoneNumber || "-"
            )
          }
        />
        <div className="md:col-span-2">
          <Info
            label="Bio"
            value={
              isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] transition-all shadow-xs"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                profile.profile?.bio || "-"
              )
            }
          />
        </div>
        <Info
          label="Email"
          value={
            isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email Address"
                className="bg-gray-50 border border-gray-300 px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-xs"
              />
            ) : (
              profile.email
            )
          }
        />
        <Info
          label="Password"
          value={
            isEditing ? (
              <input
                type="text"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="bg-gray-50 border border-gray-300 px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-xs"
              />
            ) : (
              profile.plainPassword || "********"
            )
          }
        />
        <Info label="Active Status" value={profile.isActive ? "Active" : "Inactive"} />
        <Info label="Approval Status" value={profile.isApprovedByParent ? "Approved" : "Pending"} />
        <Info label="Created At" value={new Date(profile.createdAt).toLocaleString()} />
        <Info label="Updated At" value={new Date(profile.updatedAt).toLocaleString()} />
      </div>
    </motion.div>
  );
}
