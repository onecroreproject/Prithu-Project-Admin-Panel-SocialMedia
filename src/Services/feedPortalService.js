import api from './apiService';

export const feedPortalService = {
    // Get all categories
    getAllCategories: async () => {
        const response = await api.get(`/api/admin/get/feed/category`);
        return response.data.categories || [];
    },

    // Upload feed
    uploadFeed: async (formData) => {
        const response = await api.post(`/api/admin/feed-upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    requestDownloadFeed: async (feedId, designMetadata) => {
        const response = await api.post(`/api/feeds/${feedId}/download-request`, { designMetadata });
        return response.data;
    },

    getDownloadJobStatus: async (jobId) => {
        const response = await api.get(`/api/downloads/status/${jobId}`);
        return response.data;
    },

    exportFeedInteractionsCSV: async () => {
        const response = await api.get(`/api/export/csv`, {
            responseType: 'blob'
        });
        return response;
    }
};
