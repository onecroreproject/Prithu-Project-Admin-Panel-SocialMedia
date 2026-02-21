import { motion } from "framer-motion";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import WithdrawalTable from "../../../components/tables/SalesTables/WithdrawalTable";

export default function WithdrawalUsersTablePage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-4 sm:p-6 lg:p-8"
        >
            <div className="max-w-7xl mx-auto">
                <PageBreadcrumb pageTitle="Withdrawal Details" />

                <div className="mt-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Withdrawal History</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Detailed log of all completed user withdrawal transactions.</p>
                    </div>

                    <WithdrawalTable />
                </div>
            </div>
        </motion.div>
    );
}
