import apiClient from "./apiClient";

export const fetchAllBlogsAdmin = async () => {
    const response = await apiClient.get("/api/admin/blogs/all");
    return response.data;
};

export const createBlog = async (blogData) => {
    // If blogData is FormData, axios will set the correct headers
    const response = await apiClient.post("/api/admin/blogs/create", blogData);
    return response.data;
};

export const updateBlog = async (id, blogData) => {
    const response = await apiClient.put(`/api/admin/blogs/update/${id}`, blogData);
    return response.data;
};

export const deleteBlog = async (id) => {
    const response = await apiClient.delete(`/api/admin/blogs/delete/${id}`);
    return response.data;
};

export const toggleBlogStatus = async (id) => {
    const response = await apiClient.patch(`/api/admin/blogs/toggle-status/${id}`);
    return response.data;
};
