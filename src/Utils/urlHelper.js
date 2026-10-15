/**
 * Formats a media path from the database into a full URL.
 * Handles cases where path might already be an absolute URL or a relative path.
 */
export const getMediaUrl = (path) => {
    if (!path) return '';

    let cleanPath = path.replace(/\\/g, '/').trim();
    if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
        if (
            cleanPath.includes('localhost') ||
            cleanPath.includes('127.0.0.1') ||
            cleanPath.includes('192.168.')
        ) {
            return cleanPath.replace(/^https?:\/\/[^\/]+/, 'https://api.prithu.app');
        }
        return cleanPath;
    }

    const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    return `https://api.prithu.app${normalizedPath}`;
};
