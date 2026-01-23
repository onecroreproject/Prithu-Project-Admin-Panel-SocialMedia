import api from '../../Utils/axiosApi';




export const jobService = {
  getAllJobs: async (params = {}) => {
    try {
      const response = await api.get('/api/get/all/company/jobs', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  approveJob: async (jobId) => {
    try {
      const response = await api.put(`/api/jobs/${jobId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving job:', error);
      throw error;
    }
  },

  rejectJob: async (jobId, rejectionReason) => {
    try {
      const response = await api.post(`/api/jobs/${jobId}/reject`, { rejectionReason });
      return response.data;
    } catch (error) {
      console.error('Error rejecting job:', error);
      throw error;
    }
  },

  deleteJob: async (jobId) => {
    try {
      const response = await api.delete(`/api/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  },

  suspendJob: async (jobId) => {
    try {
      const response = await api.put(`/api/jobs/${jobId}/suspend`);
      return response.data;
    } catch (error) {
      console.error('Error suspending job:', error);
      throw error;
    }
  },
};