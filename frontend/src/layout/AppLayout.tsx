/** Main dashboard layout wrapping sidebar, header, and page content via Outlet. */

import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from '@tanstack/react-router';
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { WifiOff } from "lucide-react";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const isOnline = useOnlineStatus();

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        {!isOnline && (
          <div className="flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-950 px-4 py-2 text-sm text-amber-800 dark:text-amber-200 border-b border-amber-200 dark:border-amber-800">
            <WifiOff className="h-4 w-4" />
            You are offline. Some features may be unavailable.
          </div>
        )}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
