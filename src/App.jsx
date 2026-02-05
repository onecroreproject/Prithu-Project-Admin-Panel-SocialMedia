// App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Context Providers
import { AdminAuthProvider } from "./context/adminAuthContext";
import { AdminProfileProvider } from "./context/adminProfileContext";

// Auth Pages
import SignIn from "./pages/AuthPages/SignIn";
import ForgotPassword from "./components/auth/forgotPasswordForm";
import AdminProtectedRoute from "./components/auth/AdminProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";

// Layout
import AppLayout from "./layout/AppLayout";

// Dashboard & Main Pages
import SocialMediaDashboard from "./pages/Dashboard/SocialMediaDashboard";
import NotFound from "./pages/OtherPage/NotFound";

// Social Media Module Pages
import UploadPage from "./pages/uploadPage";
import UserProfiles from "./pages/UserProfile/UserProfiles";
import UserProfilePage from "./pages/UserProfile/userProfilePage";
import IndividualUserProfilePage from "./pages/UserProfile/UserAnalitical/individualUserProfilePage";
import UserAnalytics from "./pages/UserProfile/UserAnalitical/userAnaliticalPage";
import ReferralTreePage from "./pages/userTree";
import CreatorTable from "./components/tables/UserTabel/creatorTable";
import TrendingCreatorsPage from "./pages/trendingCreator";

import UserFeedReportTable from "./components/tables/UserTabel/userReportTable";
import CategoryManagementPage from "./pages/CategoryManagementPage";

// Settings Module Pages
import SettingsDashboard from "./pages/Dashboard/settingsDashboard";
import ChildAdminPage from "./pages/ChildAdminRegister/childAdminPage";
import ChildAdminPermissionPage from "./pages/ChildAdminRegister/childAdminPermissionPage";
import ChildAdminProfile from "./pages/ChildAdminProfilePage/childAdminProfilePage";
import AdminProfilePage from "./pages/adminProfilePage";
import SubscriptionPage from "./pages/subscriptionPage";
import SalesDashboard from "./pages/SalesDashboard/salesdashBoardPage";
import ReportManagementPage from "./pages/ReportManagement/reportmanagement";

// UI Elements & Components
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";

// Charts
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";

// Other Pages
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";

// Common Components
import { ScrollToTop } from "./components/common/ScrollToTop";

// Error Boundary
import { ErrorBoundary } from "react-error-boundary";
import TrendingFeedsTable from "./pages/treandingFeed";
import PostApprovalRequests from "./pages/socialMedia/Feed/userFeedRequestPage";
import UsersWillingToPost from "./pages/socialMedia/Feed/userFeedRequestPage";
import DriveDashboard from "./DriverDashboard/DriveDashboard";
import GoogleDriveDashboard from "./DriverDashboard/googleDashboard"
import AdminFeedbackPage from "./pages/feedbackandReportpage";
import AdminStudioLayout from "./pages/AdminStudio/studioLayout";
import AdminFaqPage from "./pages/faqPage";

// Create separate dashboard components or use existing ones
// For now, we'll use SocialMediaDashboard as a placeholder for analytics
const AnalyticsDashboard = SocialMediaDashboard;

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
      <Routes location={location} key={location.pathname}>
        {/* ====== AUTH ROUTES ====== */}
        <Route path="/signin" element={<PublicRoute><SignIn /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

        {/* ====== MAIN LAYOUT WITH DASHBOARD CARDS ====== */}
        <Route path="/" element={<AdminProtectedRoute><AppLayout /></AdminProtectedRoute>}>
          {/* Dashboard Route - Shows dashboard cards */}
          <Route index element={<></>} />

          {/* ====== SOCIAL MEDIA MODULE ROUTES ====== */}
          <Route path="/social/dashboard" element={<SocialMediaDashboard />} />
          <Route path="/social/creator/trending/table" element={<CreatorTable />} />
          <Route path="/social/trending/creator" element={<TrendingCreatorsPage />} />
          <Route path="/social/user-reportinfo" element={<UserFeedReportTable />} />




          {/* User Management */}
          <Route path="/social/profile" element={<UserProfilePage />} />
          <Route path="/social/individual/user/profile/:id" element={<IndividualUserProfilePage />} />
          <Route path="/social/user/analitical/page/:userId" element={<UserAnalytics />} />
          <Route path="/social/referal/tree/page/:userId" element={<ReferralTreePage />} />
          <Route path="/social/tree" element={<ReferralTreePage />} />
          <Route path="/social/trending/feed" element={<TrendingFeedsTable />} />
          <Route path="/social/post/request/approval" element={<UsersWillingToPost />} />

          <Route path="/social/admin/upload/page" element={<UploadPage />} />
          <Route path="/social/category/management" element={<CategoryManagementPage />} />


          {/* ====== SETTINGS MODULE ROUTES ====== */}
          <Route path="/settings/dashboard" element={<SettingsDashboard />} />
          <Route path="/settings/child/admin/page" element={<ChildAdminPage />} />
          <Route path="/settings/childadmin/permission/:id" element={<ChildAdminPermissionPage />} />
          <Route path="/settings/child/admin/profile/:id" element={<ChildAdminProfile />} />
          <Route path="/settings/admin/profile/page" element={<AdminProfilePage />} />
          <Route path="/settings/subscription/page" element={<SubscriptionPage />} />
          <Route path="/settings/sales/dashboard" element={<SalesDashboard />} />
          <Route path="/settings/report/management" element={<ReportManagementPage />} />
          <Route path="/settings/faq/management" element={<AdminFaqPage />} />
          <Route path="/settings/reportandfeedback/management" element={<AdminFeedbackPage />} />
          <Route path="/settings/admin/studio" element={<AdminStudioLayout />} />

          {/* ====== DRIVE MODULE ROUTES ====== */}
          <Route path="/drive/dashboard" element={<GoogleDriveDashboard />} />



          {/* ====== ANALYTICS MODULE ROUTES ====== */}
          <Route path="/analytics/dashboard" element={<AnalyticsDashboard />} />

          {/* ====== UI COMPONENTS & DEMO PAGES ====== */}
          {/* UI Elements */}
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/avatars" element={<Avatars />} />
          <Route path="/badge" element={<Badges />} />
          <Route path="/buttons" element={<Buttons />} />
          <Route path="/images" element={<Images />} />
          <Route path="/videos" element={<Videos />} />

          {/* Charts */}
          <Route path="/line-chart" element={<LineChart />} />
          <Route path="/bar-chart" element={<BarChart />} />

          {/* Other Pages */}
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/basic-tables" element={<BasicTables />} />
          <Route path="/form-elements" element={<FormElements />} />
          <Route path="/blank" element={<Blank />} />
        </Route>

        {/* ====== FALLBACK ROUTE ====== */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AdminAuthProvider>
      <AdminProfileProvider>
        <Router>
          <ScrollToTop />
          <ErrorBoundary FallbackComponent={RouteErrorFallback}>
            <AnimatedRoutes />
          </ErrorBoundary>
        </Router>
      </AdminProfileProvider>
    </AdminAuthProvider>
  );
}