// PermissionsCard.jsx
import { FaCheckCircle, FaTimesCircle, FaEdit } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";


const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", duration: 0.55, bounce: 0.17 } },
};

export default function PermissionsCard({ profile,role }) {
  const navigate = useNavigate();


  const handleEdit = () => {
    navigate(`/settings/childadmin/permission/s${profile._id}`);
  };

  return (
    <motion.div
      variants={fadeLeft}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-xl border border-gray-200 p-6 shadow-md relative"
    >
      <h3 className="text-lg font-semibold mb-3">Permissions</h3>

      {/* Edit Button only for Admin */}
      {role === "Admin" && (
        <button
          onClick={handleEdit}
          className="absolute top-4 right-4 flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          <FaEdit /> Edit
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Granted Permissions */}
        <div>
          <h4 className="font-semibold text-green-600 mb-2">Granted Permissions</h4>
          <div className="flex flex-wrap gap-2">
            {profile.grantedPermissions.length ? (
              profile.grantedPermissions.map((perm) => (
                <span
                  key={perm}
                  className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs flex items-center gap-1"
                >
                  <FaCheckCircle className="w-3 h-3" /> {perm}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">None</span>
            )}
          </div>
        </div>

        {/* Ungranted Permissions */}
        <div>
          <h4 className="font-semibold text-red-600 mb-2">Ungranted Permissions</h4>
          <div className="flex flex-wrap gap-2">
            {profile.ungrantedPermissions.length ? (
              profile.ungrantedPermissions.map((perm) => (
                <span
                  key={perm}
                  className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs flex items-center gap-1"
                >
                  <FaTimesCircle className="w-3 h-3" /> {perm}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">None</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
