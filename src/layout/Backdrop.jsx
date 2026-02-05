import { useSidebar } from "../context/SidebarContext";

const Backdrop = () => {
  const { isMobileOpen, setIsMobileOpen } = useSidebar();

  if (!isMobileOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 lg:hidden bg-black/40 backdrop-blur-sm"
      onClick={() => setIsMobileOpen(false)}
    />
  );
};

export default Backdrop;
