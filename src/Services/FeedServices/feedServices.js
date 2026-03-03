import Api from "../../Utils/axiosApi.js";
import { API_ENDPOINTS } from "../../API-Constanse/apiConstance.js";




// ✅ Get categories
export async function fetchCategories() {
  try {
    const res = await Api.get(API_ENDPOINTS.ADMIN_GET_CATEGORY);

    return res.data.categories;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch categories");
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
export async function fetchFeeds() {
  try {
    const res = await Api.get(API_ENDPOINTS.ADMIN_GET_ALL_FEED);

    return res.data.feeds;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch feeds");
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



export const updateCategory = async ({ id, name }) => {
  try {
    const res = await Api.put(API_ENDPOINTS.ADMIN_UPDATE_CATEGORY, { id, name });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update category");
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
