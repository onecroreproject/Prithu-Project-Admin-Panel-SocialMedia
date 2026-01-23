import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createPlan } from "../../Services/Subscription/subscriptionService";

const SubscriptionForm = () => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    durationDays: "",
    description: "",
    deviceLimit: "",
  });

  const { mutate, isLoading } = useMutation({
    mutationFn: createPlan,
    onSuccess: () => {
      toast.success("Subscription plan created successfully");
      setFormData({
        name: "",
        price: "",
        durationDays: "",
        description: "",
        deviceLimit: "",
      });
      queryClient.invalidateQueries(["plans"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Error creating subscription");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-xl mx-auto bg-indigo-50 p-8 rounded-2xl shadow-md"
    >
      <h3 className="text-xl font-semibold text-indigo-700 text-center mb-4 tracking-wide">
        Create Subscription Plan
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <input
          type="text"
          name="name"
          placeholder="Plan Name"
          value={formData.name}
          onChange={handleChange}
          className="rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-400 px-4 py-3 transition placeholder:text-indigo-400"
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          className="rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-400 px-4 py-3 transition placeholder:text-indigo-400"
          required
        />
        <input
          type="number"
          name="durationDays"
          placeholder="Duration (days)"
          value={formData.durationDays}
          onChange={handleChange}
          className="rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-400 px-4 py-3 transition placeholder:text-indigo-400"
          required
        />
        <input
          type="number"
          name="deviceLimit"
          placeholder="Device Limit"
          value={formData.deviceLimit}
          onChange={handleChange}
          className="rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-400 px-4 py-3 transition placeholder:text-indigo-400"
        />
      </div>

      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        className="w-full rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-400 px-4 py-3 transition resize-none min-h-[100px] placeholder:text-indigo-400"
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
      >
        {isLoading ? "Creating..." : "Create Plan"}
      </button>
    </form>
  );
};

export default SubscriptionForm;
