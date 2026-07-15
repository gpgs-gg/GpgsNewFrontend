import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useLogout } from "../auth/services";
import { CiLogout } from "react-icons/ci";
import { IoIosNotificationsOutline } from "react-icons/io";
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
  const notificationCount = 2
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

        <h1 className="ml-4 text-lg md:text-2xl font-semibold">
          Gopal's Paying Guest Services
        </h1>
      </div>

      {/* Right Side */}
      {/* Right Side */}
      <div className="flex justify-center items-center gap-10">
        <div className="relative cursor-pointer">
          <IoIosNotificationsOutline className="text-2xl" />

          {notificationCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </div>
        <div className="p-3">
          <div className="flex items-center gap-3 cursor-pointer rounded-lg ">
            {/* Avatar */}
            <img
              src="https://i.pravatar.cc/150?img=12"
              alt="User"
              className="w-10 h-10 rounded-full object-cover"
            />

            {/* Name */}
            {true && (
              <div className="overflow-hidden">
                <p className="font-semibold  truncate">
                  Abhishek Gautam
                </p>
                <p className="text-xs text-slate-400">
                  Administrator
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;