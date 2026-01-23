import api from "../../Utils/axiosApi"
import { API_ENDPOINTS } from "../../API-Constanse/apiConstance";





export const getAnalyticsData = async (startDate = "", endDate = "") => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await api.get(API_ENDPOINTS.GET_SALES_METRICKS, { params });

  // The backend returns { success: true, data: [...], totals: {...} }
  // We'll use totals for the card display
  return response.data.totals || {};
};


export const getTopReferralUsers = async () => {
  const res = await api.get(API_ENDPOINTS.GET_REFERALL_TOPERS);
  return res.data.data;
};




export const getRecentSubscriptionUsers = async () => {
  
  const response = await api.get(API_ENDPOINTS.GET_RECENT_SUBSCRIBER_USERS);
  return response.data.data;
}



export const getDailyUserSubscriptionCounts = async () => {
  const response = await api.get(API_ENDPOINTS.GET_SALES_CHART_COUNT); 
  return response.data.data; 
};