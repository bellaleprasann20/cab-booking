
import { createBrowserRouter, Navigate } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import RiderLayout from "../components/layout/RiderLayout";

// Public pages
import LandingPage from "../pages/LandingPage";
import SignInPage from "../pages/auth/SignInPage";
import SignUpPage from "../pages/auth/SignUpPage";
import AllServicesPage from "../pages/AllServicesPage";
import NotFoundPage from "../pages/NotFoundPage";

// Rider pages
import RiderDashboardPage from "../pages/rider/RiderDashboardPage";
import BookingPage from "../pages/rider/BookingPage";
import LiveRidePage from "../pages/rider/LiveRidePage";
import RideHistoryPage from "../pages/rider/RideHistoryPage";
import RideDetailsPage from "../pages/rider/RideDetailsPage";
import WalletPage from "../pages/rider/WalletPage";
import RiderProfilePage from "../pages/rider/RiderProfilePage";

// Driver pages
import DriverDashboardPage from "../pages/driver/DriverDashboardPage";
import RideRequestsPage from "../pages/driver/RideRequestsPage";
import DriverProfilePage from "../pages/driver/DriverProfilePage";

// Admin pages
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import DriverVerificationPage from "../pages/admin/DriverVerificationPage";
import RideManagementPage from "../pages/admin/RideManagementPage";

function getRoleHome(role) {
  switch (String(role || "").toLowerCase()) {
    case "rider":
      return "/rider/dashboard";
    case "driver":
      return "/driver/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/";
  }
}

function getCurrentUser() {
  const token = localStorage.getItem("access_token");

  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (token && user?.role) {
      return user;
    }
  } catch {
    // Treat invalid stored user data as unauthenticated.
  }

  return null;
}

function PublicOnlyRoute({ children }) {
  const user = getCurrentUser();

  if (user) {
    return <Navigate to={getRoleHome(user.role)} replace />;
  }

  return children;
}

function HomeRoute() {
  const user = getCurrentUser();

  if (user) {
    return <Navigate to={getRoleHome(user.role)} replace />;
  }

  return <LandingPage />;
}

const router = createBrowserRouter([
  // Public routes
  {
    path: "/",
    element: <HomeRoute />,
  },
  {
    path: "/signin",
    element: (
      <PublicOnlyRoute>
        <SignInPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <PublicOnlyRoute>
        <SignUpPage />
      </PublicOnlyRoute>
    ),
  },

  // Rider routes: one shared navbar and layout
  {
    element: <ProtectedRoute allowedRoles={["rider"]} />,
    children: [
      {
        element: <RiderLayout />,
        children: [
          {
            path: "/services",
            element: <AllServicesPage />,
          },
          {
            path: "/rider/dashboard",
            element: <RiderDashboardPage />,
          },
          {
            path: "/rider/book",
            element: <BookingPage />,
          },
          {
            path: "/rider/ride/:rideId",
            element: <LiveRidePage />,
          },
          {
            path: "/rider/history",
            element: <RideHistoryPage />,
          },
          {
            path: "/rider/history/:rideId",
            element: <RideDetailsPage />,
          },
          {
            path: "/rider/wallet",
            element: <WalletPage />,
          },
          {
            path: "/rider/profile",
            element: <RiderProfilePage />,
          },
        ],
      },
    ],
  },

  // Driver routes
  {
    element: <ProtectedRoute allowedRoles={["driver"]} />,
    children: [
      {
        path: "/driver/dashboard",
        element: <DriverDashboardPage />,
      },
      {
        path: "/driver/requests",
        element: <RideRequestsPage />,
      },
      {
        path: "/driver/profile",
        element: <DriverProfilePage />,
      },
    ],
  },

  // Admin routes
  {
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [
      {
        path: "/admin/dashboard",
        element: <AdminDashboardPage />,
      },
      {
        path: "/admin/drivers",
        element: <DriverVerificationPage />,
      },
      {
        path: "/admin/rides",
        element: <RideManagementPage />,
      },
      {
        path: "/admin/profile",
        element: <Navigate to="/admin/dashboard" replace />,
      },
    ],
  },

  // Unknown routes
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
