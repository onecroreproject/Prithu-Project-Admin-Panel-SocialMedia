import api from "../../Utils/axiosApi"; 
import { API_ENDPOINTS } from "../../API-Constanse/apiConstance";

export const fetchPlans = async () => {
  const res = await api.get(API_ENDPOINTS.ADMIN_GET_ALL_SUBSCRIPTION);
  return res.data.plans;
};

export const deletePlan = async (id) => {
  return await api.delete(`${API_ENDPOINTS.ADMIN_DELETE_SUBSCRIPTION_PLAN}/${id}`);
};

export const updatePlan = async ({ id, updates }) => {

  return await api.put(`${API_ENDPOINTS.ADMIN_UPDATE_SUBSCRIPTION_PLAN}/${id}`,updates)
}


export const createPlan = async (data) => {
  return await api.post(API_ENDPOINTS.ADMIN_CREATE_SUBSCRIPTION_PLAN, {
    ...data,
    limits: {
      downloadLimit: Number(data.downloadLimit),
      adFree: data.adFree,
      deviceLimit: Number(data.deviceLimit),
    },
  });
};