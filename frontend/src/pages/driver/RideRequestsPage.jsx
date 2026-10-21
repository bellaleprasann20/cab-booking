import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCarSide,
  FaCheck,
  FaClock,
  FaLocationDot,
  FaRoute,
  FaXmark,
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

function RoutePoint({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
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
    <div className="rounded-xl bg-white/[0.035] p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold">{value ?? "Not provided"}</p>
    </div>
  );
}

function formatFare(value) {
  if (value == null || value === "" || !Number.isFinite(Number(value))) {
    return "Not provided";
  }

  return `₹${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatRequestedTime(value) {
  if (!value) return "Not provided";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not provided";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeRequests(payload) {
  const result = Array.isArray(payload)
    ? payload
    : payload?.requests ?? payload?.rides ?? payload?.items ?? [];

  return Array.isArray(result) ? result : [];
}

export default function RideRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await axios.get(
        `${API}/drivers/ride-requests`,
        authConfig()
      );

      setRequests(normalizeRequests(response.data));
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to load ride requests. Check the driver requests API."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  async function respondToRequest(ride, action) {
    const id = ride.id ?? ride.ride_id;

    if (id == null || actionId !== null) return;

    setActionId(String(id));
    setError("");
    setNotice("");

    try {
      await axios.post(
        `${API}/drivers/requests/${encodeURIComponent(String(id))}/${action}`,
        {},
        authConfig()
      );

      setRequests((previous) =>
        previous.filter(
          (item) => String(item.id ?? item.ride_id) !== String(id)
        )
      );

      setNotice(
        action === "accept"
          ? `Ride #${id} accepted successfully.`
          : `Ride #${id} declined.`
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          `Could not ${action} this ride. It may no longer be available.`
        )
      );
    } finally {
      setActionId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#080d18] text-white">
      <header className="border-b border-white/10 bg-[#0c1422]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Link
            to="/driver/dashboard"
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-lime-300"
          >
            <FaArrowLeft /> Dashboard
          </Link>

          <Link to="/" className="text-lg font-black">
            GoCab<span className="text-lime-300">.</span>
          </Link>

          <button
            type="button"
            onClick={loadRequests}
            disabled={loading || actionId !== null}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold hover:border-lime-300/40 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8 lg:py-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">
          Available trips
        </p>

        <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-black sm:text-4xl">Ride requests</h1>
            <p className="mt-2 text-sm text-slate-400">
              Review trip details before accepting a request.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0d1523] px-5 py-3">
            <p className="text-xs text-slate-400">Available requests</p>
            <p className="mt-1 text-2xl font-black">
              {loading ? "—" : requests.length}
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={loadRequests}
              disabled={loading || actionId !== null}
              className="mt-2 font-bold underline disabled:opacity-50"
            >
              Retry
            </button>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mt-6 rounded-2xl border border-lime-300/20 bg-lime-300/10 p-4 text-sm text-lime-200"
          >
            {notice}
          </div>
        )}

        {loading ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-[#0d1523] p-12 text-center text-slate-400">
            Loading available requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-[#0d1523] px-6 py-16 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-300/10 text-2xl text-lime-300">
              <FaCarSide />
            </span>

            <h2 className="mt-5 text-xl font-bold">No available requests</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              No requests were returned by the server. Check your online status and refresh later.
            </p>

            <Link
              to="/driver/dashboard"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-lime-300"
            >
              Back to dashboard <FaArrowRight />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 xl:grid-cols-2">
            {requests.map((ride, index) => {
              const id = ride.id ?? ride.ride_id;
              const pickup =
                ride.pickup_address ?? ride.pickup?.address ?? "Pickup unavailable";
              const destination =
                ride.destination_address ??
                ride.destination?.address ??
                "Destination unavailable";
              const fare =
                ride.estimated_fare ?? ride.fare ?? ride.total_fare;
              const busy = actionId === String(id);

              return (
                <article
                  key={id ?? `request-${index}`}
                  className="rounded-3xl border border-white/10 bg-[#0d1523] p-5 transition hover:border-white/20 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-300/10 text-xl text-lime-300">
                        <FaCarSide />
                      </span>
                      <div>
                        <p className="font-bold">
                          Ride #{String(id ?? "—")}
                        </p>
                        <p className="mt-1 text-xs capitalize text-slate-400">
                          {String(ride.ride_type ?? ride.vehicle_type ?? "Ride").replaceAll("_", " ")}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-amber-300/10 px-3 py-1.5 text-xs font-bold text-amber-200">
                      Awaiting response
                    </span>
                  </div>

                  <div className="mt-6 rounded-2xl bg-white/[0.025] p-4">
                    <RoutePoint icon={FaLocationDot} label="PICKUP" value={pickup} />
                    <div className="ml-4 h-6 border-l border-dashed border-slate-600" />
                    <RoutePoint icon={FaRoute} label="DESTINATION" value={destination} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <Info label="Estimated fare" value={formatFare(fare)} />
                    <Info
                      label="Distance"
                      value={ride.distance_km != null ? `${ride.distance_km} km` : "Not provided"}
                    />
                    <Info
                      label="Estimated time"
                      value={ride.duration_minutes != null ? `${ride.duration_minutes} min` : "Not provided"}
                    />
                    <Info label="Requested at" value={formatRequestedTime(ride.created_at)} />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => respondToRequest(ride, "reject")}
                      disabled={actionId !== null || id == null}
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 font-bold text-slate-300 transition hover:border-red-300/40 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FaXmark />
                      {busy ? "Processing..." : "Decline"}
                    </button>

                    <button
                      type="button"
                      onClick={() => respondToRequest(ride, "accept")}
                      disabled={actionId !== null || id == null}
                      className="flex items-center justify-center gap-2 rounded-xl bg-lime-300 px-4 py-3 font-bold text-slate-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FaCheck />
                      {busy ? "Processing..." : "Accept ride"}
                    </button>
                  </div>

                  <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <FaClock />
                    Acceptance is confirmed by the server.
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}