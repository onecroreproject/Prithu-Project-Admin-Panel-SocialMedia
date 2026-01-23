import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import { FaEye, FaBan } from "react-icons/fa";
import CreatorDetailModal from "../../../components/Pop-UP/creatorDetailPopUp"; 
import { fetchCreators, blockCreator } from "../../../Services/creatorServices/creatorServices";
import { motion, AnimatePresence } from "framer-motion";

export default function CreatorTable() {
  const queryClient = useQueryClient();

  // ✅ Fetch creators
  const { data: creators = [], isLoading, isError } = useQuery({
    queryKey: ["creators"],
    queryFn: fetchCreators,
    staleTime: 1000 * 60 * 5,
  });

  // ✅ Block mutation
  const blockMutation = useMutation({
    mutationFn: blockCreator,
    onSuccess: () => {
      queryClient.invalidateQueries(["creators"]);
    },
  });

  const [selectedCreatorId, setSelectedCreatorId] = useState(null);

  if (isLoading) {
    return <p className="text-center py-10">Loading...</p>;
  }

  if (isError) {
    return <p className="text-center text-red-500 py-10">Failed to load creators</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Creator
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Trending Rank
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Feed Status
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Registration Date
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Subscription Status
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Online Status
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Last Active
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            <AnimatePresence>
              {creators.map((creator) => (
                <motion.tr
                  key={creator._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {/* Creator Info */}
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="w-10 h-10 overflow-hidden rounded-full"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        <img
                          width={40}
                          height={40}
                          src={creator.profileAvatar}
                          alt={creator.userName}
                        />
                      </motion.div>
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {creator.userName}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {creator.category}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell />

                  {/* {Feed Status} */}
                  <TableCell>
                    <div>
                         <div className="px-5 py-3  font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                             Images({creator.imageCount})
                        </div>
                        <div className="px-5 py-3  font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                             Videos ({creator.videoCount})
                        </div>
                    </div>
                  </TableCell>

                  {/* Registration Date */}
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {new Date(creator.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>

                  {/* Subscription Status */}
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={creator.subscriptionActive ? "success" : "warning"}
                    >
                      {creator.subscriptionActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>

                  {/* Online Status */}
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {creator.isActive ? "Online" : "Offline"}
                  </TableCell>

                  {/* Last Active */}
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {creator.lastActiveAt
                      ? new Date(creator.lastActiveAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Never Active"}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <div className="flex gap-2">
                      {/* 👁️ View */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        title="View"
                        onClick={() => setSelectedCreatorId(creator.creatorId)}
                      >
                        <FaEye className="w-5 h-5 text-gray-500" />
                      </motion.button>
                      {/* 🚫 Block */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        title="Block"
                        onClick={() => blockMutation.mutate(creator._id)}
                        disabled={blockMutation.isLoading}
                      >
                        <FaBan className="w-5 h-5 text-red-500" />
                      </motion.button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* Modal opens when creator is selected */}
      {selectedCreatorId && (
        <CreatorDetailModal
          creatorId={selectedCreatorId}
          onClose={() => setSelectedCreatorId(null)}
        />
      )}
    </div>
  );
}
