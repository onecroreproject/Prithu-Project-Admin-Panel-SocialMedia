/**
 * Hierarchical Permission Mapping
 * This structure determines the parent-child relationships for the UI and Sidebar.
 */

export const PERMISSION_HIERARCHY = [
    {
        name: "Dashboard & Sales",
        parent: "canManageSalesDashboard",
        children: []
    },
    {
        name: "User Management",
        parent: "canManageUsers",
        children: ["canManageUsersDetail"]
    },
    {
        name: "Creator Management",
        parent: "canManageCreators",
        children: ["canTrendingCreators"]
    },
    {
        name: "Feed Management",
        parent: "canManageFeeds",
        children: ["canManageTrendingFeeds", "canManageUserFeedRequest", "canManageUpload", "canManageCategories", "canManageParties"]
    },
    {
        name: "Report Management",
        parent: "canManageReport",
        children: ["canManageUsersFeedReports", "canManageAddReport"]
    },
    {
        name: "Subscription Management",
        parent: "canManageSubscriptions",
        children: ["canManageSettingsSubscriptions"]
    },
    {
        name: "Blog Management",
        parent: "canManageBlogs",
        children: ["canManageBlogList", "canManageBlogAdd"]
    },
    {
        name: "Admin Management",
        parent: "canManageChildAdmins",
        children: ["canManageChildAdminsCreation"]
    },
    {
        name: "Updates Management",
        parent: "canManageUpdates",
        children: []
    },
    {
        name: "Company Management",
        parent: "canManageFAQs",
        children: ["canManageUserFeedbacks", "canManageFooter", "canViewCompanyInfo"]
    },
    {
        name: "SEO Management",
        parent: "canManageSEO",
        children: ["canViewSEODashboard", "canManageSEOGlobal", "canManageSEOFeeds", "canManageSEOMedia", "canManageSEORedirects"]
    },
    {
        name: "Email Management",
        parent: "canManageEmails",
        children: []
    },
    {
        name: "Server Management",
        parent: "canViewSystemLogs",
        children: []
    }
];

// Flat list of all permissions for easy lookup
export const ALL_PERMISSIONS = PERMISSION_HIERARCHY.reduce((acc, curr) => {
    acc.push(curr.parent);
    if (curr.children) acc.push(...curr.children);
    return acc;
}, []);

// Helper to check if a permission is a child
export const isChildPermission = (perm) => PERMISSION_HIERARCHY.some(group => group.children.includes(perm));

// Helper to get parent of a child permission
export const getParentOf = (perm) => PERMISSION_HIERARCHY.find(group => group.children.includes(perm))?.parent;
