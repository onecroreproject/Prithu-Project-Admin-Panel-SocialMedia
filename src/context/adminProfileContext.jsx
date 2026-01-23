import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../Utils/axiosApi";

// Create Context
const AdminProfileContext = createContext();

// ✅ Custom hook to consume context
export const useAdminProfile = () => {
  const context = useContext(AdminProfileContext);
  if (!context) {
    throw new Error("useAdminProfile must be used within an AdminProfileProvider");
  }
  return context;
};

// ✅ Provider component
export const AdminProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const tokenData = localStorage.getItem("admin");
  const role = localStorage.getItem("role");
  const { token } = tokenData ? JSON.parse(tokenData) : { token: null };

  // Fetch profile
  const fetchProfile = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.get("/api/get/admin/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data?.profile || null);
    } catch (err) {
      console.error("Error fetching admin profile", err);
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (formData, avatar) => {
  if (!token) return { success: false, message: "No token available" };
  setUpdating(true);

  try {
   const fd = new FormData();

// Other form data
Object.keys(formData).forEach((key) => {
  if (formData[key] !== undefined && formData[key] !== "")
    fd.append(key, formData[key]);
});

// ✅ Stringify socialLinks
// Correct way to append socialLinks in frontend
fd.append("socialLinks", JSON.stringify(formData.socialLinks));


// Avatar file
if (avatar) fd.append("file", avatar);


    let endpoint = "";
    if (role === "Admin") endpoint = "/api/admin/profile/detail/update";
    else if (role === "Child_Admin") endpoint = "/api/child/admin/profile/detail/update";
    else throw new Error("Invalid role: cannot update profile");

    await api.put(endpoint, fd, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    await fetchProfile();
    return { success: true, message: "Profile updated successfully!" };
  } catch (err) {
    console.error("Error updating profile", err.response?.data || err);
    return {
      success: false,
      message: err.response?.data?.message || "Update failed",
    };
  } finally {
    setUpdating(false);
  }
};


  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <AdminProfileContext.Provider
      value={{
        profile,
        setProfile,
        fetchProfile,
        updateProfile,
        loading,
        updating,
      }}
    >
      {children}
    </AdminProfileContext.Provider>
  );
};
