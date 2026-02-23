/**
 * Resolves a media path to a full URL using the configured base URL.
 * Handles three cases:
 *  1. Already a full URL (http/https) → return as-is
 *  2. Relative path (e.g. "uploads/parties/...") → prepend VITE_MEDIA_BASE_URL
 *  3. Path starting with "/" → prepend VITE_MEDIA_BASE_URL
 */
const MEDIA_BASE_URL =
    import.meta.env.VITE_MEDIA_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000";

export const getMediaUrl = (path) => {
    if (!path || typeof path !== "string") return "";

    // Already a full URL
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    const base = MEDIA_BASE_URL.endsWith("/")
        ? MEDIA_BASE_URL.slice(0, -1)
        : MEDIA_BASE_URL;

    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${base}${cleanPath}`;
};

export default getMediaUrl;
