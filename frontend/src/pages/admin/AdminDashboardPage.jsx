import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaArrowRight,
  FaCarSide,
  FaChartLine,
  FaClock,
  FaRotate,
  FaShieldHalved,
  FaUsers,
  FaWallet,
} from "react-icons/fa6";

const API = (
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"
).replace(/\/+$/, "");

function authConfig() {
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  return {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
}

function getArray(data, ...keys) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
}

function formatNumber(value, prefix = "") {
  if (value == null || value === "") return "—";

  const number = Number(value);

  return Number.isFinite(number)
    ? `${prefix}${number.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      })}`
    : "—";
}

function getErrorMessage(error, fallback) {
  const detail =
    error?.response?.data?.detail ??
    error?.response?.data?.message;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail.map((item) => item?.msg || String(item)).filter(Boolean).join(", ");
  }

  return fallback;
}

function normalizeStatus(value) {
  return String(value || "unknown")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN");
}

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [recentRides, setRecentRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [summaryResponse, ridesResponse] = await Promise.all([
        axios.get(`${API}/admin/dashboard`, authConfig()),
        axios.get(`${API}/admin/rides`, authConfig()),
      ]);

      const summaryData =
        summaryResponse.data?.dashboard ??
        summaryResponse.data?.summary ??
        summaryResponse.data;

      setSummary(
        summaryData &&
          typeof summaryData === "object" &&
          !Array.isArray(summaryData)
          ? summaryData
          : {}
      );

      setRecentRides(
        getArray(ridesResponse.data, "rides", "items", "results").slice(0, 6)
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to load the admin overview. Verify the admin API endpoints and your admin permissions."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const stats = [
    {
      label: "Registered users",
      value: summary?.total_users ?? summary?.users_count,
      icon: FaUsers,
      detail: "Platform accounts",
    },
    {
      label: "Registered drivers",
      value: summary?.total_drivers ?? summary?.drivers_count,
      icon: FaCarSide,
      detail: "Driver accounts",
    },
    {
      label: "Total rides",
      value: summary?.total_rides ?? summary?.rides_count,
      icon: FaChartLine,
      detail: "Platform ride records",
    },
    {
      label: "Pending verifications",
      value: summary?.pending_verifications ?? summary?.pending_drivers,
      icon: FaShieldHalved,
      detail: "Require admin review",
    },
    {
      label: "Active rides",
      value: summary?.active_rides,
      icon: FaClock,
      detail: "Currently underway",
    },
    {
      label: "Total revenue",
      value: summary?.total_revenue ?? summary?.revenue,
      prefix: "₹",
      icon: FaWallet,
      detail: "As reported by the API",
    },
  ];

  return (
    <main className="min-h-screen bg-[#080d18] text-white">
      <header className="border-b border-white/10 bg-[#0c1422]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Link to="/" className="text-xl font-black">
            GoCab<span className="text-lime-300">.</span>
          </Link>

          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link to="/admin/dashboard" className="text-lime-300">
              Dashboard
            </Link>
            <Link
              to="/admin/drivers"
              className="text-slate-300 hover:text-lime-300"
            >
              Driver verification
            </Link>
            <Link
              to="/admin/rides"
              className="text-slate-300 hover:text-lime-300"
            >
              Ride management
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-12">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">
              Platform control center
            </p>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">
              Admin dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Monitor platform activity and manage critical operations.
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/10 px-4 py-3 text-sm font-bold hover:border-lime-300/40 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
          >
            <FaRotate className={loading ? "animate-spin" : ""} />
            Refresh overview
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={loadDashboard}
              disabled={loading}
              className="mt-3 font-bold underline disabled:opacity-50"
            >
              Retry
            </button>
          </div>
        )}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map(({ label, value, prefix = "", icon: Icon, detail }) => (
            <article
              key={label}
              className="rounded-3xl border border-white/10 bg-[#0d1523] p-5 sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">{label}</p>
                  <p className="mt-3 break-words text-2xl font-black sm:text-3xl">
                    {loading
                      ? "..."
                      : value == null || value === ""
                        ? "—"
                        : formatNumber(value, prefix)}
                  </p>
                </div>

                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lime-300/10 text-xl text-lime-300">
                  <Icon />
                </span>
              </div>

              <p className="mt-5 border-t border-white/10 pt-4 text-xs text-slate-500">
                {detail}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0d1523]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5 sm:p-6">
              <div>
                <h2 className="text-lg font-bold">Recent rides</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Latest records returned by the API.
                </p>
              </div>

              <Link
                to="/admin/rides"
                className="flex shrink-0 items-center gap-2 text-sm font-bold text-lime-300 hover:text-lime-200"
              >
                View all <FaArrowRight />
              </Link>
            </div>

            {loading ? (
              <p className="p-8 text-sm text-slate-400">
                Loading ride records...
              </p>
            ) : recentRides.length === 0 ? (
              <div className="p-10 text-center">
                <FaCarSide className="mx-auto text-3xl text-slate-500" />
                <p className="mt-4 font-bold">No ride records available</p>
                <p className="mt-2 text-sm text-slate-400">
                  The API returned no recent rides.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead className="bg-white/[0.025] text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Ride</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 font-semibold">Fare</th>
                      <th className="px-5 py-4 font-semibold">Created</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/[0.06]">
                    {recentRides.map((ride, index) => (
                      <tr
                        key={ride.id ?? ride.ride_id ?? ride._id ?? index}
                        className="hover:bg-white/[0.02]"
                      >
                        <td className="px-5 py-4 font-bold">
                          #{String(ride.id ?? ride.ride_id ?? ride._id ?? "—")}
                        </td>
                        <td className="px-5 py-4">
                          <StatusPill value={ride.status} />
                        </td>
                        <td className="px-5 py-4 text-slate-300">
                          {formatNumber(
                            ride.fare ?? ride.estimated_fare ?? ride.total_fare,
                            "₹"
                          )}
                        </td>
                        <td className="px-5 py-4 text-slate-400">
                          {formatDate(ride.created_at ?? ride.requested_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <aside className="rounded-3xl border border-white/10 bg-[#0d1523] p-5 sm:p-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-300/10 text-xl text-lime-300">
              <FaShieldHalved />
            </span>

            <h2 className="mt-5 text-lg font-bold">Admin actions</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Handle verification requests and monitor rides from dedicated
              management pages.
            </p>

            <div className="mt-6 space-y-3">
              <AdminLink
                to="/admin/drivers"
                title="Review driver applications"
                description="Check verification records"
              />
              <AdminLink
                to="/admin/rides"
                title="Manage platform rides"
                description="Inspect ride status and records"
              />
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function StatusPill({ value }) {
  const status = normalizeStatus(value);

  const color = [
    "completed",
    "paid",
    "verified",
    "approved",
  ].includes(status)
    ? "bg-lime-300/10 text-lime-200"
    : ["cancelled", "canceled", "rejected", "failed"].includes(status)
      ? "bg-red-400/10 text-red-200"
      : ["requested", "pending"].includes(status)
        ? "bg-amber-300/10 text-amber-200"
        : [
              "accepted",
              "driver_assigned",
              "in_progress",
              "arrived",
            ].includes(status)
          ? "bg-sky-300/10 text-sky-200"
          : "bg-white/5 text-slate-300";

  const labels = {
    driver_assigned: "Driver assigned",
    in_progress: "In progress",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold capitalize ${color}`}
    >
      {labels[status] || status.replaceAll("_", " ")}
    </span>
  );
}

function AdminLink({ to, title, description }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 p-4 transition hover:border-lime-300/30 hover:bg-white/[0.025]"
    >
      <div className="min-w-0">
        <p className="text-sm font-bold">{title}</p>
        <p className="mt-1 text-xs text-slate-400">{description}</p>
      </div>
      <FaArrowRight className="shrink-0 text-lime-300" />
    </Link>
  );
}