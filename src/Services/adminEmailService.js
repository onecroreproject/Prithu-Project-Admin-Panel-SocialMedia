import axiosApi from "../Utils/axiosApi";

/**
 * Get Promotional Email Dashboard Stats
 */
export const getPromoDashboardStats = async (token) => {
    try {
        const response = await axiosApi.get("/api/admin/email/promo/stats", {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * List all promotional templates
 */
export const getPromotionTemplates = async (token) => {
    try {
        const response = await axiosApi.get("/api/admin/email/promo/templates", {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Get content of a specific template
 */
export const getTemplateContent = async (fileName, token) => {
    try {
        const response = await axiosApi.get(`/api/admin/email/promo/templates/${fileName}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Save template (Create or Update)
 */
export const savePromotionTemplate = async (templateData, token) => {
    try {
        const response = await axiosApi.post("/api/admin/email/promo/templates", templateData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Delete template
 */
export const deletePromotionTemplate = async (fileName, token) => {
    try {
        const response = await axiosApi.delete(`/api/admin/email/promo/templates/${fileName}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Trigger Promotional Batch Manually
 */
export const triggerPromoBatch = (token) => {
    return axiosApi.post("/api/admin/email/promo/trigger-batch", {}, {
        headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.data);
};

export const toggleCampaignStatus = (pause, token) => {
    return axiosApi.patch("/api/admin/email/promo/toggle-status", { pause }, {
        headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.data);
};
