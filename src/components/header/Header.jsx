import { useState } from "react";
import { Link } from "react-router-dom";
import { ThemeToggleButton } from "../common/ThemeToggleButton";
import NotificationDropdown from "./NotificationDropdown";
import UserDropdown from "./UserDropdown";
import PrithuLogo from "../../Assets/Logo/prithulogo.png"

const Header = ({ onClick, onToggle }) => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-5 dark:border-gray-800 dark:bg-gray-900 lg:border-b ">
  <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
    <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">




      {/* Logo */}
      <Link to="/" className="lg:hidden">
        <img className="dark:hidden" src={PrithuLogo} alt="Logo" />
        <img className="hidden dark:block" src="./images/logo/logo-dark.svg" alt="Logo" />
      </Link>

      {/* Application Menu Toggle */}
      <button
        onClick={toggleApplicationMenu}
        className="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
      >
        {/* dots icon */}
      </button>

      {/* Desktop Search */}
      <div className="hidden lg:block">
        <form>
          <div className="relative">
            <input
              type="text"
              placeholder="Search or type command..."
              className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
            />
          </div>
        </form>
      </div>
    </div>

    {/* Application Menu */}
    <div
      className={`${
        isApplicationMenuOpen ? "flex" : "hidden"
      } items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none transition-all duration-300`}
    >
      <div className="flex items-center gap-2 2xsm:gap-3">
        <ThemeToggleButton />
        <NotificationDropdown />
      </div>
      <UserDropdown />
    </div>
  </div>
</header>

  );
};

export default Header;
