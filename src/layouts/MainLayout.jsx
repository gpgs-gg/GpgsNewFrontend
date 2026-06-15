import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
 const [sidebarOpen, setSidebarOpen] = useState(false);
const [collapsed, setCollapsed] = useState(false); // Desktop
const [mobileOpen, setMobileOpen] = useState(false); // Mobile

  return (
  <div className="flex">
<Sidebar
  collapsed={collapsed}
  mobileOpen={mobileOpen}
  setMobileOpen={setMobileOpen}
/>
<div
  className={`
    w-full
    transition-all duration-300
    ml-0
  ${collapsed ? "md:ml-20" : "md:ml-64"}
  `}
>


<Header
  collapsed={collapsed}
  setCollapsed={setCollapsed}
  setMobileOpen={setMobileOpen}
/>

    <main className="mt-16 p-6 overflow-auto">
      <Outlet />
    </main>
  </div>
</div>
  );
};

export default MainLayout;