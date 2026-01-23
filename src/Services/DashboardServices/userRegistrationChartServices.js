import Api from "../../Utils/axiosApi.js";
import { API_ENDPOINTS } from "../../API-Constanse/apiConstance.js";

export const fetchMonthlyRegistrations = async () => {
  const res = await Api.get(API_ENDPOINTS.DASHBOARD_USER_REGITRATION_CHART); 

  return res.data; 
};
