import api from "../../Utils/axiosApi";
import { API_ENDPOINTS } from "../../API-Constanse/apiConstance";

// ✅ Helper: get token safely from localStorage
const getToken = () => {
  try {
    const tokenData = localStorage.getItem("admin");
    if (!tokenData) return null;
    const { token } = JSON.parse(tokenData);
    return token;
  } catch (err) {
    console.error("Error reading admin token:", err);
    return null;
  }
};

// ✅ Fetch all child admins (under current parent admin)
export const getChildAdmins = async () => {
  try {
    const token = getToken();
    if (!token) throw new Error("Admin token not found");

    const { data } = await api.get(API_ENDPOINTS.GET_CHILD_ADMIN_LIST, {
      headers: { Authorization: `Bearer ${token}` },
    });


    return data?.admins || [];
  } catch (err) {
    console.error("Failed to fetch child admins:", err);

    // 🔁 Handle expired JWT or unauthorized
    if (err.response?.status === 401) {
      alert("Your session expired. Please login again.");
      localStorage.removeItem("admin");
      window.location.href = "/signin"; // redirect to admin login
    }

    throw err;
  }
};

// ✅ Fetch specific child admin’s permissions
export const getAdminPermissions = async (childAdminId) => {
  try {
    const token = getToken();
    if (!token) throw new Error("Admin token not found");

    const { data } = await api.get(
      `${API_ENDPOINTS.GET_CHILD_ADMIN_PERMISSONS}/${childAdminId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return data?.childAdmin || {};
  } catch (err) {
    console.error("Failed to fetch admin permissions:", err);

    if (err.response?.status === 401) {
      alert("Your session expired. Please login again.");
      localStorage.removeItem("admin");
      window.location.href = "/signin";
    }

    throw err;
  }
};

// ✅ Update child admin’s permissions
export const updateChildAdminPermissions = async (childAdminId, body) => {
  try {
    const token = getToken();
    if (!token) throw new Error("Admin token not found");

    const { data } = await api.put(
      `${API_ENDPOINTS.UPDATE_CHILD_ADMIN_PERMISSIONS}/${childAdminId}`,
      body,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return data;
  } catch (err) {
    console.error("Failed to update child admin permissions:", err);

    if (err.response?.status === 401) {
      alert("Your session expired. Please login again.");
      localStorage.removeItem("admin");
      window.location.href = "/signin";
    }

    throw err;
  }
};




export const fetchChildAdminProfile = async (id) => {
  if (!id) throw new Error("Admin ID is required");
  const { data } = await api.get(`${API_ENDPOINTS.GET_CHILD_ADMIN_DETAIL}/${id}`, {
    withCredentials: true,
  });
  return data.data;
};


// Block child admin
export const blockChildAdmin = async (id) => {
  const { data } = await api.patch(`${API_ENDPOINTS.BLOCK_CHILD_ADMIN}/${id}`);
  return data;
};

// Delete child admin
export const deleteChildAdmin = async (id) => {
  const { data } = await api.delete(`${API_ENDPOINTS.DETETE_CHILD_ADMIN}/${id}`);
  return data;
};





export const updateChildAdminProfile = async (id, updateData) => {
  if (!id) throw new Error("Admin ID is required");
  if (!updateData) throw new Error("Update data is required");

  // If updateData is not FormData, we should check if it's meant to be
  // but usually for profile updates involving images, it should be FormData.
  // We'll wrap it if it's a plain object.

  let body = updateData;
  let headers = {
    "Content-Type": "application/json",
  };

  if (updateData instanceof FormData) {
    body = updateData;
    headers = { "Content-Type": "multipart/form-data" };
  }

  const { data } = await api.put(
    `${API_ENDPOINTS.UPDATE_CHILD_ADMIN_PROFILE}/${id}`,
    body,
    {
      withCredentials: true,
      headers: headers,
    }
  );

  return data;
};
