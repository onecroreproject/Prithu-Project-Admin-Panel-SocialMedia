import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ChildAdminForm from "../../components/auth/childAdminCreationForm";
import { getChildAdmins } from "../../Services/childAdminServices/childAdminServices";

const fadeLeft = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, type: "spring", bounce: 0.13 } }
};

export default function AdminChildPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: childAdmins = [], isLoading, isError } = useQuery({
    queryKey: ["childAdmins"],
    queryFn: getChildAdmins,
  });

  const handleAddChildAdmin = (newAdmin) => {
    queryClient.setQueryData(["childAdmins"], (old = []) => [newAdmin, ...old]);
  };

  if (isLoading) return <p className="p-6">Loading child admins...</p>;
  if (isError) return <p className="p-6 text-red-500">Failed to load child admins.</p>;

  return (
    <motion.div
      className="flex w-full min-h-screen bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50"
      variants={fadeLeft}
      initial="hidden"
      animate="visible"
    >
      {/* Left: Child Admin Form */}
      <motion.div
        variants={fadeLeft}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.07 }}
        className="flex-1 border-r border-violet-200 p-6 bg-white bg-opacity-95 rounded-r-3xl shadow-2xl flex flex-col justify-center"
      >
        <ChildAdminForm onSuccess={handleAddChildAdmin} />
      </motion.div>

      {/* Right: Child Admin List */}
      <motion.div
        variants={fadeLeft}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.18 }}
        className="flex-1 p-6 flex flex-col"
      >
        <h2 className="text-xl font-semibold mb-4 text-violet-700">Child Admin List</h2>
        <div className="flex-1 overflow-y-auto">
          <table className="min-w-full border-2 border-violet-200 bg-white rounded-xl shadow-xl transition-shadow">
            <thead className="bg-gradient-to-r from-blue-100 via-violet-100 to-pink-100 sticky top-0 z-10">
              <tr>
                <th className="py-2 px-3 text-left text-violet-800">Admin ID</th>
                <th className="py-2 px-3 text-left text-violet-800">Email</th>
                <th className="py-2 px-3 text-left text-violet-800">Username</th>
                <th className="py-2 px-3 text-left text-violet-800">Type</th>
                <th className="py-2 px-3 text-center text-violet-800">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-50">
              <AnimatePresence>
                {childAdmins.length === 0
                  ? (
                      <motion.tr
                        key="no-admin"
                        initial={{ opacity: 0, x: -24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -38 }}
                        transition={{ duration: 0.23 }}
                      >
                        <td colSpan={5} className="py-8 text-center text-violet-400 font-semibold">
                          Child Admin Not Available
                        </td>
                      </motion.tr>
                    )
                  : childAdmins.map((admin) => (
                      <motion.tr
                        key={admin.childAdminId || admin._id}
                        initial={{ opacity: 0, x: -24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -38 }}
                        transition={{ duration: 0.23 }}
                        className="hover:bg-violet-50 transition"
                      >
                        <td className="py-2 px-3">{admin.childAdminId ? admin.childAdminId : "No ID"}</td>
                        <td className="py-2 px-3">{admin.email ? admin.email : "No email"}</td>
                        <td className="py-2 px-3">{admin.userName ? admin.userName : "Unnamed"}</td>
                        <td className="py-2 px-3">{admin.adminType ? admin.adminType : "Child_Admin"}</td>
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => navigate(`/settings/child/admin/profile/${admin._id}`)}
                            className="px-4 py-1 rounded-lg bg-violet-600 text-white hover:bg-violet-700 shadow transition-transform hover:scale-105 font-semibold"
                          >
                            View
                          </button>
                        </td>
                      </motion.tr>
                    ))
                }
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
