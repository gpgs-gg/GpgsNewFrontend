import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Building2,
  Bed,
  UserPlus,
  Users,
  Ticket,
  Database,
  BrushCleaning,
  Wrench,
  CircleDollarSign,
  ShieldCheck,
  ClipboardList,
  LayoutPanelLeft,
  Shapes,
} from "lucide-react";

import { CiLogout } from "react-icons/ci";
import { BsBank } from "react-icons/bs";
import { FaCalendarCheck, FaMoneyBillWave, FaUsers } from "react-icons/fa";

import { useLogout } from "../auth/services";
import { useAuth } from "../context/authContext";
import { useAuthorization } from "../context/AuthorizationContext";

import { useQueryClient } from "@tanstack/react-query";
const SidebarMenuSkeleton = ({ expanded }) => {
  const skeletonItems = Array.from({ length: 8 });

  return (
    <div className="py-2">
      {skeletonItems.map((_, index) => (
        <div
          key={index}
          className="mx-2 my-1 flex items-center rounded-xl h-12"
        >
          {/* Icon skeleton */}
          <div className="w-16 flex justify-center shrink-0">
            <div className="w-6 h-6 rounded-md bg-slate-700 animate-pulse" />
          </div>

          {/* Text skeleton */}
          <div
            className={`
              overflow-hidden transition-all duration-300
              ${expanded ? "opacity-100 max-w-45" : "opacity-0 max-w-0"}
            `}
          >
            <div
              className="h-3.5 rounded-md bg-slate-700 animate-pulse"
              style={{
                width: `${90 + (index % 4) * 20}px`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
const Sidebar = ({ collapsed, mobileOpen, setMobileOpen }) => {
  const { user, setUser } = useAuth();

  const { authorizedModules, loading: authorizationLoading } =
    useAuthorization();

  const queryClient = useQueryClient();

  const [hovered, setHovered] = useState(false);

  const { mutate: logoutUser, isPending } = useLogout();

  const navigate = useNavigate();

  // =====================================================
  // ROLE
  // =====================================================

  const role = user?.role?.trim().toLowerCase();

  const isAdmin = role === "admin";
  const isEmployee = role === "employee";
  const isClient = role === "client";

  const hasFullAccess = isAdmin;
  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    logoutUser(undefined, {
      onSuccess: () => {
        localStorage.removeItem("user");

        setUser(null);

        queryClient.clear();

        navigate("/login", {
          replace: true,
        });
      },
    });
  };

  // =====================================================
  // SIDEBAR EXPANSION
  // =====================================================

  const expanded = !collapsed || hovered;

  // =====================================================
  // MODULE ICONS
  // =====================================================

  const MODULE_ICONS = {
    dashboard: <LayoutDashboard size={22} />,

    properties: <Building2 size={22} />,

    beds: <Bed size={22} />,

    available_beds: <Bed size={22} />,

    new_booking: <UserPlus size={22} />,

    clients: <Users size={22} />,

    full_final_settlement: <Users size={22} />,

    rent_not_received: <CircleDollarSign size={22} />,

    tickets: <Ticket size={22} />,

    module: <ShieldCheck size={22} />,

    permissions: <ShieldCheck size={22} />,

    bank_transactions: <BsBank size={22} />,

    pg_leads: <Users size={22} />,

    users: <Users size={22} />,

    dynamic_options: <Database size={22} />,

    house_keeping: <BrushCleaning size={22} />,

    maintenance: <Wrench size={22} />,

    employees: <FaUsers size={22} />,

    all_attendance: <FaCalendarCheck size={22} />,

    all_salary: <FaMoneyBillWave size={22} />,

    rent_history: <ClipboardList size={22} />,

    property_details: <Building2 size={22} />,

    personal_details: <Users size={22} />,
    sidebar_module: <LayoutPanelLeft size={22} />,
  };

const MENU_ORDER = [
  "dashboard",
  "properties",
  "beds",
  "available_beds",
  "new_booking",
  "clients",
  "rent_history",
  "rent_not_received",
  "full_final_settlement",
  "tickets",
  "pg_leads",
  "bank_transactions",
  "house_keeping",
  "maintenance",
  "employees",
  "all_attendance",
  "all_salary",
  "users",  
  "dynamic_options",
  "module",
  "permissions",
];

const dynamicMenuItems = authorizedModules
  .map((module) => ({
    key: module._id,
    moduleKey: module.key,
    name: module.name,
    path: module.path,
    icon: MODULE_ICONS[module.key] || <Shapes size={22} />,
  }))
  .sort((a, b) => {
    const aIndex = MENU_ORDER.indexOf(a.moduleKey);
    const bIndex = MENU_ORDER.indexOf(b.moduleKey);

    // Jo MENU_ORDER me nahi hai usko last me rakho
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;

    return aIndex - bIndex;
  });
  // =====================================================
  // CLIENT MENU
  // =====================================================

  const clientMenuItems = [
    {
      key: "client-dashboard",
      moduleKey: "dashboard",
      name: "Dashboard",
      path: "/",
      icon: <LayoutDashboard size={22} />,
    },

    {
      key: "client-rent-history",
      moduleKey: "rent_history",
      name: "Client Rent History",
      path: "/renthistory",
      icon: <ClipboardList size={22} />,
    },

    {
      key: "client-property-details",
      moduleKey: "property_details",
      name: "Property Details",
      path: "/d",
      icon: <Building2 size={22} />,
    },

    {
      key: "client-personal-details",
      moduleKey: "personal_details",
      name: "Personal Details",
      path: "/22",
      icon: <Users size={22} />,
    },
  ];

  // =====================================================
  // FINAL MENU
  // =====================================================

  let menuItems = [];

  if (isClient) {
    /*
     * CLIENT
     *
     * Client does not use employee permissions.
     * Client gets its own predefined menu.
     */
    menuItems = clientMenuItems;
  } else if (isAdmin || isEmployee) {
    /*
     * ADMIN + EMPLOYEE
     *
     * Both use the AuthorizationContext.
     *
     * Admin:
     *   authorizedModules = all active modules
     *
     * Employee:
     *   authorizedModules = only view:true modules
     */
    menuItems = dynamicMenuItems;
  }

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <>
      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`
          fixed top-0 left-0 z-[100]
          bg-slate-800 text-white
          h-screen overflow-hidden
          shadow-xl

          transition-all duration-300 ease-in-out

          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}

          md:translate-x-0

          ${expanded ? "md:w-64" : "md:w-20"}

          w-64
        `}
      >
        {/* =================================================
            LOGO
        ================================================= */}

        <div className="h-16 flex items-center px-5 border-b border-slate-700 theme-btn">
          <div className="w-10 flex justify-center items-center shrink-0">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xl">
              G
            </div>
          </div>

          <div
            className={`
              overflow-hidden whitespace-nowrap
              transition-all duration-300 ease-in-out

              ${
                expanded
                  ? "opacity-100 ml-3 max-w-55"
                  : "opacity-0 ml-0 max-w-0"
              }
            `}
          >
            <h2 className="font-bold text-lg">Welcome to GPGS</h2>
          </div>
        </div>

        {/* =================================================
            MENU + LOGOUT
        ================================================= */}

        <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
          {/* =================================================
              SCROLLABLE MENU
          ================================================= */}

          <div className="flex-1 overflow-y-auto scrollbar-hide py-3">
            {/* =================================================
                AUTHORIZATION LOADING
            ================================================= */}

            {authorizationLoading && (isAdmin || isEmployee) ? (
              <SidebarMenuSkeleton expanded={expanded} />
            ) : (
              menuItems.map((item) => (
                <NavLink
                  key={item.key}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `mx-2 my-1 flex items-center rounded-xl h-12 transition-all duration-300
                    ${
                      isActive
                        ? "bg-white text-black shadow-md"
                        : "hover:bg-slate-700"
                    }`
                  }
                >
                  {/* ICON */}

                  <div className="w-16 flex justify-center shrink-0">
                    {item.icon}
                  </div>

                  {/* NAME */}

                  <span
                    className={`
                      overflow-hidden whitespace-nowrap
                      transition-all duration-300 ease-in-out

                      ${
                        expanded
                          ? "opacity-100 translate-x-0 max-w-45"
                          : "opacity-0 -translate-x-4 max-w-0"
                      }
                    `}
                  >
                    {item.name}
                  </span>
                </NavLink>
              ))
            )}
          </div>

          {/* =================================================
              FIXED LOGOUT
          ================================================= */}

          <div className="mt-auto border-t border-slate-700 p-3 bg-slate-800 shrink-0">
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="w-full flex items-center rounded-xl h-12 hover:bg-slate-700 transition-all"
            >
              <div className="w-16 flex justify-center shrink-0">
                <CiLogout size={22} />
              </div>

              <span
                className={`
                  overflow-hidden whitespace-nowrap
                  transition-all duration-300

                  ${expanded ? "opacity-100 max-w-40" : "opacity-0 max-w-0"}
                `}
              >
                {isPending ? "Logging out..." : "Logout"}
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;