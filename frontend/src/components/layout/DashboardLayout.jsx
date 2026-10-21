
import { useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  FaArrowRightFromBracket,
  FaBars,
  FaCarSide,
  FaChartLine,
  FaClockRotateLeft,
  FaShieldHalved,
  FaUser,
  FaUsers,
  FaWallet,
  FaXmark,
  FaGaugeHigh,
  FaGift,
  FaList,
} from "react-icons/fa6";


const navigation = {
  rider: [
    { label: "Dashboard", to: "/rider/dashboard", icon: FaGaugeHigh },
    { label: "Book a ride", to: "/rider/book", icon: FaCarSide },
    { label: "All Services", to: "/services", icon: FaList },
    { label: "Ride history", to: "/rider/history", icon: FaClockRotateLeft },
    { label: "Wallet", to: "/rider/wallet", icon: FaWallet },
    { label: "Profile", to: "/rider/profile", icon: FaUser },
  ],
  driver: [
    { label: "Dashboard", to: "/driver/dashboard", icon: FaGaugeHigh },
    { label: "Ride requests", to: "/driver/requests", icon: FaCarSide },
    { label: "My profile", to: "/driver/profile", icon: FaUser },
  ],
  admin: [
    { label: "Dashboard", to: "/admin/dashboard", icon: FaChartLine },
    { label: "Driver verification", to: "/admin/drivers", icon: FaShieldHalved },
    { label: "Ride management", to: "/admin/rides", icon: FaUsers },
  ],
};


const roleLabels = {
  rider: "Rider workspace",
  driver: "Driver workspace",
  admin: "Administration",
};

export default function DashboardLayout({ children, role: roleProp }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  let storedUser = null;
  try {
    storedUser = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    storedUser = null;
  }

  const role = roleProp || storedUser?.role || "rider";
  const links = navigation[role] || navigation.rider;

  const displayName =
    storedUser?.name ||
    storedUser?.full_name ||
    storedUser?.email ||
    (role === "admin"
      ? "Administrator"
      : role === "driver"
        ? "Driver"
        : "Rider");

  const activePage = links.find(
    (item) =>
      location.pathname === item.to ||
      (item.to !== "/" && location.pathname.startsWith(`${item.to}/`))
  );

  const pageTitle = activePage?.label || "Dashboard";

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setSidebarOpen(false);
    navigate("/signin", { replace: true });
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#080d18] text-white">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation sidebar"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#0c1422] transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-6">
          <Link to="/" onClick={closeSidebar} className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-300 text-lg text-slate-950">
              <FaCarSide />
            </span>
            <span className="text-xl font-black">
              GoCab<span className="text-lime-300">.</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={closeSidebar}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-400 hover:text-white lg:hidden"
          >
            <FaXmark />
          </button>
        </div>

        <div className="border-b border-white/10 px-6 py-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-lime-300">
            {roleLabels[role] || "Workspace"}
          </p>
          <p className="mt-2 truncate text-sm font-semibold">{displayName}</p>
          <p className="mt-1 text-xs capitalize text-slate-500">{role}</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Workspace
          </p>
          <div className="space-y-1.5">
            {links.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-lime-300 text-slate-950"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                  }`
                }
              >
                <Icon className="text-base" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="border-t border-white/10 p-4">
          <Link
            to="/"
            onClick={closeSidebar}
            className="mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 hover:bg-white/[0.04] hover:text-white"
          >
            <FaCarSide /> Public website
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-300 hover:bg-red-400/10"
          >
            <FaArrowRightFromBracket /> Sign out
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-white/10 bg-[#080d18]/95 px-5 backdrop-blur-xl sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation sidebar"
              className="rounded-xl border border-white/10 p-3 text-slate-300 hover:text-white lg:hidden"
            >
              <FaBars />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{pageTitle}</p>
              <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                {roleLabels[role] || "Workspace"} / GoCab
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden max-w-48 truncate text-sm text-slate-400 sm:block">
              {displayName}
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-lime-300/20 bg-lime-300/10 text-lime-300">
              {role === "admin" ? (
                <FaShieldHalved />
              ) : role === "driver" ? (
                <FaCarSide />
              ) : (
                <FaUser />
              )}
            </span>
          </div>
        </header>

        <main className="min-w-0">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
