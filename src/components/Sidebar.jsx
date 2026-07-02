import { NavLink } from "react-router-dom";
const Sidebar = ({
  collapsed,
  mobileOpen,
  setMobileOpen,
}) => {

  const menuItems = [
    { name: "Dashboard", path: "/" },
    { name: "Properties", path: "/properties" },
    { name: "Beds", path: "/beds" },
    { name: "Available Beds", path: "/available-beds" },
    { name: "New Booking", path: "/new-bookings" },
    { name: "Clients", path: "/clients" },
    // { name: "Rent Ledger", path: "/rent-ledger" },
    // { name: "Expenses", path: "/expenses" },
    // { name: "Complaints", path: "/complaints" },
    // { name: "Staff", path: "/staff" },
    // { name: "Inventory", path: "/inventory" },
    // { name: "Tenants", path: "/tenants" },
    // { name: "Rent Ledger", path: "/rent-ledger" },
    // { name: "Expenses", path: "/expenses" },
    // { name: "Complaints", path: "/complaints" },
    // { name: "Staff", path: "/staff" },
    // { name: "Inventory", path: "/inventory" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
    fixed top-0 left-0 z-50
    bg-gray-700 text-white
    h-screen
    transition-all duration-300

    ${mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
          }

    md:translate-x-0
    ${collapsed ? "md:w-20" : "md:w-64"}

    w-64
  `}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-center bg-linear-to-r from-slate-800 via-slate-700 to-slate-900 border-b border-slate-600 shrink-0">
          {!collapsed ? (
            <h2 className="text-xl font-bold text-white tracking-wide">
              Welcome to ( GPGS )
            </h2>
          ) : (
            <h2 className="text-2xl font-bold text-white">G</h2>
          )}
        </div>

        {/* Scrollable Menu */}
        <div className="h-[calc(100vh-64px)] overflow-y-auto scrollbar-hide">
          <ul className="p-4 space-y-2">
            {menuItems.map((item, index) => (
              <li key={`${item.path}-${index}`}>
                <NavLink
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg text-lg px-4 py-3 transition-all ${isActive
                      ? "bg-gray-100 text-black font-semibold"
                      : "hover:bg-gray-600"
                    }`
                  }
                >
                  {collapsed ? item.name.charAt(0) : item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar