import api from "../Utils/axiosApi";
import { API_ENDPOINTS } from "../API-Constanse/apiConstance";

const SEOService = {
    // Dashboard Stats
    getStats: async () => {
        const response = await api.get(API_ENDPOINTS.SEO_STATS);
        return response.data;
    },

    // Global Config
    getConfig: async () => {
        const response = await api.get(API_ENDPOINTS.SEO_CONFIG);
        return response.data;
    },

    updateConfig: async (data) => {
        const response = await api.put(API_ENDPOINTS.SEO_CONFIG, data);
        return response.data;
    },

    // Page SEO
    getPages: async () => {
        const response = await api.get(API_ENDPOINTS.SEO_PAGES);
        return response.data;
    },

    // Feed SEO
    getFeeds: async () => {
        const response = await api.get(API_ENDPOINTS.SEO_FEEDS);
        return response.data;
    },

    updateFeedSeo: async (id, data) => {
        const response = await api.put(`${API_ENDPOINTS.SEO_FEEDS}/${id}`, data);
        return response.data;
    },

    // Media SEO
    getMedia: async () => {
        const response = await api.get(API_ENDPOINTS.SEO_MEDIA);
        return response.data;
    },

    // Redirects
    getRedirects: async () => {
        const response = await api.get(API_ENDPOINTS.SEO_REDIRECTS);
        return response.data;
    },

    createRedirect: async (data) => {
        const response = await api.post(API_ENDPOINTS.SEO_REDIRECTS, data);
        return response.data;
    },

    deleteRedirect: async (id) => {
        const response = await api.delete(`${API_ENDPOINTS.SEO_REDIRECTS}/${id}`);
        return response.data;
    },

    // Technical
    generateSitemap: async () => {
        const response = await api.post(API_ENDPOINTS.SEO_SITEMAP, {});
        return response.data;
    },

    updateRobots: async (content) => {
        const response = await api.post(API_ENDPOINTS.SEO_ROBOTS, { content });
        return response.data;
    },

    // Page SEO Update
    updatePageSeo: async (slug, data) => {
        const response = await api.post(`${API_ENDPOINTS.UPDATE_PAGE_SEO}/${slug}`, data);
        return response.data;
    }
};

export default SEOService;
