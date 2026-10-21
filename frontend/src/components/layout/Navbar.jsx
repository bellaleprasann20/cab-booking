
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FaBars,
  FaXmark,
  FaCar,
  FaGaugeHigh,
  FaRoute,
  FaClockRotateLeft,
  FaWallet,
  FaUser,
  FaRightFromBracket,
  FaChevronDown,
  FaList,
  FaClipboardCheck,
  FaUsers,
} from "react-icons/fa6";
import { logout } from "../../store/authSlice";

const NAVIGATION = {
  rider: [
    { label: "Dashboard", to: "/rider/dashboard", icon: FaGaugeHigh },
    { label: "Book Ride", to: "/rider/book", icon: FaCar },
    { label: "All Services", to: "/services", icon: FaList },
    { label: "Ride History", to: "/rider/history", icon: FaClockRotateLeft },
    { label: "Wallet", to: "/rider/wallet", icon: FaWallet },
    { label: "Profile", to: "/rider/profile", icon: FaUser },
  ],
  driver: [
    { label: "Dashboard", to: "/driver/dashboard", icon: FaGaugeHigh },
    { label: "Ride Requests", to: "/driver/requests", icon: FaRoute },
    { label: "Profile", to: "/driver/profile", icon: FaUser },
  ],
  admin: [
    { label: "Dashboard", to: "/admin/dashboard", icon: FaGaugeHigh },
    {
      label: "Driver Verification",
      to: "/admin/drivers",
      icon: FaClipboardCheck,
    },
    { label: "Ride Management", to: "/admin/rides", icon: FaUsers },
  ],
};

const ROLE_HOME = {
  rider: "/rider/dashboard",
  driver: "/driver/dashboard",
  admin: "/admin/dashboard",
};

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function getInitial(user) {
  const name = user?.full_name || user?.name || user?.email || "U";
  return name.trim().charAt(0).toUpperCase() || "U";
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth || {});
  const currentUser = user || readStoredUser();

  const role = String(currentUser?.role || "").toLowerCase();
  const links = NAVIGATION[role] || [];
  const homePath = ROLE_HOME[role] || "/";

  const displayName =
    currentUser?.full_name ||
    currentUser?.name ||
    currentUser?.email ||
    "My Account";

  const closeMenus = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const handleLogout = () => {
    closeMenus();

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    dispatch(logout());
    navigate("/signin", { replace: true });
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "bg-lime-300 text-[#07111f] shadow-sm shadow-lime-300/10"
        : "text-slate-300 hover:bg-white/5 hover:text-lime-300"
    }`;

  const profileLink =
    role === "rider"
      ? "/rider/profile"
      : role === "driver"
        ? "/driver/profile"
        : role === "admin"
          ? "/admin/profile"
          : null;

  return (
    <header className="sticky top-0 z-50 border-b border-[#1b2b43] bg-[#030d1b]/95 text-white shadow-lg shadow-black/10 backdrop-blur-xl">
      <nav
        className="mx-auto flex min-h-[78px] max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-7 lg:px-10"
        aria-label="Main navigation"
      >
        {/* GoCab brand */}
        <Link
          to={homePath}
          onClick={closeMenus}
          className="flex shrink-0 items-center gap-3"
          aria-label="GoCab home"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-300 text-xl text-[#07111f] shadow-lg shadow-lime-300/10 transition-transform duration-200 hover:scale-105">
            <FaCar />
          </span>

          <span className="text-2xl font-black tracking-tight text-white">
            GoCab<span className="text-lime-300">.</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-1 xl:flex">
          {links.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === homePath}
              className={linkClass}
            >
              <Icon className="text-sm" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        {/* Desktop account dropdown */}
        <div className="relative hidden xl:block">
          <button
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            className="flex items-center gap-3 rounded-2xl border border-[#20334b] bg-[#0a192c] px-3 py-2 transition hover:border-lime-300/40 hover:bg-[#0e2035]"
            aria-expanded={profileOpen}
            aria-haspopup="menu"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-300/10 font-bold text-lime-300">
              {getInitial(currentUser)}
            </span>

            <span className="max-w-36 text-left">
              <span className="block truncate text-sm font-bold text-white">
                {displayName}
              </span>
              <span className="block text-xs capitalize text-slate-400">
                {role || "User"}
              </span>
            </span>

            <FaChevronDown
              className={`text-xs text-slate-400 transition-transform duration-200 ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {profileOpen && (
            <>
              <button
                type="button"
                aria-label="Close account menu"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setProfileOpen(false)}
              />

              <div
                className="absolute right-0 z-50 mt-3 w-64 rounded-2xl border border-[#20334b] bg-[#071322] p-2 shadow-2xl shadow-black/40"
                role="menu"
              >
                <div className="mb-2 border-b border-[#20334b] px-3 py-3">
                  <p className="truncate text-sm font-bold text-white">
                    {displayName}
                  </p>
                  <p className="mt-1 text-xs capitalize text-slate-400">
                    {role || "User"} account
                  </p>
                </div>

                {profileLink && (
                  <NavLink
                    to={profileLink}
                    onClick={closeMenus}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300 transition hover:bg-white/5 hover:text-lime-300"
                    role="menuitem"
                  >
                    <FaUser />
                    My Profile
                  </NavLink>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-300 transition hover:bg-red-400/10"
                  role="menuitem"
                >
                  <FaRightFromBracket />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile and tablet menu button */}
        <button
          type="button"
          onClick={() => {
            setMenuOpen((open) => !open);
            setProfileOpen(false);
          }}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#20334b] bg-[#0a192c] text-xl text-lime-300 transition hover:border-lime-300/40 hover:bg-[#112238] xl:hidden"
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          {menuOpen ? <FaXmark /> : <FaBars />}
        </button>
      </nav>

      {/* Responsive mobile navigation */}
      {menuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-[#20334b] bg-[#061221] px-4 pb-5 pt-4 sm:px-7 xl:hidden"
        >
          {currentUser && (
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[#20334b] bg-[#0a192c] p-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lime-300/10 text-lg font-bold text-lime-300">
                {getInitial(currentUser)}
              </span>

              <div className="min-w-0">
                <p className="truncate font-bold text-white">{displayName}</p>
                <p className="mt-1 text-sm capitalize text-slate-400">
                  {role || "User"}
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            {links.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === homePath}
                onClick={closeMenus}
                className={linkClass}
              >
                <Icon className="text-base" />
                <span>{label}</span>
              </NavLink>
            ))}

            {profileLink && (
              <NavLink
                to={profileLink}
                onClick={closeMenus}
                className={linkClass}
              >
                <FaUser className="text-base" />
                <span>My Profile</span>
              </NavLink>
            )}
          </div>

          <div className="mt-4 border-t border-[#20334b] pt-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 font-semibold text-red-300 transition hover:bg-red-400/10"
            >
              <FaRightFromBracket />
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
