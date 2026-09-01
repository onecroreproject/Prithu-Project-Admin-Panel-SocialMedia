import api from './apiClient';

export const getVisitingCardsStats = async () => {
    const response = await api.get('/api/admin/visiting-cards/stats');
    return response.data;
};

export const getVisitingCards = async (params = {}) => {
    const response = await api.get('/api/admin/visiting-cards', { params });
    return response.data;
};

export const getProfileCardPlan = async () => {
    const response = await api.get('/api/admin/visiting-cards/plan');
    return response.data;
};

export const updateProfileCardPlan = async (planData) => {
    const response = await api.put('/api/admin/visiting-cards/plan', planData);
    return response.data;
};

export const getProfileCardSubscribers = async (params = {}) => {
    const response = await api.get('/api/admin/visiting-cards/subscribers', { params });
    return response.data;
};

export const grantProfileCardSubscription = async (payload) => {
    const response = await api.post('/api/admin/visiting-cards/grant-subscription', payload);
    return response.data;
};

export default {
    getVisitingCardsStats,
    getVisitingCards,
    getProfileCardPlan,
    updateProfileCardPlan,
    getProfileCardSubscribers,
    grantProfileCardSubscription
};
