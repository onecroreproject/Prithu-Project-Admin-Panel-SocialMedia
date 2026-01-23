import api from "../../Utils/axiosApi"
import { API_ENDPOINTS } from "../../API-Constanse/apiConstance";

// Fetch all reports




// service file
export const getReports = async () => {
  try {
    const res = await api.get(API_ENDPOINTS.GET_USER_REPORTS);
    
    // Handle different response structures
    if (res.data && Array.isArray(res.data)) {
      return res.data; // Direct array
    } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
      return res.data.data; // Nested data array
    } else if (res.data && res.data.data) {
      // If it's not an array, wrap it
      return Array.isArray(res.data.data) ? res.data.data : [res.data.data];
    }
    
    console.warn("Unexpected response structure:", res);
    return [];
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error; // Let React Query handle the error
  }
};


export const updateReportAction = async (reportId, data) => {
 const tokenData = localStorage.getItem("admin");
    if (!tokenData) throw new Error("Admin token not found");

    const  {token}  = JSON.parse(tokenData);
  const res = await api.put(`${API_ENDPOINTS.UPDATE_REPORT_ACTION}/${reportId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};