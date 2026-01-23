import Api from "../../Utils/axiosApi.js";



export const driveApi = {
  // Get dashboard statistics
  getDashboard: async () => {
    return Api.get(`/api/admin/drive/dashboard`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  },

  // Execute drive commands
  executeCommand: async (commandData) => {
    return Api.post(`/api/admin/drive/command`, commandData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  }
};