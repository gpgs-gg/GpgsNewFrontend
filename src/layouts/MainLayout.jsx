import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";
import { useCurrentUser } from "../auth/services";

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: currentUser, isLoading } = useCurrentUser();

  const isClient = currentUser?.user?.role?.toLowerCase() === "client";

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div
        className={`
          flex-1
          min-w-0
          transition-all duration-300
          ${isClient
            ? "ml-0"
            : collapsed
              ? "md:ml-20"
              : "md:ml-64"
          }
        `}
      >
        <Header
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          setMobileOpen={setMobileOpen}
        />
        <main
          className={`${isClient ? "mt-28" : "mt-16"
            } p-4 md:p-6 overflow-x-hidden min-w-0`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;