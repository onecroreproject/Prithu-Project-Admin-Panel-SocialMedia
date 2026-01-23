import { useState } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { Link, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/adminAuthContext";
import { useAdminProfile } from "../../context/adminProfileContext";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout, admin } = useAdminAuth();
  const navigate = useNavigate();
  const { profile } = useAdminProfile();

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  async function handleSignOut() {
    try {
      await logout();
      closeDropdown();
      navigate("/signin");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  return (
    <div className="relative">
      {/* Avatar + Dropdown toggle */}
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11 bg-gray-300 flex items-center justify-center">
          {admin?.userName ? (
            <img
              className="object-cover w-full h-full"
              src={profile?.profileAvatar}
              alt={admin.userName}
            />
          ) : (
            "?"
          )}
        </span>

        <span className="block mr-1 font-medium text-theme-sm">
          {profile?.userName || "Not Available"}
        </span>
        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {profile?.userName || "Not Available"}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {profile?.userEmail || "Not Available"}
          </span>
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          {/* ✅ Edit Profile → Navigate to /profile */}
          <li>
            <DropdownItem
              onItemClick={() => {
                closeDropdown();
                navigate("/settings/admin/profile/page");
              }}
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
            >
              Edit profile
            </DropdownItem>
          </li>

          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag={Link}
              to="/settings"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
            >
              Account settings
            </DropdownItem>
          </li>
        </ul>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 w-full text-left"
        >
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}
