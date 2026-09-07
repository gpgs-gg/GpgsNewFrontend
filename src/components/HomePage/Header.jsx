import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

import { Menu, X, LogOut, UserRound, ChevronDown } from "lucide-react";

import { useAuth } from "../../context/authContext";
import { useLogout } from "../../auth/services";
import { useQueryClient } from "@tanstack/react-query";
import gpgsLogo from "../../logo/GPGS-CircleLogo.png";
import gpgsWhiteLogo from "../../logo/GPGS-WhiteLogo.png";
const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const location = useLocation();

  const { user, isAuthenticated, setUser } = useAuth();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: logoutUser, isPending } = useLogout();

  const isHomePage = location.pathname === "/";

  // ============================================================
  // AOS
  // ============================================================

  useEffect(() => {
    AOS.init({
      duration: 500,
      once: true,
      easing: "ease-out-cubic",
    });

    AOS.refresh();
  }, []);

  // ============================================================
  // Scroll Detection
  // ============================================================

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const sectionIds = navigation.map((item) => item.section);

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleSections.length > 0) {
          setActiveSection(visibleSections[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: "-100px 0px -45% 0px",
        threshold: [0.1, 0.25, 0.5, 0.75],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, []);
  // ============================================================
  // Close Mobile Menu on Desktop
  // ============================================================

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // ============================================================
  // Close Menu When Route Changes
  // ============================================================

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  // ============================================================
  // Logout
  // ============================================================

  const handleLogout = () => {
    logoutUser(undefined, {
      onSuccess: () => {
        localStorage.removeItem("user");

        setUser(null);

        queryClient.clear();

        setMenuOpen(false);
        setAccountOpen(false);

        navigate("/", {
          replace: true,
        });
      },
    });
  };

  // ============================================================
  // User Name
  // ============================================================

  const userName =
    user?.name ||
    user?.Name ||
    user?.fullName ||
    user?.username ||
    user?.loginId ||
    "User";

  const userRole =
    user?.role || user?.Role || user?.userType || user?.userRole || "User";

  const profileImage =
    user?.profileImage ||
    user?.profilePic ||
    user?.avatar ||
    user?.image ||
    null;

  // ============================================================
  // User Initials
  // ============================================================

  const getInitials = (name = "") => {
    if (!name) return "U";

    return name
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // ============================================================
  // Navigation
  // ============================================================

  const navigation = [
    {
      label: "Home",
      section: "home",
    },
    {
      label: "Services",
      section: "services",
    },
    {
      label: "About",
      section: "about",
    },
    {
      label: "Locations",
      section: "locations",
    },
    {
      label: "Contact Us",
      section: "contact",
    },
  ];

  // ============================================================
  // Theme
  // ============================================================

  const transparentHeader = isHomePage && !scrolled && !menuOpen;

  const navTextClass = transparentHeader
    ? "text-white/90 hover:text-white"
    : "text-[#111d38] hover:text-[#9b6845]";

  const scrollToSection = (sectionId) => {
    setMenuOpen(false);
    setAccountOpen(false);

    const section = document.getElementById(sectionId);

    if (section) {
      const headerOffset = 76;

      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };
  // ============================================================
  // Navigation Link
  // ============================================================

  const renderNavigationLink = (item, mobile = false) => {
    const handleClick = () => {
      scrollToSection(item.section);
    };

    if (mobile) {
      return (
        <button
          key={item.label}
          type="button"
          onClick={handleClick}
          className="
          group
          relative
          flex items-center justify-between
          w-full
          px-4
          py-3.5
          rounded-xl
          text-[15px]
          text-left
          transition-all duration-200
          text-[#17243f]/80
          hover:bg-[#f5f2ec]
        "
        >
          <span>{item.label}</span>
        </button>
      );
    }

    return (
      <button
        key={item.label}
        type="button"
        onClick={handleClick}
        className={`
    relative
    h-[76px]
    flex items-center
    px-3
    text-[15px]
    font-medium
    tracking-[-0.01em]
    transition-all duration-300
    bg-transparent
    border-0
    cursor-pointer

    ${
      activeSection === item.section
        ? transparentHeader
          ? "text-white"
          : "text-[#9b6845]"
        : navTextClass
    }
  `}
      >
        <span>{item.label}</span>

        {activeSection === item.section && (
          <span
            className={`
        absolute
        left-3
        right-3
        bottom-[-1px]
        h-[2px]
        rounded-full

        ${transparentHeader ? "bg-white" : "bg-[#a86f4c]"}
      `}
          />
        )}
      </button>
    );
  };

  // ============================================================
  // Header
  // ============================================================

  return (
    <>
      <header
        className={`
          fixed
          top-0
          left-0
          right-0
          z-50

          transition-all
          duration-500

          ${
            transparentHeader
              ? `
                bg-transparent
                border-transparent
              `
              : `
                bg-[#f7f4ee]/95
                border-b
                border-[#e5e0d6]
                backdrop-blur-xl
                shadow-[0_4px_25px_rgba(0,0,0,0.04)]
              `
          }
        `}
      >
        <div className="w-full px-5 sm:px-8 lg:px-12 xl:px-[68px]">
          <div className="h-[76px] flex items-center justify-between">
            {/* ==================================================
                LOGO
            ================================================== */}

            <Link
              to="/"
              onClick={() => {
                setMenuOpen(false);
                setAccountOpen(false);

                // If already on home page, scroll to the top
                if (location.pathname === "/") {
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }
              }}
              className="
    flex
    items-center
    flex-shrink-0
    w-[170px]
    sm:w-[190px]
    cursor-pointer
  "
            >
              <img
                src={transparentHeader ? gpgsLogo : gpgsLogo}
                alt="GPGS Logo"
                className="
      md:h-[52px]
      w-auto
      object-contain
      transition-all
      duration-500
    "
              />
            </Link>

            {/* ==================================================
                DESKTOP NAVIGATION
            ================================================== */}

            <nav className="hidden md:flex items-center justify-center flex-1">
              <div className="flex items-center gap-1 lg:gap-3">
                {navigation.map((item) => renderNavigationLink(item))}
              </div>
            </nav>

            {/* ==================================================
    DESKTOP ACCOUNT AREA
================================================== */}

            <div
              className="
    hidden
    md:flex
    items-center
    justify-end
    gap-2.5
    w-[270px]
  "
            >
              {isAuthenticated && user ? (
                <div className="relative">
                  {/* ================= ACCOUNT BUTTON ================= */}

                  <button
                    type="button"
                    onClick={() => setAccountOpen((prev) => !prev)}
                    className={`
          group
          h-[52px]
          px-3.5
          rounded-full
          flex
          items-center
          gap-2.5
          transition-all
          duration-300

          ${
            transparentHeader
              ? `
                bg-white/10
                border
                border-white/20
                text-white
                backdrop-blur-md
                hover:bg-white/20
              `
              : `
                bg-[#eeebe4]
                text-[#14223f]
                hover:bg-[#e5e0d6]
              `
          }
        `}
                  >
                    {/* ================= PROFILE IMAGE ================= */}

                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={userName}
                        className="
              w-9
              h-9
              rounded-full
              object-cover
              flex-shrink-0
            "
                      />
                    ) : (
                      <div
                        className={`
              w-9
              h-9
              rounded-full
              flex
              items-center
              justify-center
              text-[11px]
              font-bold
              flex-shrink-0

              ${
                transparentHeader
                  ? "bg-white text-[#14223f]"
                  : "bg-[#14223f] text-white"
              }
            `}
                      >
                        {getInitials(userName)}
                      </div>
                    )}

                    {/* ================= NAME + ROLE ================= */}

                    <div
                      className="
            hidden
            lg:flex
            flex-col
            text-left
            leading-tight
            max-w-[125px]
          "
                    >
                      <p
                        className={`
              text-[13px]
              font-semibold
              truncate

              ${transparentHeader ? "text-white" : "text-[#14223f]"}
            `}
                      >
                        {userName}
                      </p>

                      <p
                        className={`
              text-[10px]
              capitalize
              tracking-wide
              truncate

              ${transparentHeader ? "text-white/60" : "text-gray-500"}
            `}
                      >
                        {userRole}
                      </p>
                    </div>

                    {/* ================= ARROW ================= */}

                    <ChevronDown
                      size={15}
                      className={`
            transition-transform
            duration-300
            flex-shrink-0

            ${accountOpen ? "rotate-180" : ""}
          `}
                    />
                  </button>

                  {/* ================= ACCOUNT DROPDOWN ================= */}

                  {accountOpen && (
                    <div
                      data-aos="fade-down"
                      data-aos-duration="200"
                      className="
            absolute
            right-0
            top-[62px]
            w-[250px]
            rounded-2xl
            border
            border-[#e5e0d6]
            bg-white
            p-2
            shadow-[0_15px_45px_rgba(0,0,0,0.12)]
          "
                    >
                      {/* ================= PROFILE ================= */}

                      <div className="flex items-center gap-3 px-3 py-3">
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt={userName}
                            className="
                  w-11
                  h-11
                  rounded-full
                  object-cover
                  flex-shrink-0
                "
                          />
                        ) : (
                          <div
                            className="
                  w-11
                  h-11
                  rounded-full
                  bg-[#14223f]
                  flex
                  items-center
                  justify-center
                  text-white
                  text-xs
                  font-bold
                  flex-shrink-0
                "
                          >
                            {getInitials(userName)}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p
                            className="
                  text-sm
                  font-semibold
                  text-[#14223f]
                  truncate
                "
                          >
                            {userName}
                          </p>

                          <p
                            className="
                  mt-0.5
                  text-xs
                  text-gray-500
                  capitalize
                  truncate
                "
                          >
                            {userRole}
                          </p>
                        </div>
                      </div>

                      <div className="h-px bg-[#eee9e0]" />

                      {/* ================= MY ACCOUNT ================= */}

                      <Link
                        to="/account"
                        onClick={() => setAccountOpen(false)}
                        className="
              flex
              items-center
              gap-3
              w-full
              px-3
              py-3
              rounded-xl
              text-sm
              font-medium
              text-[#14223f]
              hover:bg-[#f5f2ec]
              transition-colors
            "
                      >
                        <UserRound size={17} />

                        <span>My Account</span>
                      </Link>

                      {/* ================= LOGOUT ================= */}

                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isPending}
                        className="
    flex
    items-center
    gap-3
    w-full
    px-3
    py-3
    rounded-xl
    text-sm
    font-medium
    text-red-600
    hover:bg-red-50
    transition-colors
    disabled:opacity-50
    disabled:cursor-not-allowed
  "
                      >
                        <LogOut size={17} />

                        <span>{isPending ? "Logging out..." : "Logout"}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* ================= LOGIN ================= */}

                  <Link
                    to="/login"
                    className={`
          h-[50px]
          px-6
          rounded-full
          flex
          items-center
          justify-center
          text-sm
          font-semibold
          transition-all
          duration-300

          ${
            transparentHeader
              ? `
                border
                border-white/30
                bg-white/10
                text-white
                backdrop-blur-md
                hover:bg-white/20
              `
              : `
                border
                border-[#d8d1c6]
                bg-transparent
                text-[#14223f]
                hover:bg-[#eeebe4]
              `
          }
        `}
                  >
                    Login
                  </Link>

                  {/* ================= GET STARTED ================= */}

                  <Link
                    to="/register"
                    className="
          h-[50px]
          px-6
          rounded-full
          flex
          items-center
          justify-center
          bg-[#14223f]
          text-white
          text-sm
          font-semibold
          shadow-lg
          transition-all
          duration-300
          hover:bg-[#1d3155]
          hover:-translate-y-[1px]
          hover:shadow-xl
        "
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* ==================================================
                MOBILE RIGHT SIDE
            ================================================== */}

            <div className="md:hidden flex items-center gap-2">
              {/* Mobile User Avatar */}

              {isAuthenticated && user && (
                <Link
                  to="/account"
                  className={`
                    w-10
                    h-10
                    rounded-full
                    flex
                    items-center
                    justify-center
                    text-xs
                    font-bold
                    transition-all

                    ${
                      transparentHeader
                        ? "bg-white text-[#14223f]"
                        : "bg-[#14223f] text-white"
                    }
                  `}
                >
                  {getInitials(userName)}
                </Link>
              )}

              {/* Menu */}

              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className={`
                  w-11
                  h-11
                  flex
                  items-center
                  justify-center
                  rounded-full
                  transition-all
                  duration-300

                  ${
                    transparentHeader
                      ? "bg-white/10 border border-white/20 text-white backdrop-blur-md"
                      : "bg-[#14223f] text-white"
                  }
                `}
                aria-label="Toggle Menu"
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X size={21} /> : <Menu size={21} />}
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            MOBILE MENU
        ======================================================== */}

        {menuOpen && (
          <div
            data-aos="fade-down"
            data-aos-duration="250"
            className="
              md:hidden
              bg-[#f7f4ee]
              border-t
              border-[#e5e0d6]
              shadow-[0_15px_35px_rgba(0,0,0,0.08)]
            "
          >
            <div className="px-5 py-5">
              {/* Navigation */}

              <nav className="flex flex-col gap-1">
                {navigation.map((item) => renderNavigationLink(item, true))}
              </nav>

              <div className="my-5 border-t border-[#e3ded4]" />

              {/* ==================================================
                  AUTHENTICATED MOBILE
              ================================================== */}

              {isAuthenticated && user ? (
                <div>
                  <Link
                    to="/account"
                    onClick={() => setMenuOpen(false)}
                    className="
        flex
        items-center
        gap-3
        p-4
        rounded-2xl
        bg-[#eeebe4]
        hover:bg-[#e5e0d6]
        transition-colors
      "
                  >
                    {/* Profile */}
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={userName}
                        className="
            w-11
            h-11
            rounded-full
            object-cover
            flex-shrink-0
          "
                      />
                    ) : (
                      <div
                        className="
            w-11
            h-11
            rounded-full
            bg-[#14223f]
            flex
            items-center
            justify-center
            text-white
            text-xs
            font-bold
            flex-shrink-0
          "
                      >
                        {getInitials(userName)}
                      </div>
                    )}

                    {/* Name + Role */}
                    <div className="min-w-0 flex-1">
                      <p
                        className="
            text-sm
            font-semibold
            text-[#14223f]
            truncate
          "
                      >
                        {userName}
                      </p>

                      <p
                        className="
            mt-0.5
            text-xs
            text-gray-500
            capitalize
            truncate
          "
                      >
                        {userRole}
                      </p>
                    </div>

                    <ChevronDown
                      size={17}
                      className="-rotate-90 text-[#8b877f]"
                    />
                  </Link>

                  {/* Logout */}

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isPending}
                    className="
    mt-3
    flex
    items-center
    gap-3
    w-full
    px-4
    py-3.5
    rounded-xl
    text-sm
    font-medium
    text-red-600
    hover:bg-red-50
    transition-colors
    disabled:opacity-50
    disabled:cursor-not-allowed
  "
                  >
                    <LogOut size={18} />

                    <span>{isPending ? "Logging out..." : "Logout"}</span>
                  </button>
                </div>
              ) : (
                /* ==================================================
                   LOGGED OUT MOBILE
                ================================================== */

                <div className="grid grid-cols-2 gap-3">
                  {/* Login */}

                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="
                      h-12
                      flex
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-[#d8d1c6]
                      text-[#14223f]
                      text-sm
                      font-semibold
                      hover:bg-[#eeebe4]
                      transition-colors
                    "
                  >
                    Login
                  </Link>

                  {/* Get Started */}

                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="
                      h-12
                      flex
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#14223f]
                      text-white
                      text-sm
                      font-semibold
                      hover:bg-[#1d3155]
                      transition-colors
                    "
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ==========================================================
          HEADER SPACING
      ========================================================== */}

      {!isHomePage && <div className="h-[76px]" />}
    </>
  );
};

export default Header;
