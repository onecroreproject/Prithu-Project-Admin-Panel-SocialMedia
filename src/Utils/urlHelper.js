/**
 * Formats a media path from the database into a full URL.
 * Handles cases where path might already be an absolute URL or a relative path.
 */
export const getMediaUrl = (path) => {
    if (!path) return '';

    // If it's already an absolute URL (http/https), return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // Ensure the path starts with a slash
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // Combine with media base URL from environment
    const baseUrl = import.meta.env.VITE_MEDIA_BASE_URL || '';

    // Remove trailing slash from baseUrl if present
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    return `${cleanBaseUrl}${normalizedPath}`;
};
