import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const token = localStorage.getItem("access_token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  if (!token || !user) {
    return <Navigate to="/signin" replace />;
  }

  const role = String(user.role || "").toLowerCase();

  if (!allowedRoles.includes(role)) {
    const homePaths = {
      rider: "/rider/dashboard",
      driver: "/driver/dashboard",
      admin: "/admin/dashboard",
    };

    return <Navigate to={homePaths[role] || "/"} replace />;
  }

  return <Outlet />;
}