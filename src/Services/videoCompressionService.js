import api from "./apiService";
import { API_ENDPOINTS } from "../API-Constanse/apiConstance";

const videoCompressionService = {
  getStats: async () => {
    const response = await api.get(API_ENDPOINTS.VIDEO_COMPRESSION_STATS);
    return response.data;
  },

  startBulkCompression: async () => {
    const response = await api.post(API_ENDPOINTS.VIDEO_COMPRESSION_BULK_START);
    return response.data;
  },

  retryCompression: async (feedId) => {
    const response = await api.post(`${API_ENDPOINTS.VIDEO_COMPRESSION_RETRY}/${feedId}`);
    return response.data;
  },
};

export default videoCompressionService;
