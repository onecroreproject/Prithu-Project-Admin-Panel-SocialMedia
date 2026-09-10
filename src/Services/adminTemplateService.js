import axios from "axios";
import { API_ENDPOINTS } from "../API-Constanse/apiConstance";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const uploadTemplate = async (templateData, token) => {
    try {
        const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.TEMPLATES}`, templateData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading template:", error);
        throw error;
    }
};

export const getAllTemplates = async (token) => {
    try {
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.TEMPLATES}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching templates:", error);
        throw error;
    }
};

export const deleteTemplate = async (templateId, token) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}${API_ENDPOINTS.TEMPLATE_BY_ID(templateId)}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting template:", error);
        throw error;
    }
};
export const getCategories = async (token) => {
    try {
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_GET_CATEGORY}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
};
