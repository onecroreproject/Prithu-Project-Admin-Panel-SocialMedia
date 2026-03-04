// ChildAdminProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchChildAdminProfile,
  blockChildAdmin,
  deleteChildAdmin,
  updateChildAdminProfile,
} from "../../Services/childAdminServices/childAdminServices";

import ProfileSidebar from "./Components/profileSideBar";
import ChildAdminDetails from "./Components/childAdminDetail";
import ParentAdminCard from "./Components/parentAdminCard";
import PermissionsCard from "./Components/permissionCard";
import ConfirmModal from "./Components/confimModel";
import { useAdminAuth } from "../../context/adminAuthContext";

const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", duration: 0.55, bounce: 0.17 } },
};

const ChildAdminProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role: currentUserRole } = useAdminAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    phoneNumber: "",
    bio: "",
    socialLinks: {
      facebook: "",
      instagram: "",
      twitter: "",
      youtube: "",
    }
  });
  const [newAvatar, setNewAvatar] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    data: profileData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["childAdminProfile", id],
    queryFn: () => fetchChildAdminProfile(id),
    enabled: !!id,
  });

  const profile = profileData ? {
    ...profileData,
    userName: profileData.profile?.userName || profileData.userName,
    profileAvatar: profileData.profile?.profileAvatar || "/default-avatar.png",
    socialLinks: profileData.profile?.socialLinks || {},
  } : null;

  useEffect(() => {
    if (profileData) {
      setFormData({
        userName: profileData.profile?.userName || profileData.userName || "",
        phoneNumber: profileData.profile?.phoneNumber || "",
        bio: profileData.profile?.bio || "",
        socialLinks: profileData.profile?.socialLinks || {
          facebook: "",
          instagram: "",
          twitter: "",
          youtube: "",
        }
      });
    }
  }, [profileData]);

  const handleAction = async (type) => {
    try {
      if (type === "block" || type === "unblock") {
        await blockChildAdmin(id);
        toast.success(`Child admin ${type === "block" ? "blocked" : "unblocked"} successfully!`);
      } else if (type === "delete") {
        if (window.confirm("Are you sure you want to delete this child admin?")) {
          await deleteChildAdmin(id);
          toast.success("Child admin deleted successfully!");
          navigate("/child/admin/page");
        }
      }
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${type} child admin`);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append("userName", formData.userName);
      fd.append("email", formData.email);
      fd.append("password", formData.password);
      fd.append("phoneNumber", formData.phoneNumber);
      fd.append("bio", formData.bio);
      fd.append("socialLinks", JSON.stringify(formData.socialLinks));
      if (newAvatar) {
        fd.append("file", newAvatar);
      }

      const response = await updateChildAdminProfile(id, fd);

      if (response.success) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        setNewAvatar(null);
        refetch();
      } else {
        toast.error(response.message || "Update failed");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profileData) {
      setFormData({
        userName: profileData.profile?.userName || profileData.userName || "",
        phoneNumber: profileData.profile?.phoneNumber || "",
        bio: profileData.profile?.bio || "",
        socialLinks: profileData.profile?.socialLinks || {
          facebook: "",
          instagram: "",
          twitter: "",
          youtube: "",
        }
      });
    }
    setNewAvatar(null);
    setIsEditing(false);
  };

  if (isLoading) return <div className="p-6 flex justify-center items-center">Loading...</div>;
  if (isError) return <div className="p-6 text-red-600">Error: {error?.message}</div>;
  if (!profile) return <div className="p-6 text-gray-600">Profile not found.</div>;

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex flex-col lg:flex-row gap-6 p-6 w-full min-h-screen bg-gray-50 dark:bg-gray-900">
        <ProfileSidebar
          profile={profile}
          handleAction={handleAction}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          formData={formData}
          setFormData={setFormData}
          newAvatar={newAvatar}
          setNewAvatar={setNewAvatar}
          handleSaveAll={handleSaveAll}
          handleCancel={handleCancel}
          isSaving={isSaving}
        />
        <div className="flex-1 flex flex-col gap-6">
          <ChildAdminDetails
            profile={profile}
            isEditing={isEditing}
            formData={formData}
            setFormData={setFormData}
          />
          <ParentAdminCard profile={profile} />
        </div>
      </div>
    </>
  );
};

export default ChildAdminProfile;
