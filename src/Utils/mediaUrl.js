/**
 * Resolves a media path to a full URL using the configured base URL.
 * Handles three cases:
 *  1. Already a full URL (http/https) → return as-is
 *  2. Relative path (e.g. "uploads/parties/...") → prepend VITE_MEDIA_BASE_URL
 *  3. Path starting with "/" → prepend VITE_MEDIA_BASE_URL
 */
const PRODUCTION_MEDIA_URL = "https://api.prithu.app";
const MEDIA_BASE_URL =
    import.meta.env.VITE_MEDIA_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "https://api.prithu.app";

export const getMediaUrl = (path) => {
    if (!path || typeof path !== "string") return "";

    let cleanPath = path.replace(/\\/g, "/").trim();
    if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
        if (
            cleanPath.includes("localhost") ||
            cleanPath.includes("127.0.0.1") ||
            cleanPath.includes("192.168.")
        ) {
            return cleanPath.replace(/^https?:\/\/[^\/]+/, PRODUCTION_MEDIA_URL);
        }
        return cleanPath;
    }

    const slashPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
    return `${PRODUCTION_MEDIA_URL}${slashPath}`;
};

export default getMediaUrl;
