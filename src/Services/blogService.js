import api from "./apiService";

export const fetchAllBlogsAdmin = async () => {
    const response = await api.get("/api/admin/blogs/all");
    return response.data;
};

export const createBlog = async (blogData) => {
    // If blogData is FormData, axios will set the correct headers
    const response = await api.post("/api/admin/blogs/create", blogData);
    return response.data;
};

export const updateBlog = async (id, blogData) => {
    const response = await api.put(`/api/admin/blogs/update/${id}`, blogData);
    return response.data;
};

export const deleteBlog = async (id) => {
    const response = await api.delete(`/api/admin/blogs/delete/${id}`);
    return response.data;
};

export const toggleBlogStatus = async (id) => {
    const response = await api.patch(`/api/admin/blogs/toggle-status/${id}`);
    return response.data;
};
