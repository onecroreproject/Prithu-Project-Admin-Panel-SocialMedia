import api from './apiService';

const adminService = {
  // Get all categories
  getCategories: async () => {
    try {
      const response = await api.get('/api/admin/get/feed/category');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Upload feed
  uploadFeed: async (formData, onProgress) => {
    try {
      const response = await api.post('/api/admin/feed-upload', formData, {
        onUploadProgress: onProgress
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading feed:', error);
      throw error;
    }
  },

  // Get feeds
  getFeeds: async (page = 1, limit = 20) => {
    try {
      const response = await api.get('/api/feeds', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching feeds:', error);
      throw error;
    }
  },

  // Update feed
  updateFeed: async (feedId, data) => {
    try {
      const response = await api.put(`/api/admin/feeds/${feedId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating feed:', error);
      throw error;
    }
  },

  // Delete feed
  deleteFeed: async (feedId) => {
    try {
      const response = await api.delete(`/api/admin/feeds/${feedId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting feed:', error);
      throw error;
    }
  }
};

export default adminService;