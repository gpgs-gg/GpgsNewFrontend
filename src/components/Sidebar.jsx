import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";

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
import { FaCalendarCheck, FaMoneyBillWave, FaUserCircle, FaUsers } from "react-icons/fa";
import { useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
    const { user,setUser, loading, isAuthenticated } = useAuth();

  const location = useLocation();
  const clientTabsRef = useRef(null);
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
  useEffect(() => {
    if (!isClient || !clientTabsRef.current) return;

    const activeTab = clientTabsRef.current.querySelector(
      '[aria-current="page"]'
    );

    if (activeTab) {
      setTimeout(() => {
        activeTab.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }, 50);
    }
  }, [location.pathname, isClient]);
  const handleLogout = () => {
    logoutUser(undefined, {
      onSuccess: () => {
        localStorage.removeItem("user");

        setUser(null);

        queryClient.clear();
        navigate("/", {
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
      key: "client-rent-history",
      moduleKey: "rent_history",
      name: "Client Rent History",
      path: "/renthistory",
      icon: <ClipboardList size={22} />,
    },
    {
      key: "client-tickets",
      moduleKey: "client-tickets",
      name: "Client Tickets",
      path: "/client-tickets",
      icon: <ClipboardList size={22} />,
    },
    {
      key: "client-eb-history",
      moduleKey: "eb",
      name: "Electricity Bill History",
      path: "/eb-details-for-clients",
      icon: <ClipboardList size={22} />,
    },

    {
      key: "client-property-details",
      moduleKey: "property_details",
      name: "Property & Client Details",
      path: "/prop-perso-details",
      icon: <Building2 size={22} />,
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
  // =====================================================
  // CLIENT TOP TABS
  // =====================================================


  if (isClient) {
    return (
      <>
        {/* ==============================
          CLIENT HEADER
      ============================== */}
        <header className="fixed top-0 left-0 right-0 z-[100] bg-slate-800 text-white shadow-lg">
          <div
            className="
            h-16
            px-3 sm:px-5
            flex items-center
            justify-between
            gap-3
          "
          >
            {/* LOGO / BRAND */}
            <Link
              to="/"
              className="flex items-center gap-2 sm:gap-3 min-w-0"
            >
              {/* Logo */}
              <div
                className="
                w-9 h-9
                sm:w-10 sm:h-10
                rounded-lg
                bg-white
                text-slate-800
                flex items-center justify-center
                font-bold
                text-lg sm:text-xl
                shrink-0
              "
              >
                G
              </div>

              {/* Brand */}
              <div className="min-w-0">
                <p className="font-bold text-base sm:text-lg leading-tight truncate">
                  <span className="sm:hidden">GPGS</span>
                  <span className="hidden sm:inline">
                    Gopal's Paying Guest Services
                  </span>
                </p>
              </div>
            </Link>
  <div className="p-3 flex gap-5">
                <div className="flex items-center gap-3 cursor-pointer rounded-lg">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <FaUserCircle className="w-10 h-10 text-gray-400" />
                  )}

                  {!loading && isAuthenticated && user && (
                    <div className="overflow-hidden capitalize">
                      <p className="font-semibold truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500 ">
                        {user.role}
                      </p>
                    </div>
                  )}
                </div>
                    <button
              onClick={handleLogout}
              disabled={isPending}
              className="
              shrink-0
              flex items-center justify-center
              gap-2
              h-10
              px-3 sm:px-4
              rounded-lg
              text-sm font-medium
              hover:bg-slate-700
              active:bg-slate-700
              transition-all duration-200
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
            >
              <CiLogout size={22} />
            
              {/* Hide text on mobile */}
              <span className="hidden sm:inline">
                {isPending ? "Logging out..." : "Logout"}
              </span>
            </button>
              </div>
            {/* LOGOUT */}
        
          </div>
        </header>

        {/* ==============================
          CLIENT TABS
      ============================== */}
        <div
          className="
          fixed
          top-16
          left-0
          right-0
          z-[90]
          bg-white
          border-b border-gray-200
          shadow-sm
        "
        >
          <nav
            ref={clientTabsRef}
            className="
    flex items-center
    gap-1.5 sm:gap-2
    px-2 sm:px-3
    h-14

    overflow-x-auto
    overflow-y-hidden
    whitespace-nowrap

    touch-pan-x
    overscroll-x-contain
    
    scrollbar-thin
    scrollbar-track-gray-100
    scrollbar-thumb-slate-400
    hover:scrollbar-thumb-slate-500
  "
          >
            {clientMenuItems.map((item) => (
              <NavLink
                key={item.key}
                to={item.path}
                className={({ isActive }) =>
                  `
                flex items-center justify-center
                gap-1.5 sm:gap-2

                px-3 sm:px-4
                h-10

                rounded-lg
                shrink-0
                whitespace-nowrap

                text-sm
                font-medium

                transition-all
                duration-200

                active:scale-[0.97]

                ${isActive
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 active:bg-slate-100"
                  }
                `
                }
              >
                {/* ICON */}
                <span className="shrink-0 flex items-center">
                  {item.icon}
                </span>

                {/* TAB NAME */}
                <span className="text-md font-bold">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </>
    );
  }


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
            <Link to="/">
              <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xl">
                G
              </div>
            </Link>
          </div>

          <div
            className={`
              overflow-hidden whitespace-nowrap
              transition-all duration-300 ease-in-out

              ${expanded
                ? "opacity-100 ml-3 max-w-55"
                : "opacity-0 ml-0 max-w-0"
              }
            `}
          >
             <Link to="/">
            <h2 className="font-bold text-lg">Welcome to GPGS</h2>
                </Link>
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
                    ${isActive
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

                      ${expanded
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