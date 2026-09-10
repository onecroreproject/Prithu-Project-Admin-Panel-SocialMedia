import api from "./apiService";

export const referralAdminService = {
    // 1. Get Summary Stats
    getStats: async () => {
        const res = await api.get("/api/admin/referrals/stats");
        return res.data?.data;
    },

    // 2. Get Paginated Users List with Filters
    getUsers: async (params = {}) => {
        const res = await api.get("/api/admin/referrals/users", { params });
        return res.data;
    },

    // 3. Get Single User Referral Deep Details
    getUserDetail: async (id) => {
        const res = await api.get(`/api/admin/referrals/user/${id}`);
        return res.data?.data;
    },

    // 4. Create / Link Referral (Parent <-> Child)
    createLink: async (data) => {
        const res = await api.post("/api/admin/referrals/link", data);
        return res.data;
    },

    // 5. Update Referral User Settings (Toggle Validity, Edit Code, Qualify)
    updateUser: async (id, data) => {
        const res = await api.put(`/api/admin/referrals/user/${id}`, data);
        return res.data;
    },

    // 6. Delete / Unlink Referral
    deleteLink: async (userId, referredId) => {
        const res = await api.delete(`/api/admin/referrals/user/${userId}/referred/${referredId}`);
        return res.data;
    },

    // 7. Delete Referral Cycle
    deleteCycle: async (cycleId) => {
        const res = await api.delete(`/api/admin/referrals/cycle/${cycleId}`);
        return res.data;
    },

    // 8. Get Milestone Rewards Configuration
    getMilestones: async () => {
        const res = await api.get("/api/admin/referrals/milestones");
        return res.data?.data;
    },

    // 9. Update Milestone Rewards Configuration
    updateMilestones: async (data) => {
        const res = await api.put("/api/admin/referrals/milestones", data);
        return res.data;
    },

    // 10. Get All Withdrawals (Admin)
    getWithdrawals: async (params = {}) => {
        const res = await api.get("/api/admin/withdrawals", { params });
        return res.data;
    },

    // 11. Update Withdrawal Status (Approve/Paid or Reject with Refund)
    updateWithdrawalStatus: async (id, data) => {
        const res = await api.put(`/api/admin/withdrawals/${id}/status`, data);
        return res.data;
    }
};

export default referralAdminService;
