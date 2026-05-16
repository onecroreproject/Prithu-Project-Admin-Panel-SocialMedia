

// API Endpoints
export const API_ENDPOINTS = {
  USER_DETAIL: "/api/admin/getall/users",
  GET_INDIVIDUAL_USER_DETAIL: "/api/admin/get/user/social/media/profile/detail",
  GET_USER_ANALYTICAL_DATA: "/api/admin/get/user/analytical/data",
  GET_USER_TREE_LEVEL: "/api/admin/user/tree/level",
  BLOCK_USER: "/api/admin/block/user",
  USER_PROFILE_METRICKS: "/api/admin/user/profile/metricks",
  GET_USER_REPORTS: "/api/admin/user/report",
  UPDATE_REPORT_ACTION: "/api/admin/report/action/update",



  USER_ANALYTICS_SUMMARY: "/api/summary",
  USER_ANALYTICS_FEEDS: "/api/feeds",
  USER_ANALYTICS_FOLLOWING: "/api/following",
  USER_ANALYTICS_INTERESTED: "/api/interested",
  USER_ANALYTICS_HIDDEN: "/api/hidden",
  USER_ANALYTICS_LIKED: "/api/liked",
  USER_ANALYTICS_DISLIKED: "/api/disliked",
  USER_ANALYTICS_COMMENTED: "/api/commented",
  USER_ANALYTICS_SHARED: "/api/shared",
  USER_ANALYTICS_DOWNLOADED: "/api/downloaded",
  USER_ANALYTICS_NON_INTERESTED: "/api/nonInterested",
  ADMIN_DELETE_USER: "/api/admin/delete/user",
  USER_DELETE_LOGS: "/api/admin/user/delete-logs",


  DASHBOARD_METRICKS: "/api/admin/dashboard/metricks/counts",
  DASHBOARD_USER_REGITRATION_CHART: "/api/admin/users/monthly-registrations",
  DASHBOARD_HEARTBEAT: "/api/admin/dashboard/heartbeat",
  DASHBOARD_SUBSCRIPTION_RATIO_CHART: "/api/admin/user/subscriptionration",


  ADMIN_UPLOAD_FEED: "/api/admin/feed-upload",

  CHILD_ADMIN_REGISTER: "/api/auth/admin/register",
  GET_CHILD_ADMIN_LIST: "/api/admin/childadmin/list",
  GET_CHILD_ADMIN_PERMISSONS: "/api/admin/childadmin/permissions",
  UPDATE_CHILD_ADMIN_PERMISSIONS: "/api/admin/childadmin/permissions",
  GET_CHILD_ADMIN_DETAIL: "/api/child/admin",
  DETETE_CHILD_ADMIN: "/api/delete/child/admin",
  BLOCK_CHILD_ADMIN: "/api/block/child/admin",
  UPDATE_CHILD_ADMIN_PROFILE: "/api/child/admin/profile/update",


  GET_SALES_METRICKS: "/api/sales/dashboard/analytics",
  GET_RECENT_SUBSCRIBER_USERS: '/api/get/recent/subscribers',
  GET_RECENT_WITHDRAWALS: '/api/get/recent/withdrawals',
  GET_REFERALL_TOPERS: "/api/top/referral/users",
  GET_SALES_CHART_COUNT: "/api/dashboard/user-subscription-counts",


  ADMIN_GET_ALL_CREATOR: "/api/admin/getall/creators",
  ADMIN_GET_TRENDING_CREATOR: "/api/admin/get/trending/creator",


  ADMIN_GET_CATEGORY: "/api/admin/get/feed/category",
  ADMIN_UPLOAD_CATEGORY: "/api/admin/add/feed/category",
  ADMIN_GET_ALL_FEED: "/api/admin/get/all/feed",
  ADMIN_DELETE_FEED: "/api/delete/feed",
  REMOVE_FEED_CATEGORY: "/api/admin/feed",
  ADMIN_DELETE_CATEGORY: "/api/delete/category",
  ADMIN_UPDATE_CATEGORY: "/api/admin/update/category",
  ADMIN_GET_FEED_DESIGN: "/api/admin/feed", // Base for /:feedId/design
  ADMIN_UPDATE_FEED_DESIGN: "/api/admin/feed", // Base for /:feedId/design
  ADMIN_UPDATE_FEED_SCHEDULE: "/api/admin/feed", // Base for /:feedId/schedule


  ADMIN_LOGIN: "/api/auth/admin/login",
  ADMIN_SENT_OTP: "/api/auth/admin/sent-otp",
  ADMIN_VERFY_EXISTING_OTP: "/api/auth/exist/admin/verify-otp",
  ADMIN_RESET_PASSWORD: "/api/auth/admin/reset-password",
  ADMIN_VERFY_TOKEN: "/api/admin/verify-token",
  CHILD_ADMIN_HEARTBEAT: "/api/auth/child-admin/heartbeat",
  GET_CHILD_ADMIN_STATS: "/api/admin/child-admin-stats",



  ADMIN_GET_ALL_SUBSCRIPTION: '/api/admin/getall/subscriptions',
  ADMIN_DELETE_SUBSCRIPTION_PLAN: '/api/admin/delete/subscription',
  ADMIN_UPDATE_SUBSCRIPTION_PLAN: '/api/admin/update/subscription',
  ADMIN_CREATE_SUBSCRIPTION_PLAN: '/api/admin/create/subscription',



  ADMIN_GET_POSTED_JOBS: "/web/job/admin/get/all",

  // SEO Endpoints
  SEO_STATS: "/api/admin/seo/stats",
  SEO_CONFIG: "/api/admin/seo/config",
  SEO_PAGES: "/api/admin/seo/pages",
  SEO_FEEDS: "/api/admin/seo/feeds",
  SEO_MEDIA: "/api/admin/seo/media",
  SEO_REDIRECTS: "/api/admin/seo/redirects",
  SEO_SITEMAP: "/api/admin/seo/sitemap",
  SEO_ROBOTS: "/api/admin/seo/robots",
  UPDATE_PAGE_SEO: "/api/admin/static-page",
  
  // Video Compression Endpoints
  VIDEO_COMPRESSION_STATS: "/api/admin/video-compression/stats",
  VIDEO_COMPRESSION_BULK_START: "/api/admin/video-compression/bulk-start",
  VIDEO_COMPRESSION_TOGGLE_QUEUE: "/api/admin/video-compression/toggle-queue",
  VIDEO_COMPRESSION_STOP_ALL: "/api/admin/video-compression/stop-all",
  VIDEO_COMPRESSION_RETRY: "/api/admin/video-compression/retry",

  // ML Metadata & Cron Endpoints
  ML_METADATA_STATS: "/api/admin/ml-metadata/stats",
  ML_METADATA_TOGGLE: "/api/admin/ml-metadata/toggle",
  CRON_TRIGGER: "/api/admin/cron/trigger",
};
