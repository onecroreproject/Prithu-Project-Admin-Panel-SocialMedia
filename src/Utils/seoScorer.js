/**
 * SEO Scorer Utility (Frontend Version)
 */

export const calculateSeoScore = (data) => {
    let score = 0;
    const {
        title = "",
        description = "",
        focusKeyword = "",
        slug = ""
    } = data;

    // 1. Title length (50–60 chars) - 30 points
    if (title) {
        if (title.length >= 50 && title.length <= 60) {
            score += 30;
        } else if (title.length > 0) {
            score += 15;
        }
    }

    // 2. Description length (140–160 chars) - 30 points
    if (description) {
        if (description.length >= 140 && description.length <= 160) {
            score += 30;
        } else if (description.length > 0) {
            score += 15;
        }
    }

    // 3. Focus Keyword Usage - 20 points
    if (focusKeyword) {
        const keyword = focusKeyword.toLowerCase();
        if (title && title.toLowerCase().includes(keyword)) score += 10;
        if (description && description.toLowerCase().includes(keyword)) score += 10;
    }

    // 4. Slug Optimization - 20 points
    if (slug) {
        const slugClean = slug.toLowerCase().trim();
        if (slugClean.length > 3 && !slugClean.includes(" ") && slugClean.includes("-")) {
            score += 20;
        } else {
            score += 10;
        }
    }

    return Math.min(score, 100);
};
