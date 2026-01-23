import Api from "../../Utils/axiosApi.js";
import { API_ENDPOINTS } from "../../API-Constanse/apiConstance.js";

// ✅ Fetch all users
export const fetchUsers = async () => {
  const res = await Api.get(API_ENDPOINTS.USER_DETAIL);
  return res.data.users;
};



// In userServices.js
export const searchUsers = async (searchQuery) => {
  console.log(searchQuery)
  const response = await Api.get("/api/admin/search/user", {
    params: { search: searchQuery }
  });
  return response.data;
};

// ✅ Block a user
export const blockUser = async (userId) => {
  const res = await Api.patch(
    `${API_ENDPOINTS.BLOCK_USER}/${userId}`,
    {},
    { withCredentials: true }
  );
  return res.data;
};


export const deleteUser = async (userId) => {

  const { data } = await Api.delete(`${API_ENDPOINTS.ADMIN_DELETE_USER}/${userId}`);

  return data;
};

// ✅ Fetch individual user
export const fetchUserById = async (userId) => {
  const res = await Api.get(`${API_ENDPOINTS.GET_INDIVIDUAL_USER_DETAIL}/${userId}`);
  return res.data.user;
};

// ✅ Fetch user metrics
export const fetchUserMetricks = async (userId) => {
  const res = await Api.get(`${API_ENDPOINTS.USER_PROFILE_METRICKS}`);
  return res.data;
};

// ✅ Fetch user analytics
export const fetchUserAnalytics = async (userId) => {
  const res = await Api.get(`${API_ENDPOINTS.GET_USER_ANALYTICAL_DATA}/${userId}`);
  return res.data;
};

// ✅ Fetch user tree level
export const fetchUserLevel = async (userId) => {
  const res = await Api.get(`${API_ENDPOINTS.GET_USER_TREE_LEVEL}/${userId}`);
  return res.data;
};

// Utility function to build query string from filters
const buildQueryParams = (params) => {
  const query = new URLSearchParams();
  if (params?.startDate) query.append("startDate", params.startDate);
  if (params?.endDate) query.append("endDate", params.endDate);
  if (params?.type) query.append("type", params.type);
  return query.toString() ? `?${query.toString()}` : "";
};

// Analytics tabs services with filters using Api instance
export const fetchUserFeeds = async (userId, params) => {
  const res = await Api.get(`${API_ENDPOINTS.USER_ANALYTICS_FEEDS}/${userId}${buildQueryParams(params)}`);
  return res.data.feeds;
};

export const fetchUserFollowing = async (userId, params) => {
  const res = await Api.get(`${API_ENDPOINTS.USER_ANALYTICS_FOLLOWING}/${userId}${buildQueryParams(params)}`);
  return res.data.following;
};

export const fetchUserInterested = async (userId, params) => {
  const res = await Api.get(`${API_ENDPOINTS.USER_ANALYTICS_INTERESTED}/${userId}${buildQueryParams(params)}`);

  return res.data.categories;
};

export const fetchUserNonInterested = async (userId, params) => {
  const res = await Api.get(`${API_ENDPOINTS.USER_ANALYTICS_NON_INTERESTED}/${userId}${buildQueryParams(params)}`);

  return res.data.categories;
};

export const fetchUserHidden = async (userId, params) => {
  const res = await Api.get(`${API_ENDPOINTS.USER_ANALYTICS_HIDDEN}/${userId}${buildQueryParams(params)}`);
  return res.data.hiddenFeeds;
};

export const fetchUserLiked = async (userId, params) => {
  const res = await Api.get(`${API_ENDPOINTS.USER_ANALYTICS_LIKED}/${userId}${buildQueryParams(params)}`);
   
  return res.data.likedFeeds;
};

export const fetchUserDisliked = async (userId, params) => {
  const res = await Api.get(`${API_ENDPOINTS.USER_ANALYTICS_DISLIKED}/${userId}${buildQueryParams(params)}`);
  return res.data.dislikedFeeds;
};

export const fetchUserCommented = async (userId, params) => {
  const res = await Api.get(`${API_ENDPOINTS.USER_ANALYTICS_COMMENTED}/${userId}${buildQueryParams(params)}`);

  return res.data.commentedFeeds;
};

export const fetchUserShared = async (userId, params) => {
  const res = await Api.get(`${API_ENDPOINTS.USER_ANALYTICS_SHARED}/${userId}${buildQueryParams(params)}`);
  return res.data.sharedFeeds;
};

export const fetchUserDownloaded = async (userId, params) => {
  const res = await Api.get(`${API_ENDPOINTS.USER_ANALYTICS_DOWNLOADED}/${userId}${buildQueryParams(params)}`);
  return res.data.downloadedFeeds;
};
