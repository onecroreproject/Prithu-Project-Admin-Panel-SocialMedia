import { motion } from "framer-motion";
import SubscriptionForm from "../components/form/subscriptionForm";
import SubscriptionList from "../layout/subscriptionList";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.15 },
  },
};

const SubscriptionPage = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-10 p-6 md:p-10 bg-gradient-to-tr from-indigo-50 via-purple-50 to-pink-50 min-h-screen"
    >
      {/* Top - Form */}
      <motion.div
        className="w-full max-w-3xl mx-auto bg-white rounded-3xl shadow-lg p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-indigo-700 tracking-wide text-center">
          Create Subscription
        </h2>
        <SubscriptionForm />
      </motion.div>

      {/* Below - List */}
      <motion.div
        className="w-full max-w-7xl mx-auto bg-white rounded-3xl shadow-lg p-6 overflow-auto max-h-[70vh]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-indigo-700 tracking-wide text-center">
          All Subscriptions
        </h2>
        <SubscriptionList />
      </motion.div>
    </motion.div>
  );
};

export default SubscriptionPage;
