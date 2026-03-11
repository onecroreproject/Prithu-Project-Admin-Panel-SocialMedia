import Api from "../apiService";
import { API_ENDPOINTS } from "../../API-Constanse/apiConstance";

export const fetchDashboardHeartbeat = async () => {
    try {
        const response = await Api.get(API_ENDPOINTS.DASHBOARD_HEARTBEAT);
        return response.data;
    } catch (error) {
        console.error("Error fetching dashboard heartbeat:", error);
        throw error;
    }
};

export const fetchMonthlyRegistrations = async ({ range, year }) => {
    try {
        const response = await Api.get(API_ENDPOINTS.DASHBOARD_USER_REGITRATION_CHART, {
            params: { range, year }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching monthly registrations:", error);
        throw error;
    }
};
