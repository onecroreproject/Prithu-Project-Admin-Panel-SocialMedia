import api from "./apiService";

/**
 * Get Promotional Email Dashboard Stats
 */
export const getPromoDashboardStats = async () => {
    try {
        const response = await api.get("/api/admin/email/promo/stats");
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * List all promotional templates
 */
export const getPromotionTemplates = async () => {
    try {
        const response = await api.get("/api/admin/email/promo/templates");
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Get content of a specific template
 */
export const getTemplateContent = async (fileName) => {
    try {
        const response = await api.get(`/api/admin/email/promo/templates/${fileName}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Save template (Create or Update)
 */
export const savePromotionTemplate = async (templateData) => {
    try {
        const response = await api.post("/api/admin/email/promo/templates", templateData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Delete template
 */
export const deletePromotionTemplate = async (fileName) => {
    try {
        const response = await api.delete(`/api/admin/email/promo/templates/${fileName}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Trigger Promotional Batch Manually
 */
export const triggerPromoBatch = () => {
    return api.post("/api/admin/email/promo/trigger-batch", {}).then(res => res.data);
};

export const toggleCampaignStatus = (pause) => {
    return api.patch("/api/admin/email/promo/toggle-status", { pause }).then(res => res.data);
};
