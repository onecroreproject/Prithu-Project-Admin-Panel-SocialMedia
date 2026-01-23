import React, { useState } from "react";
import { motion } from "framer-motion";

const SubscriptionCard = ({ plan, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: plan.name,
    price: plan.price,
    durationDays: plan.durationDays,
    description: plan.description,
    planType: plan.planType,
    downloadLimit: plan.limits?.downloadLimit || 0,
    adFree: plan.limits?.adFree || false,
    deviceLimit: plan.limits?.deviceLimit || 1,
    isActive: plan.isActive,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = () => {
    onUpdate(plan._id, {
      ...editData,
      limits: {
        downloadLimit: Number(editData.downloadLimit),
        adFree: editData.adFree,
        deviceLimit: Number(editData.deviceLimit),
      },
    });
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full sm:w-[95%] md:w-full lg:w-full p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border"
    >
      {!isEditing ? (
        <>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{plan.name}</h3>
          <p className="text-gray-600 dark:text-gray-300">Price: ₹{plan.price}</p>
          <p className="text-gray-600 dark:text-gray-300">Duration: {plan.durationDays} days</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
          <p
            className={`mt-2 text-sm font-semibold ${
              plan.isActive ? "text-green-600" : "text-red-600"
            }`}
          >
            {plan.isActive ? "Active" : "Inactive"}
          </p>

          {/* Action buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => onUpdate(plan._id, { isActive: !plan.isActive })}
              className="flex-1 min-w-[100px] px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md text-sm transition"
            >
              {plan.isActive ? "Deactivate" : "Activate"}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 min-w-[80px] px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(plan._id)}
              className="flex-1 min-w-[80px] px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm transition"
            >
              Delete
            </button>
          </div>
        </>
      ) : (
        <form className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              name="name"
              value={editData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
              placeholder="Plan Name"
            />
            <input
              type="number"
              name="price"
              value={editData.price}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
              placeholder="Price"
            />
          </div>

          <input
            type="number"
            name="durationDays"
            value={editData.durationDays}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
            placeholder="Duration (days)"
          />

          <textarea
            name="description"
            value={editData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
            placeholder="Description"
          />

          <select
            name="planType"
            value={editData.planType}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
          >
            <option value="trial">Trial</option>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
          </select>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="number"
              name="downloadLimit"
              value={editData.downloadLimit}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
              placeholder="Download Limit"
            />
            <input
              type="number"
              name="deviceLimit"
              value={editData.deviceLimit}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
              placeholder="Device Limit"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="adFree"
                checked={editData.adFree}
                onChange={handleChange}
                className="h-4 w-4"
              />
              <span className="text-sm">Ad-Free</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={editData.isActive}
                onChange={handleChange}
                className="h-4 w-4"
              />
              <span className="text-sm">Active</span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm transition"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 px-3 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md text-sm transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
};

export default SubscriptionCard;
