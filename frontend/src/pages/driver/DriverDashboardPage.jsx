import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaArrowRight,
  FaCarSide,
  FaCircleCheck,
  FaClock,
  FaLocationDot,
  FaPowerOff,
  FaRoute,
  FaWallet,
} from "react-icons/fa6";

const API = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/+$/, "");

function authConfig() {
  const token = localStorage.getItem("access_token");
  return { headers: token ? { Authorization: `Bearer ${token}` } : {} };
}

function getErrorMessage(err, fallback) {
  const detail = err.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((item) => item.msg || JSON.stringify(item)).join(", ");
  return fallback;
}

function formatNumber(value, maximumFractionDigits = 2) {
  if (value == null || value === "" || !Number.isFinite(Number(value))) return "—";
  return Number(value).toLocaleString("en-IN", { maximumFractionDigits });
}

function RoutePoint({ icon: Icon, label, value }) {
  return (
    <div className="mt-5 flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-lime-300">
        <Icon />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold tracking-wider text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm leading-6 text-slate-200">{value}</p>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-white/[0.035] p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold">{String(value ?? "Not provided")}</p>
    </div>
  );
}

export default function DriverDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [error, setError] = useState("");
  const [availabilityError, setAvailabilityError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [dashboardResponse, profileResponse] = await Promise.all([
        axios.get(`${API}/drivers/me/dashboard`, authConfig()),
        axios.get(`${API}/drivers/me`, authConfig()),
      ]);

      const dashboardData = dashboardResponse.data;
      const profileData = profileResponse.data;

      setSummary(dashboardData?.dashboard ?? dashboardData);
      setProfile(profileData?.driver ?? profileData);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load the driver dashboard. Check your API routes and sign-in status."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function toggleAvailability() {
    if (!profile || updatingAvailability) return;

    setUpdatingAvailability(true);
    setAvailabilityError("");

    const currentAvailability = Boolean(profile.is_available ?? profile.available);
    const nextAvailability = !currentAvailability;

    try {
      const response = await axios.patch(
        `${API}/drivers/me/availability`,
        { is_available: nextAvailability },
        authConfig()
      );

      const updated = response.data?.driver ?? response.data;

      setProfile((previous) => ({
        ...previous,
        ...updated,
        is_available: updated?.is_available ?? updated?.available ?? nextAvailability,
      }));
    } catch (err) {
      setAvailabilityError(
        getErrorMessage(err, "Could not update availability. Please try again.")
      );
    } finally {
      setUpdatingAvailability(false);
    }
  }

  const available = Boolean(profile?.is_available ?? profile?.available);
  const activeRide = summary?.active_ride ?? summary?.current_ride ?? null;
  const driverName =
    profile?.name || profile?.full_name || profile?.user?.name || "Driver";

  const cards = [
    {
      label: "Today's earnings",
      value: summary?.today_earnings ?? summary?.earnings_today,
      prefix: "₹",
      icon: FaWallet,
    },
    {
      label: "Completed rides",
      value: summary?.completed_rides_today ?? summary?.rides_completed_today,
      icon: FaCircleCheck,
    },
    {
      label: "Total rides",
      value: summary?.total_rides,
      icon: FaRoute,
    },
    {
      label: "Average rating",
      value: summary?.average_rating ?? profile?.rating,
      icon: FaClock,
    },
  ];

  return (
    <main className="min-h-screen bg-[#080d18] text-white">
      <header className="border-b border-white/10 bg-[#0c1422]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Link to="/" className="text-xl font-black">
            GoCab<span className="text-lime-300">.</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/driver/requests" className="text-slate-300 hover:text-lime-300">
              Ride requests
            </Link>
            <Link to="/driver/profile" className="text-slate-300 hover:text-lime-300">
              Profile
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-12">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">
              Driver workspace
            </p>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">
              Welcome, {driverName}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Manage your availability and monitor your trips.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0d1523] p-4">
            <span className={`h-3 w-3 rounded-full ${available ? "bg-lime-300" : "bg-slate-500"}`} />
            <div className="mr-2">
              <p className="text-sm font-bold">
                {available ? "You're online" : "You're offline"}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {available ? "Available for requests" : "Not receiving requests"}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleAvailability}
              disabled={loading || updatingAvailability || !profile}
              className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50 ${
                available
                  ? "border border-white/10 text-white hover:bg-white/5"
                  : "bg-lime-300 text-slate-950 hover:bg-lime-200"
              }`}
            >
              <FaPowerOff />
              {updatingAvailability ? "Updating..." : available ? "Go offline" : "Go online"}
            </button>
          </div>
        </div>

        {(error || availabilityError) && (
          <div role="alert" className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
            {error || availabilityError}
            {error && (
              <button type="button" onClick={loadDashboard} className="ml-3 font-bold underline">
                Retry
              </button>
            )}
          </div>
        )}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, prefix = "", icon: Icon }) => (
            <article key={label} className="rounded-3xl border border-white/10 bg-[#0d1523] p-5 sm:p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-300/10 text-lg text-lime-300">
                <Icon />
              </span>
              <p className="mt-5 text-sm text-slate-400">{label}</p>
              <p className="mt-2 text-2xl font-black">
                {loading ? "..." : value != null ? `${prefix}${formatNumber(value)}` : "—"}
              </p>
            </article>
          ))}
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-white/10 bg-[#0d1523] p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Current ride</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Your active trip, if one is assigned.
                </p>
              </div>
              <FaCarSide className="text-2xl text-lime-300" />
            </div>

            {loading ? (
              <p className="mt-8 text-sm text-slate-400">Loading ride details...</p>
            ) : activeRide ? (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-bold">
                    Ride #{String(activeRide.id ?? activeRide.ride_id ?? "—")}
                  </span>
                  <span className="rounded-full bg-lime-300/10 px-3 py-1.5 text-xs font-bold capitalize text-lime-200">
                    {String(activeRide.status || "active").replaceAll("_", " ")}
                  </span>
                </div>
                <RoutePoint
                  icon={FaLocationDot}
                  label="PICKUP"
                  value={activeRide.pickup_address || activeRide.pickup?.address || "Address not provided"}
                />
                <RoutePoint
                  icon={FaRoute}
                  label="DESTINATION"
                  value={activeRide.destination_address || activeRide.destination?.address || "Address not provided"}
                />
                <Link to="/driver/requests" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-lime-300 hover:text-lime-200">
                  Open driver workspace <FaArrowRight />
                </Link>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-white/10 px-5 py-10 text-center">
                <FaCarSide className="mx-auto text-3xl text-slate-500" />
                <p className="mt-4 font-bold">No active ride</p>
                <p className="mt-2 text-sm text-slate-400">
                  When a ride is assigned, its details will appear here.
                </p>
                <Link to="/driver/requests" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-lime-300 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-lime-200">
                  View requests <FaArrowRight />
                </Link>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#0d1523] p-5 sm:p-7">
            <h2 className="text-lg font-bold">Driver account</h2>
            <p className="mt-1 text-sm text-slate-400">
              Check your vehicle information and account verification.
            </p>
            <div className="mt-6 space-y-4">
              <Info label="Vehicle" value={profile?.vehicle_model || profile?.vehicle?.model || "Not provided"} />
              <Info label="Registration" value={profile?.vehicle_number || profile?.vehicle?.registration_number || "Not provided"} />
              <Info
                label="Verification"
                value={profile?.verification_status || (profile?.is_verified === true ? "Verified" : profile?.is_verified === false ? "Not verified" : "Not provided")}
              />
            </div>
            <Link to="/driver/profile" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-bold hover:border-lime-300/40 hover:text-lime-300">
              Manage profile <FaArrowRight />
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}