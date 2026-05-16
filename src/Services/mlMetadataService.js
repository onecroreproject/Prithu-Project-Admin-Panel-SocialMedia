import API from "./apiService";
import { API_ENDPOINTS } from "../API-Constanse/apiConstance";

const mlMetadataService = {
    getStats: async () => {
        try {
            const response = await API.get(API_ENDPOINTS.ML_METADATA_STATS);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    toggleQueue: async () => {
        try {
            const response = await API.post(API_ENDPOINTS.ML_METADATA_TOGGLE);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    triggerManualAnalysis: async () => {
        try {
            // Reusing the generic cron trigger for the ML task
            const response = await API.post(API_ENDPOINTS.CRON_TRIGGER, { taskId: "ml_metadata_generation" });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default mlMetadataService;
