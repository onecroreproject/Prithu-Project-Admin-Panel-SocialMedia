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

export default function ChildAdminProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [isActionProcessing, setIsActionProcessing] = useState(false);
  const {role}=useAdminAuth()
console.log(id)
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["childAdminProfile", id],
    queryFn: () => fetchChildAdminProfile(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });

  useEffect(() => {
    if (data) {
      const normalizedProfile = {
        ...data,
        userName: data.profile?.userName || data.userName,
        profileAvatar: data.profile?.profileAvatar || "/default-avatar.png",
        grantedPermissions: data.grantedPermissions || [],
        ungrantedPermissions: data.ungrantedPermissions || [],
        socialLinks: data.profile?.socialLinks || {},
      };
      setProfile(normalizedProfile);
    }
  }, [data]);

  const handleAction = (type) => {
    setActionType(type);
    setShowModal(true);
  };

  const handleConfirmAction = async () => {
    if (isActionProcessing) return;
    setIsActionProcessing(true);
    try {
      if (actionType === "block" || actionType === "unblock") {
        await blockChildAdmin(profile._id);
        toast.success(
          `Child Admin ${profile.isActive ? "blocked" : "unblocked"} successfully!`
        );
        refetch();
      } else if (actionType === "delete") {
        await deleteChildAdmin(profile._id);
        toast.success("Child Admin deleted successfully!");
        navigate("/child/admin/page");
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Action failed. Please try again.");
    } finally {
      setIsActionProcessing(false);
    }
  };

  if (isLoading) return <div className="p-6 flex justify-center items-center">Loading...</div>;
  if (isError) return <div className="p-6 text-red-600">Error: {error?.message}</div>;
  if (!profile) return <div className="p-6 text-gray-600">Profile not found.</div>;

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex flex-col lg:flex-row gap-6 p-6 w-full bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
        <ProfileSidebar
          profile={profile}
          handleAction={handleAction}
          setProfile={setProfile}
        />
        <div className="flex-1 flex flex-col gap-6">
          <ChildAdminDetails profile={profile} />
          <ParentAdminCard profile={profile} />
          <PermissionsCard profile={profile}  role={role}/>
        </div>

        <AnimatePresence>
          {showModal && (
            <ConfirmModal
              actionType={actionType}
              handleClose={() => setShowModal(false)}
              handleConfirm={handleConfirmAction}
              isProcessing={isActionProcessing}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
