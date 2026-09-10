import { motion } from "framer-motion";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ReferralTable from "../../../components/tables/SalesTables/ReferralTable";

export default function TopReferralUsersTablePage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-4 sm:p-6 lg:p-8"
        >
            <div className="max-w-7xl mx-auto">
                <PageBreadcrumb pageTitle="Referral Details" />

                <div className="mt-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Top Referral Users</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Detailed list of top performing users by referral count and earnings.</p>
                    </div>

                    <ReferralTable />
                </div>
            </div>
        </motion.div>
    );
}
