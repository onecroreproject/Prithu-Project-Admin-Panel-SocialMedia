import Api from "../apiService.js";
import { API_ENDPOINTS } from "../../API-Constanse/apiConstance.js";




// ✅ Get categories
export async function fetchCategories() {
  try {
    const res = await Api.get(API_ENDPOINTS.ADMIN_GET_CATEGORY);
    return res.data?.categories || [];
  } catch (error) {
    if (error.response?.status === 404) {
      return [];
    }
    throw new Error(error.response?.data?.message || "Failed to fetch categories");
  }
}

// ✅ Get Global Dropdown Options (Legacy Compatible)
export async function fetchDropdownConfig() {
  try {
    const res = await Api.get("/api/admin/dropdown-config");
    return res.data.config;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch dropdown config");
  }
}

// ✅ Update Global Dropdown Options (Legacy Compatible)
export async function updateDropdownConfig(data) {
  try {
    const res = await Api.put("/api/admin/dropdown-config", data);
    return res.data.config;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update dropdown config");
  }
}

// ==========================================
// 🚀 POST GLOBAL OPTIONS API
// ==========================================

export async function fetchPostGlobalOptions() {
  try {
    const res = await Api.get("/api/admin/post-global-options");
    return res.data;
  } catch (error) {
    // If backend hasn't been restarted with the new route yet, fallback to legacy dropdown-config
    if (error.response?.status === 404) {
      console.warn("⚠️ /api/admin/post-global-options returned 404. Falling back to /api/admin/dropdown-config...");
      try {
        const legacyRes = await Api.get("/api/admin/dropdown-config");
        const legacyConfig = legacyRes.data?.config || {};
        return {
          success: true,
          config: {
            sessions: legacyConfig.sessions || ["Morning", "Afternoon", "Evening", "Night"],
            sessionsDetailed: legacyConfig.sessionsDetailed || [],
            days: legacyConfig.days || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            weekGods: legacyConfig.weekGodsDetailed || [],
            specialDays: legacyConfig.specialDaysDetailed || (legacyConfig.specialDays || []).map((name) => ({ name, date: "", isActive: true })),
          },
          categories: []
        };
      } catch (fallbackErr) {
        console.error("Fallback to dropdown-config also failed:", fallbackErr);
      }
    }
    throw new Error(error.response?.data?.message || "Failed to fetch post global options");
  }
}

export async function addWeekGod(data) {
  try {
    const res = await Api.post("/api/admin/post-global-options/week-gods", data);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to add week god");
  }
}

export async function updateWeekGod({ id, data }) {
  try {
    const res = await Api.put(`/api/admin/post-global-options/week-gods/${id}`, data);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update week god");
  }
}

export async function deleteWeekGod(id) {
  try {
    const res = await Api.delete(`/api/admin/post-global-options/week-gods/${id}`);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete week god");
  }
}

export async function addSpecialDay(data) {
  try {
    const res = await Api.post("/api/admin/post-global-options/special-days", data);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to add special day");
  }
}

export async function updateSpecialDay({ id, data }) {
  try {
    const res = await Api.put(`/api/admin/post-global-options/special-days/${id}`, data);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update special day");
  }
}

export async function deleteSpecialDay(id) {
  try {
    const res = await Api.delete(`/api/admin/post-global-options/special-days/${id}`);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete special day");
  }
}

export async function updateSessionsConfig(sessions) {
  try {
    const res = await Api.put("/api/admin/post-global-options/sessions", { sessions });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update sessions");
  }
}

export async function updateDaysConfig(days) {
  try {
    const res = await Api.put("/api/admin/post-global-options/days", { days });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update days");
  }
}

// ✅ Upload Feed
export async function uploadFeed(formData) {
  try {
    const tokenData = localStorage.getItem("admin");
    if (!tokenData) throw new Error("Admin token not found");

    const { token } = JSON.parse(tokenData);


    const res = await Api.post(API_ENDPOINTS.ADMIN_UPLOAD_FEED, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Failed to upload feed");
  }
}


export async function deleteFeed({ feedId }) {
  try {
    const res = await Api.delete(API_ENDPOINTS.ADMIN_DELETE_FEED, {
      headers: {
        "Content-Type": "application/json",
      },
      data: { feedId },
    });

    return res.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Failed to delete feed"
    );
  }
}





// ✅ Add Category
export async function addCategory(data) {
  try {

    const res = await Api.post(API_ENDPOINTS.ADMIN_UPLOAD_CATEGORY, data);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to add category");
  }
}


// ✅ Fetch Feeds
export async function fetchFeeds(params = {}) {
  try {
    const res = await Api.get(API_ENDPOINTS.ADMIN_GET_ALL_FEED, { params });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch feeds");
  }
}

// ✅ Fetch Feed Watch Analytics (Total watched, Watched today, Category watched today, Hourly & Top feeds)
export async function fetchFeedWatchAnalytics() {
  try {
    const res = await Api.get(API_ENDPOINTS.ADMIN_FEED_WATCH_ANALYTICS);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch feed watch analytics:", error);
    return {
      success: false,
      totalPostsWatched: 0,
      todayPostsWatched: 0,
      todayUniqueUsersWatched: 0,
      totalWatchHours: 0,
      todayWatchHours: 0,
      todayCategoryWatched: [],
      allTimeCategoryWatched: [],
      todayHourlyViews: [],
      topWatchedPostsToday: [],
      topWatchedPostsAllTime: []
    };
  }
}

// ✅ Fetch Feed View Logs (Paginated live user view stream)
export async function fetchFeedViewLogs(params = {}) {
  try {
    const res = await Api.get(API_ENDPOINTS.ADMIN_FEED_VIEW_LOGS, { params });
    return res.data;
  } catch (error) {
    console.error("Failed to fetch feed view logs:", error);
    return {
      success: false,
      total: 0,
      page: 1,
      totalPages: 1,
      views: []
    };
  }
}

// ✅ Fetch Category View Analytics
export async function fetchCategoryViewsAnalytics() {
  try {
    const res = await Api.get(API_ENDPOINTS.ADMIN_CATEGORY_VIEWS);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch category views analytics:", error);
    return {
      success: false,
      categories: []
    };
  }
}

// ✅ Fetch User Viewed Feeds (Watch history for individual user)
export async function fetchUserViewedFeeds(userId, params = {}) {
  try {
    const res = await Api.get(`${API_ENDPOINTS.ADMIN_USER_VIEWED_FEEDS}/${userId}`, { params });
    return res.data;
  } catch (error) {
    console.error("Failed to fetch user viewed feeds:", error);
    return {
      success: false,
      totalViews: 0,
      views: []
    };
  }
}


// ✅ Delete Category
export async function deleteCategory(categoryId) {
  try {
    const res = await Api.delete(API_ENDPOINTS.ADMIN_DELETE_CATEGORY, {
      data: { categoryId }
    });
    return res.data; // 👈 return success info
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete category");
  }
}



export const updateCategory = async ({ id, name, subcategories, order }) => {
  try {
    const res = await Api.put(API_ENDPOINTS.ADMIN_UPDATE_CATEGORY, { id, name, subcategories, order });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update category");
  }
};

export const reorderCategories = async (categories) => {
  try {
    const res = await Api.put(API_ENDPOINTS.ADMIN_REORDER_CATEGORIES, { categories });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to reorder categories");
  }
};

export const assignCategoryOrder = async ({ id, categoryId, order }) => {
  try {
    const res = await Api.put(API_ENDPOINTS.ADMIN_ASSIGN_CATEGORY_ORDER, { id: id || categoryId, order });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to assign category order");
  }
};

export async function removeFeedCategory({ feedId, categoryId }) {
  try {
    const res = await Api.delete(`${API_ENDPOINTS.REMOVE_FEED_CATEGORY}/${feedId}/category/${categoryId}`);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to remove category from feed");
  }
}

export async function updateFeedCategoryAndSub({ feedId, categoryId, subCategory }) {
  try {
    const res = await Api.put(`${API_ENDPOINTS.ADMIN_UPDATE_FEED_DESIGN}/${feedId}/category`, { categoryId, subCategory });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update category for feed");
  }
}

// ✅ Get Feed Design
export async function fetchFeedDesign(feedId) {
  try {
    const res = await Api.get(`${API_ENDPOINTS.ADMIN_GET_FEED_DESIGN}/${feedId}/design`);
    return res.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch feed design");
  }
}

// ✅ Update Feed Design
export async function updateFeedDesignMetadata(feedId, { designMetadata, editMetadata }) {
  try {
    const res = await Api.put(`${API_ENDPOINTS.ADMIN_UPDATE_FEED_DESIGN}/${feedId}/design`, { designMetadata, editMetadata });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update feed design");
  }
}



// ✅ Update Feed Schedule
export async function updateFeedSchedule(feedId, { scheduleTime }) {
  try {
    const res = await Api.patch(`${API_ENDPOINTS.ADMIN_UPDATE_FEED_SCHEDULE}/${feedId}/schedule`, { scheduleTime });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update feed schedule");
  }
}

// ✅ App Version & Play Store In-App Update Management
export async function fetchAppVersionConfig() {
  try {
    const res = await Api.get(API_ENDPOINTS.ADMIN_GET_APP_VERSION);
    return res.data.config;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch app version configuration");
  }
}

export async function updateAppVersionConfig(payload) {
  try {
    const res = await Api.put(API_ENDPOINTS.ADMIN_UPDATE_APP_VERSION, payload);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update app version configuration");
  }
}
