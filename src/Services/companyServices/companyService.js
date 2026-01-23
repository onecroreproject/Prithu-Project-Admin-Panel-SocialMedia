import api from '../../Utils/axiosApi';


export const companyService = {
  getAllCompanies: async (params = {}) => {
    try {
      const response = await api.get('/api/get/all/companies', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },
};




  export const removeCompany =async(companyId) => {
    try {
      const response = await api.delete(`/companies/${companyId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing company:', error);
      throw error;
    }
  }

  export const suspendCompany=async (companyId) => {
    try {
      const response = await api.put(`/api/companies/${companyId}/suspend`);
      return response.data;
    } catch (error) {
      console.error('Error suspending company:', error);
      throw error;
    }
  }

 export const activateCompany= async (companyId) => {
    try {
      const response = await api.put(`/companies/${companyId}/activate`);
      return response.data;
    } catch (error) {
      console.error('Error activating company:', error);
      throw error;
    }
  }

 export const viewCompany=async (companyId) => {
    try {
      const response = await api.get(`/api/companies/${companyId}`);
      return response;
    } catch (error) {
      console.error('Error viewing company:', error);
      throw error;
    }
  }
