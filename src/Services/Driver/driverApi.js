import Api from "../apiService.js";

export const driveApi = {
  // Get dashboard statistics
  getDashboard: async () => {
    return Api.get(`/api/admin/drive/dashboard`);
  },

  // Execute drive commands
  executeCommand: async (commandData) => {
    return Api.post(`/api/admin/drive/command`, commandData);
  }
};