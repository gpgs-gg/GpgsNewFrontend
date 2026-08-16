// import { NavLink } from "react-router-dom";
// const Sidebar = ({
//   collapsed,
//   mobileOpen,
//   setMobileOpen,
// }) => {

//   const menuItems = [
//     { name: "Dashboard", path: "/" },
//     { name: "Properties", path: "/properties" },
//     { name: "Beds", path: "/beds" },
//     { name: "Available Beds", path: "/available-beds" },
//     { name: "New Booking", path: "/new-bookings" },
//     { name: "Clients", path: "/clients" },
//     // { name: "Rent Ledger", path: "/rent-ledger" },
//     // { name: "Expenses", path: "/expenses" },
//     // { name: "Complaints", path: "/complaints" },
//     // { name: "Staff", path: "/staff" },
//     // { name: "Inventory", path: "/inventory" },
//     // { name: "Tenants", path: "/tenants" },
//     // { name: "Rent Ledger", path: "/rent-ledger" },
//     // { name: "Expenses", path: "/expenses" },
//     // { name: "Complaints", path: "/complaints" },
//     // { name: "Staff", path: "/staff" },
//     // { name: "Inventory", path: "/inventory" },
//   ];

//   return (
//     <>
//       {/* Mobile Overlay */}
//       {mobileOpen && (
//         <div
//           className="fixed inset-0 bg-black/30 z-40 md:hidden"
//           onClick={() => setMobileOpen(false)}
//         />
//       )}

//       <aside
//         className={`
//     fixed top-0 left-0 z-50
//     bg-gray-700 text-white
//     h-screen
//     transition-all duration-300

//     ${mobileOpen
//             ? "translate-x-0"
//             : "-translate-x-full"
//           }

//     md:translate-x-0
//     ${collapsed ? "md:w-20" : "md:w-64"}

//     w-64
//   `}
//       >
//         {/* Header */}
//         <div className="h-16 flex items-center justify-center bg-linear-to-r from-slate-800 via-slate-700 to-slate-900 border-b border-slate-600 shrink-0">
//           {!collapsed ? (
//             <h2 className="text-xl font-bold text-white tracking-wide">
//               Welcome to ( GPGS )
//             </h2>
//           ) : (
//             <h2 className="text-2xl font-bold text-white">G</h2>
//           )}
//         </div>

//         {/* Scrollable Menu */}
//         <div className="h-[calc(100vh-64px)] overflow-y-auto scrollbar-hide">
//           <ul className="p-4 space-y-2">
//             {menuItems.map((item, index) => (
//               <li key={`${item.path}-${index}`}>
//                 <NavLink
//                   to={item.path}
//                   onClick={() => setMobileOpen(false)}
//                   className={({ isActive }) =>
//                     `block rounded-lg text-lg px-4 py-3 transition-all ${isActive
//                       ? "bg-gray-100 text-black font-semibold"
//                       : "hover:bg-gray-600"
//                     }`
//                   }
//                 >
//                   {collapsed ? item.name.charAt(0) : item.name}
//                 </NavLink>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </aside>
//     </>
//   );
// };

// export default Sidebar

import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Bed,
  UserPlus,
  Users,
  Ticket,
  Wallet,
  ClipboardList,
  UserCog,
  Boxes,
  Database,
  BrushCleaning,
  Wrench,
  CircleDollarSign,
} from "lucide-react";
import { CiLogout } from "react-icons/ci";
import { useLogout } from "../auth/services";
import { BsBank } from "react-icons/bs";
import { useAuth } from "../context/authContext";
import { useQueryClient } from "@tanstack/react-query";
import { FaCalendarCheck, FaMoneyBillWave, FaUsers } from "react-icons/fa";
const Sidebar = ({ collapsed, mobileOpen, setMobileOpen }) => {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const [hovered, setHovered] = useState(false);
  const { mutate: logoutUser, isPending } = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser(undefined, {
      onSuccess: () => {
        localStorage.removeItem("user");
        setUser(null);
        queryClient.clear();
        navigate("/login", { replace: true });
      },
    });
  };
  const expanded = !collapsed || hovered;
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const menuItems = isAdmin
    ? [
      { name: "Dashboard", path: "/", icon: <LayoutDashboard size={22} /> },
      { name: "Properties", path: "/properties", icon: <Building2 size={22} /> },
      { name: "Beds", path: "/beds", icon: <Bed size={22} /> },
      { name: "Available Beds", path: "/available-beds", icon: <Bed size={22} /> },
      { name: "New Booking", path: "/new-bookings", icon: <UserPlus size={22} /> },
      { name: "Clients", path: "/clients", icon: <Users size={22} /> },
      { name: "F & F Settlement", path: "/full-&-final-settlement", icon: <Users size={22} /> },
      { name: "R N R", path: "/rent-not-received", icon: <CircleDollarSign  size={22} /> },
      // { name: "Rent Ledger", path: "/rent-ledger", icon: <Wallet size={22} /> },
      { name: "Tickets", path: "/tickets", icon: <Ticket size={22} /> },
      { name: "Bank Transactions", path: "/bank-transactions", icon: <BsBank size={22} /> },
      { name: "PG Leads", path: "/leads", icon: <Users size={22} /> },
      { name: "Users", path: "/users", icon: <Users size={22} /> },
      { name: "Dynamic Options", path: "/options", icon: <Database size={22} /> },
      { name: "HouseKeeping", path: "/house-keeping", icon: <BrushCleaning size={22} /> },
      { name: "Maintenance", path: "/maintenance", icon: <Wrench size={22} /> },
      {
          name: "Employees",
          path: "/employees",
          icon: <FaUsers size={22} />,
        },
      
        {
        name: " All Attendance",
          path: "/attendance/all",
          icon: <FaCalendarCheck size={22} />,
        },
        {
          name: "All Salary",
          path: "/salary/all",
          icon: <FaMoneyBillWave size={22} />,
        },

    ]
    : [
      { name: "Dashboard", path: "/", icon: <LayoutDashboard size={22} /> },
      {
        name: "Client Rent History",
        path: "/renthistory",
        icon: <ClipboardList size={22} />,
      },
      { name: "Property Details", path: "/d", icon: <Users size={22} /> },
      { name: "Personal Details", path: "/22", icon: <Database size={22} /> },
    ];

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

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
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-slate-700 theme-btn ">
          <div className="w-10 flex justify-center items-center shrink-0">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xl">
              G
            </div>
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
            <h2 className="font-bold text-lg">Welcome to GPGS</h2>
          </div>
        </div>

        {/* Menu */}
        <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
          {/* Scrollable Menu */}
          <div className="flex-1 overflow-y-auto scrollbar-hide py-3">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
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
                <div className="w-16 flex justify-center shrink-0">
                  {item.icon}
                </div>

                <span
                  className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out
          ${expanded
                      ? "opacity-100 translate-x-0 max-w-45"
                      : "opacity-0 -translate-x-4 max-w-0"
                    }`}
                >
                  {item.name}
                </span>
              </NavLink>
            ))}
          </div>

          {/* Fixed Logout */}
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
                className={`overflow-hidden whitespace-nowrap transition-all duration-300
        ${expanded
                    ? "opacity-100 max-w-40"
                    : "opacity-0 max-w-0"
                  }`}
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