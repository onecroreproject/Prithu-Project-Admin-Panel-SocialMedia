import Api from "../../Utils/axiosApi.js";
import { API_ENDPOINTS } from "../../API-Constanse/apiConstance.js";



export async function fetchSubscriptionStats() {
  const res = await Api.get(API_ENDPOINTS.DASHBOARD_SUBSCRIPTION_RATIO_CHART);

  return res.data;
}
