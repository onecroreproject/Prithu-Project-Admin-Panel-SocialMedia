import { Suspense, lazy } from "react";
// App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Context Providers
import { AdminAuthProvider } from "./context/adminAuthContext";
import { AdminProfileProvider } from "./context/adminProfileContext";
import { UpdateProvider } from "./context/UpdateContext";

// Auth & Protected Routes (Non-lazy for initial load performance/reliability)
import SignIn from "./pages/AuthPages/SignIn";
import ForgotPassword from "./components/auth/forgotPasswordForm";
import AdminProtectedRoute from "./components/auth/AdminProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { ErrorBoundary } from "react-error-boundary";

// ====== LAZY LOADED PAGES ======

// Dashboard
const SocialMediaDashboard = lazy(() => import("./pages/Dashboard/SocialMediaDashboard"));
const SettingsDashboard = lazy(() => import("./pages/Dashboard/settingsDashboard"));
const SalesDashboard = lazy(() => import("./pages/SalesDashboard/salesdashBoardPage"));
const SEODashboard = lazy(() => import("./pages/AdminPages/SEODashboard"));
const EmailManagementDashboard = lazy(() => import("./pages/EmailManagement/EmailManagementDashboard"));
const GoogleDriveDashboard = lazy(() => import("./DriverDashboard/googleDashboard"));
const RecommendationDashboard = lazy(() => import("./pages/RecommendationDashboard"));
const VideoCompressionDashboard = lazy(() => import("./pages/AdminPages/VideoCompressionDashboard"));

// Social Media Module
const UploadPage = lazy(() => import("./pages/uploadPage"));
const UserProfilePage = lazy(() => import("./pages/UserProfile/userProfilePage"));
const IndividualUserProfilePage = lazy(() => import("./pages/UserProfile/UserAnalitical/individualUserProfilePage"));
const UserAnalytics = lazy(() => import("./pages/UserProfile/UserAnalitical/userAnaliticalPage"));
const ReferralTreePage = lazy(() => import("./pages/userTree"));
const CreatorTable = lazy(() => import("./components/tables/UserTabel/creatorTable"));
const TrendingCreatorsPage = lazy(() => import("./pages/trendingCreator"));
const BlogListPage = lazy(() => import("./pages/BlogManagement/BlogListPage"));
const AddBlogPage = lazy(() => import("./pages/BlogManagement/AddBlogPage"));
const WhatsNew = lazy(() => import("./pages/Updates/WhatsNew"));
const UpdateManagement = lazy(() => import("./pages/Updates/UpdateManagement"));
const UserFeedReportTable = lazy(() => import("./components/tables/UserTabel/userReportTable"));
const CategoryManagementPage = lazy(() => import("./pages/CategoryManagementPage"));
const PartyManagement = lazy(() => import("./pages/PartyManagement/PartyManagement"));
const TrendingFeedsTable = lazy(() => import("./pages/treandingFeed"));
const UsersWillingToPost = lazy(() => import("./pages/socialMedia/Feed/userFeedRequestPage"));
const UserDeletionLogsPage = lazy(() => import("./pages/UserProfile/UserDeletionLogsPage"));

// Settings & Admin
const ChildAdminPage = lazy(() => import("./pages/ChildAdminRegister/childAdminPage"));
const ChildAdminPermissionPage = lazy(() => import("./pages/ChildAdminRegister/childAdminPermissionPage"));
const ChildAdminProfile = lazy(() => import("./pages/ChildAdminProfilePage/childAdminProfilePage"));
const ChildAdminListPage = lazy(() => import("./pages/ChildAdmin/ChildAdminListPage"));
const AdminProfilePage = lazy(() => import("./pages/adminProfilePage"));
const SubscriptionPage = lazy(() => import("./pages/subscriptionPage"));
const SubscriptionUsersTablePage = lazy(() => import("./pages/SalesDashboard/Tables/SubscriptionUsersTablePage"));
const WithdrawalUsersTablePage = lazy(() => import("./pages/SalesDashboard/Tables/WithdrawalUsersTablePage"));
const TopReferralUsersTablePage = lazy(() => import("./pages/SalesDashboard/Tables/TopReferralUsersTablePage"));
const ReportManagementPage = lazy(() => import("./pages/ReportManagement/reportmanagement"));
const AdminFaqPage = lazy(() => import("./pages/faqPage"));
const AdminFeedbackPage = lazy(() => import("./pages/feedbackandReportpage"));
const FooterManagementPage = lazy(() => import("./pages/footerManagementPage"));
const ServerManagement = lazy(() => import("./pages/AdminPages/ServerManagement"));
const AdminStudioLayout = lazy(() => import("./pages/AdminStudio/studioLayout"));

// SEO & Email
const GlobalSEOSettings = lazy(() => import("./pages/AdminPages/GlobalSEOSettings"));
const RedirectManager = lazy(() => import("./pages/AdminPages/RedirectManager"));
const PageSEOMatagement = lazy(() => import("./pages/AdminPages/PageSEOMatagement"));
const FeedSEOMatagement = lazy(() => import("./pages/AdminPages/FeedSEOMatagement"));
const MediaSEOMatagement = lazy(() => import("./pages/AdminPages/MediaSEOMatagement"));
const TemplateEditor = lazy(() => import("./pages/EmailManagement/TemplateEditor"));

// Other
const NotFound = lazy(() => import("./pages/OtherPage/NotFound"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

function RouteErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="p-6 text-center">
      <h2 className="text-xl font-bold text-red-600">Something went wrong!</h2>
      <p className="mt-2 text-gray-700">{error.message}</p>
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        onClick={resetErrorBoundary}
      >
        Try Again
      </button>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingFallback />}>
        <Routes location={location} key={location.pathname}>
          {/* ====== AUTH ROUTES ====== */}
          <Route path="/signin" element={<PublicRoute><SignIn /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

          {/* ====== MAIN LAYOUT WITH DASHBOARD CARDS ====== */}
          <Route path="/" element={<AdminProtectedRoute><AppLayout /></AdminProtectedRoute>}>
            <Route index element={<></>} />

            {/* Dashboards */}
            <Route path="/social/dashboard" element={<SocialMediaDashboard />} />
            <Route path="/settings/dashboard" element={<SettingsDashboard />} />
            <Route path="/settings/sales/dashboard" element={<SalesDashboard />} />
            <Route path="/seo/dashboard" element={<SEODashboard />} />
            <Route path="/settings/email/dashboard" element={<EmailManagementDashboard />} />
            <Route path="/drive/dashboard" element={<GoogleDriveDashboard />} />
            <Route path="/analytics/dashboard" element={<SocialMediaDashboard />} />
            <Route path="/social/recommendation-dashboard" element={<RecommendationDashboard />} />
            <Route path="/settings/video-compression" element={<VideoCompressionDashboard />} />

            {/* Social Media Module */}
            <Route path="/social/creator/trending/table" element={<CreatorTable />} />
            <Route path="/social/trending/creator" element={<TrendingCreatorsPage />} />
            <Route path="/social/user-reportinfo" element={<UserFeedReportTable />} />
            <Route path="/social/profile" element={<UserProfilePage />} />
            <Route path="/social/individual/user/profile/:id" element={<IndividualUserProfilePage />} />
            <Route path="/social/user/analitical/page/:userId" element={<UserAnalytics />} />
            <Route path="/social/referal/tree/page/:userId" element={<ReferralTreePage />} />
            <Route path="/social/tree" element={<ReferralTreePage />} />
            <Route path="/social/trending/feed" element={<TrendingFeedsTable />} />
            <Route path="/social/post/request/approval" element={<UsersWillingToPost />} />
            <Route path="/social/user/deletion-logs" element={<UserDeletionLogsPage />} />
            <Route path="/social/admin/upload/page" element={<UploadPage />} />
            <Route path="/social/category/management" element={<CategoryManagementPage />} />
            <Route path="/social/party/management" element={<PartyManagement />} />
            <Route path="/social/blog/list" element={<BlogListPage />} />
            <Route path="/social/blog/add" element={<AddBlogPage />} />
            <Route path="/social/blog/edit/:id" element={<AddBlogPage />} />
            <Route path="/social/whats-new" element={<WhatsNew />} />

            {/* Settings & Admin (RBAC Applied) */}
            <Route path="/settings/child/admin/page" element={<AdminProtectedRoute requiredRoles={["Admin"]}><ChildAdminPage /></AdminProtectedRoute>} />
            <Route path="/settings/child/admin/list" element={<AdminProtectedRoute requiredRoles={["Admin"]}><ChildAdminListPage /></AdminProtectedRoute>} />
            <Route path="/settings/child/admin/profile/:id" element={<AdminProtectedRoute requiredRoles={["Admin", "Child_Admin"]}><ChildAdminProfile /></AdminProtectedRoute>} />
            <Route path="/settings/childadmin/permission/:id" element={<AdminProtectedRoute requiredRoles={["Admin"]}><ChildAdminPermissionPage /></AdminProtectedRoute>} />
            <Route path="/settings/server/management" element={<AdminProtectedRoute requiredRoles={["Admin"]}><ServerManagement /></AdminProtectedRoute>} />
            
            <Route path="/settings/admin/profile/page" element={<AdminProfilePage />} />
            <Route path="/settings/subscription/page" element={<SubscriptionPage />} />
            <Route path="/settings/sales/subscriptions" element={<SubscriptionUsersTablePage />} />
            <Route path="/settings/sales/withdrawals" element={<WithdrawalUsersTablePage />} />
            <Route path="/settings/sales/referrals" element={<TopReferralUsersTablePage />} />
            <Route path="/settings/report/management" element={<ReportManagementPage />} />
            <Route path="/settings/faq/management" element={<AdminFaqPage />} />
            <Route path="/settings/reportandfeedback/management" element={<AdminFeedbackPage />} />
            <Route path="/settings/footer/management" element={<FooterManagementPage />} />
            <Route path="/settings/updates/management" element={<UpdateManagement />} />
            <Route path="/settings/admin/studio" element={<AdminStudioLayout />} />

            {/* SEO Module */}
            <Route path="/seo/settings" element={<GlobalSEOSettings />} />
            <Route path="/seo/redirects" element={<RedirectManager />} />
            <Route path="/seo/pages" element={<PageSEOMatagement />} />
            <Route path="/seo/feeds" element={<FeedSEOMatagement />} />
            <Route path="/seo/media" element={<MediaSEOMatagement />} />

            {/* Email Management */}
            <Route path="/settings/email/templates" element={<TemplateEditor />} />
          </Route>

          {/* ====== FALLBACK ROUTE ====== */}
          <Route path="*" element={<Suspense fallback={<LoadingFallback />}><NotFound /></Suspense>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AdminAuthProvider>
      <AdminProfileProvider>
        <UpdateProvider>
          <Router>
            <ScrollToTop />
            <ErrorBoundary FallbackComponent={RouteErrorFallback}>
              <AnimatedRoutes />
            </ErrorBoundary>
          </Router>
        </UpdateProvider>
      </AdminProfileProvider>
    </AdminAuthProvider>
  );
}