import axios from "axios";

// 🌍 Base API URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`;

// 🧩 Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --------------------------------------------------------------------------
// 🧠 REQUEST INTERCEPTOR → Automatically attach JWT token
// --------------------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    // Try getting token from localStorage (or sessionStorage if you prefer)
    const token = localStorage.getItem("token");

    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 🔑 CRITICAL: If sending FormData, let the browser set Content-Type
    // (it needs to include the multipart boundary). Deleting our default
    // application/json header allows axios to do the right thing.
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    // Handle any request setup errors
    return Promise.reject(error);
  }
);

// --------------------------------------------------------------------------
// 🚨 RESPONSE INTERCEPTOR → Handle unauthorized or server errors globally
// --------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("🌐 Network unreachable");
      return Promise.reject(error);
    }

    const { status } = error.response;

    // 🔍 Prevent infinite redirects on auth pages
    const isAuthPage =
      window.location.pathname === "/signin" ||
      window.location.pathname === "/reset-password";

    if (status === 401 && !isAuthPage) {
      console.warn("⚠️ Unauthorized: Redirecting to sign-in …");
      localStorage.removeItem("token");
      localStorage.removeItem("admin");
      localStorage.removeItem("role");
      localStorage.removeItem("lastActive");
      window.location.replace("/signin");
    }

    return Promise.reject(error);
  }
);


export default api;
