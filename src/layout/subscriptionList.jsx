import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import SubscriptionCard from "../components/cards/subcriptionCard";
import { fetchPlans, deletePlan, updatePlan } from "../Services/Subscription/subscriptionService";

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.4 } },
};

const SubscriptionList = () => {
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading, isError } = useQuery({
    queryKey: ["plans"],
    queryFn: fetchPlans,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlan,
    onSuccess: () => {
      toast.success("Subscription deleted");
      queryClient.invalidateQueries(["plans"]);
    },
    onError: () => {
      toast.error("Error deleting subscription");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updatePlan,
    onSuccess: () => {
      toast.success("Subscription updated");
      queryClient.invalidateQueries(["plans"]);
    },
    onError: () => {
      toast.error("Error updating subscription");
    },
  });

  const handleDelete = (id) => deleteMutation.mutate(id);
  const handleUpdate = (id, updates) => updateMutation.mutate({ id, updates });

  if (isLoading)
    return (
      <p className="text-center text-indigo-500 animate-pulse select-none">
        Loading subscription plans...
      </p>
    );
  if (isError)
    return <p className="text-center text-red-600 font-semibold">Failed to fetch subscription plans.</p>;

  if (plans.length === 0)
    return (
      <p className="text-center text-indigo-400 font-semibold mt-20 select-none">
        No Plans Available
      </p>
    );

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      variants={listVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <AnimatePresence>
        {plans.map((plan) => (
          <motion.div
            key={plan._id}
            variants={itemVariants}
            exit="exit"
            layout
            whileHover={{ scale: 1.03, boxShadow: "0 8px 15px rgba(0,0,0,0.1)" }}
            className="rounded-xl"
          >
            <SubscriptionCard plan={plan} onDelete={handleDelete} onUpdate={handleUpdate} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default SubscriptionList;
