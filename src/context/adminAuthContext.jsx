import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../Utils/axiosApi";
import { API_ENDPOINTS } from "../API-Constanse/apiConstance";


const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [otpSent, setOtpSent] = useState(false);

  // ✅ Load from localStorage when app starts
  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    const storedRole = localStorage.getItem("role");

    if (storedAdmin) setAdmin(JSON.parse(storedAdmin));
    if (storedRole) setRole(storedRole);
  }, []);

  // ✅ Admin / Child_Admin Login
  const login = async (identifier, password) => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.post(API_ENDPOINTS.ADMIN_LOGIN, { identifier, password });
      const token = res.data.token;
      const adminData = res.data.admin;
      const grantedPermissions = res.data.grantedPermissions || [];
      const userRole = adminData?.role || res.data.role || "Admin";

      // ✅ Save to localStorage
      localStorage.setItem(
        "admin",
        JSON.stringify({ ...adminData, token, grantedPermissions, role: userRole })
      );
      localStorage.setItem("role", userRole);
      localStorage.setItem("token", token);

      // ✅ Update state
      setAdmin({ ...adminData, token, grantedPermissions, role: userRole });
      setRole(userRole);
    } catch (err) {
      console.error("Login error:", err.response?.data || err);
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Logout
  const logout = () => {
  // Clear state
  setAdmin(null);
  setRole(null);

  // Clear localStorage
  localStorage.removeItem("admin");
  localStorage.removeItem("role");
  localStorage.removeItem("token");

  console.log("Logged out successfully");
};


  // ✅ Send OTP
  const sendOtp = async (email) => {
    try {
      setLoading(true);
      await api.post(API_ENDPOINTS.ADMIN_SENT_OTP, { email });
      setOtpSent(true);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Verify OTP
  const verifyOtp = async (otp) => {
    try {
      setLoading(true);
      const res = await api.post(API_ENDPOINTS.ADMIN_VERFY_EXISTING_OTP, { otp });
      setOtpSent(false);
      setError(null);
      return res.data.message || "OTP verified successfully";
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Reset Password
  const resetPassword = async (email, newPassword) => {
    try {
      setLoading(true);
      const res = await api.post(API_ENDPOINTS.ADMIN_RESET_PASSWORD, { email, newPassword });
      setError(null);
      return res.data.message || "Password reset successfully";
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Create Child Admin (only by main admin)
  const createChildAdmin = async (childData) => {
    try {
      setLoading(true);

      if (role !== "Admin") {
        throw new Error("Only main admin can create child admins");
      }

      const username =
        childData.firstName && childData.lastName
          ? `${childData.firstName.trim()} ${childData.lastName.trim()}`
          : childData.username;

      const payload = {
        username,
        email: childData.email,
        password: childData.password,
        adminType: "Child_Admin",
      };

      const res = await api.post(API_ENDPOINTS.CHILD_ADMIN_REGISTER, payload, {
        headers: { Authorization: `Bearer ${admin?.token}` },
      });

      setError(null);
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || "Something went wrong";
      setError(errMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        role,
        loading,
        error,
        otpSent,
        login,
        logout,
        sendOtp,
        verifyOtp,
        resetPassword,
        createChildAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};
