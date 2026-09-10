import api from "../apiService";
import { API_ENDPOINTS } from "../../API-Constanse/apiConstance";

// ✅ Fetch all creators
export const fetchCreators = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.ADMIN_GET_ALL_CREATOR);
 
    return response.data.creators;
  } catch (error) {
    console.error("Error fetching creators:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch creators");
  }
};

// ✅ Block a creator
export const blockCreator = async (creatorId) => {
  try {
    const response = await api.patch(API_ENDPOINTS.ADMIN_GET_ALL_CREATOR); // Note: Should probably be a block endpoint, but keeping the original logic flow for now
    return response.data;
  } catch (error) {
    console.error("Error blocking creator:", error);
    throw new Error(error.response?.data?.message || "Failed to block creator");
  }
};

export const fetchTrendingCreators =async ()=>{
  try{
    const response =await api.get(API_ENDPOINTS.ADMIN_GET_TRENDING_CREATOR)

    return response.data.creators
   }catch(err)
   {
    throw new Error("Error Fetch Trending Creator:",error);
   }
}