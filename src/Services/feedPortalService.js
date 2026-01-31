import api from './apiClient';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const feedPortalService = {
    // Get all categories
    getAllCategories: async () => {
        const response = await api.get(`${API_URL}/api/admin/get/feed/category`);
        // The backend returns { categories: [...] }
        return response.data.categories || [];
    },

    // Upload feed
    uploadFeed: async (formData) => {
        const response = await api.post(`${API_URL}/api/admin/feed-upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    requestDownloadFeed: async (feedId, designMetadata) => {
        const response = await api.post(`${API_URL}/api/feeds/${feedId}/download-request`, { designMetadata });
        return response.data;
    },

    getDownloadJobStatus: async (jobId) => {
        const response = await api.get(`${API_URL}/api/downloads/status/${jobId}`);
        return response.data;
    },
};
