import api from "../apiService";
import { API_ENDPOINTS } from "../../API-Constanse/apiConstance";





export const getAnalyticsData = async (startDate = "", endDate = "") => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await api.get(API_ENDPOINTS.GET_SALES_METRICKS, { params });

  // The backend returns { success: true, data: [...], totals: {...}, baseline: {...} }
  return response.data;
};


export const getTopReferralUsers = async () => {
  const res = await api.get(API_ENDPOINTS.GET_REFERALL_TOPERS);
  return res.data.data;
};




export const getRecentSubscriptionUsers = async (limit = 10) => {
  const response = await api.get(`${API_ENDPOINTS.GET_RECENT_SUBSCRIBER_USERS}?limit=${limit}`);
  return response.data.data;
}

export const getRecentWithdrawalUsers = async (limit = 10) => {
  const response = await api.get(`${API_ENDPOINTS.GET_RECENT_WITHDRAWALS}?limit=${limit}`);
  return response.data.data;
}

export const getDailyUserSubscriptionCounts = async (period = "month") => {
  const response = await api.get(`${API_ENDPOINTS.GET_SALES_CHART_COUNT}?period=${period}`);
  return response.data.data;
};