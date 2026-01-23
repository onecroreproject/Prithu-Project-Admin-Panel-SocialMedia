import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || '';

const adminService = {
  // Get all categories
  getCategories: async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/get/feed/category`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Upload feed
  uploadFeed: async (formData, token, onProgress) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/feed-upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: onProgress
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading feed:', error);
      throw error;
    }
  },

  // Get feeds
  getFeeds: async (page = 1, limit = 20, token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/feeds`, {
        params: { page, limit },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching feeds:', error);
      throw error;
    }
  },

  // Update feed
  updateFeed: async (feedId, data, token) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/admin/feeds/${feedId}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating feed:', error);
      throw error;
    }
  },

  // Delete feed
  deleteFeed: async (feedId, token) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/admin/feeds/${feedId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting feed:', error);
      throw error;
    }
  }
};

export default adminService;