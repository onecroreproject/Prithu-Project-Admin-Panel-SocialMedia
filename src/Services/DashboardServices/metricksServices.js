import Api from "../../Utils/axiosApi.js";
import { API_ENDPOINTS } from "../../API-Constanse/apiConstance.js";

export const fetchMetrics = async () => {
  const { data } = await Api.get(API_ENDPOINTS.DASHBOARD_METRICKS);

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch dashboard metrics");
  }

  return data; // contains all metrics directly
};

