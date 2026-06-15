import { Menu } from "lucide-react";

const Header = ({
  collapsed,
  setCollapsed,
  setMobileOpen,
}) => {
  return (
    <header
      className={`
        fixed top-0 right-0 h-16 bg-white shadow-md z-30
        flex items-center px-4 transition-all duration-300
        left-0
        ${collapsed ? "md:left-20" : "md:left-64"}
      `}
    >
      {/* Mobile Menu */}
{/* Mobile Menu */}
<button
  onClick={() => setMobileOpen(true)}
  className="p-2 rounded-lg hover:bg-gray-100 md:hidden"
>
  <Menu size={24} />
</button>

{/* Desktop Collapse */}
<button
  onClick={() => setCollapsed((prev) => !prev)}
  className="p-2 rounded-lg hover:bg-gray-100 hidden md:block"
>
  <Menu size={24} />
</button>

      <h1 className="ml-4 text-xl font-semibold">
        Gopal's Paying Guest Services
      </h1>
    </header>
  );
};

export default Header;