import Api from "../../Utils/axiosApi.js";
import { API_ENDPOINTS } from "../../API-Constanse/apiConstance.js";



export const fetchUsers = async () => {
  const res = await Api.get(API_ENDPOINTS.USER_DETAIL);
  return res.data.users; // backend should return { users: [...] }
};