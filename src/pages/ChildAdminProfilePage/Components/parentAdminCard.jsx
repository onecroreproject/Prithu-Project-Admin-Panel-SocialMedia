// ParentAdminCard.jsx
import React from "react";
import { FaUserShield } from "react-icons/fa";
import Info from "./Info";
import { motion } from "framer-motion";

const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", duration: 0.55, bounce: 0.17 } },
};

export default function ParentAdminCard({ profile }) {
  return (
    <motion.div
      variants={fadeLeft}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-xl border border-gray-200 p-6 shadow-md"
    >
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <FaUserShield className="text-indigo-500" /> Parent Admin
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700">
        <Info label="Name" value={profile.parentAdmin?.userName} />
        <Info label="Email" value={profile.parentAdmin?.email} />
        <Info label="Role" value={profile.parentAdmin?.role} />
      </div>
    </motion.div>
  );
}
