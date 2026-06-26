import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useLogout } from "../auth/services";
import { CiLogout } from "react-icons/ci";

const Header = ({
  collapsed,
  setCollapsed,
  setMobileOpen,
}) => {

const navigate = useNavigate();
const { mutate: logoutUser, isPending } = useLogout();

const handleLogout = () => {
  logoutUser(undefined, {
    onSuccess: () => {
      navigate("/login", { replace: true });
    },
  });
};

  return (
    <header
      className={`
        fixed top-0 right-0 h-16 bg-white shadow-md z-30
        flex items-center justify-between px-4 transition-all duration-300
        left-0
        ${collapsed ? "md:left-20" : "md:left-64"}
      `}
    >
      {/* Left Side */}
      <div className="flex items-center">
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

        <h1 className="ml-4 text-lg md:text-xl font-semibold">
          Gopal's Paying Guest Services
        </h1>
      </div>

      {/* Right Side */}
     <button
  onClick={handleLogout}
  disabled={isPending}
  className="font-bold flex gap-2 justify-center items-center"
>
  <CiLogout/>
  {isPending ? "Logging out..." : "Logout"}
</button>
    </header>
  );
};

export default Header;