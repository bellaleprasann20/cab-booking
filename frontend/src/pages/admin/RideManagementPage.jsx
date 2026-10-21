import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaBan,
  FaCarSide,
  FaMagnifyingGlass,
  FaRotate,
  FaXmark,
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

function getErrorMessage(error, fallback) {
  const detail =
    error?.response?.data?.detail ??
    error?.response?.data?.message;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg || String(item))
      .filter(Boolean)
      .join(", ");
  }

  return fallback;
}

function extractRides(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.rides)) return data.rides;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function normalizeStatus(value) {
  return String(value || "unknown")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function formatINR(value) {
  if (value == null || value === "") return "—";

  const amount = Number(value);

  if (!Number.isFinite(amount)) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value, includeTime = false) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" } : {}),
  });
}

const filters = [
  ["all", "All rides"],
  ["requested", "Requested"],
  ["accepted", "Accepted"],
  ["driver_assigned", "Driver assigned"],
  ["in_progress", "In progress"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
];

function getRideStatus(ride) {
  return normalizeStatus(ride?.status);
}

function isTerminalStatus(status) {
  return [
    "completed",
    "cancelled",
    "canceled",
    "rejected",
  ].includes(status);
}

export default function RideManagementPage() {
  const [rides, setRides] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [selectedRide, setSelectedRide] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadRides = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${API}/admin/rides`, {
        ...authConfig(),
        params: filter === "all" ? {} : { status: filter },
      });

      setRides(extractRides(response.data));
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to load ride records. Verify the admin rides endpoint and your permissions."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadRides();
  }, [loadRides]);

  const visibleRides = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rides.filter((ride) => {
      const status = getRideStatus(ride);

      if (filter !== "all" && status !== filter) {
        return false;
      }

      if (!query) return true;

      const text = [
        ride.id,
        ride.ride_id,
        ride._id,
        ride.status,
        ride.rider_name,
        ride.driver_name,
        ride.rider?.name,
        ride.rider?.full_name,
        ride.driver?.name,
        ride.driver?.full_name,
        ride.pickup_address,
        ride.pickup?.address,
        ride.destination_address,
        ride.destination?.address,
        ride.payment_status,
        ride.ride_type,
        ride.vehicle_type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });
  }, [rides, search, filter]);

  async function cancelRide(ride) {
    const id = ride.id ?? ride.ride_id ?? ride._id;

    if (id == null || actionId !== null) return;

    const status = getRideStatus(ride);

    if (isTerminalStatus(status)) {
      setError("This ride can no longer be cancelled.");
      return;
    }

    if (
      !window.confirm(
        `Cancel ride #${id}? This action will be submitted to the server.`
      )
    ) {
      return;
    }

    setActionId(String(id));
    setError("");
    setNotice("");

    try {
      // Confirm this endpoint and HTTP method match your FastAPI backend.
      await axios.post(
        `${API}/admin/rides/${encodeURIComponent(String(id))}/cancel`,
        {},
        authConfig()
      );

      setNotice(`Ride #${id} cancellation request completed.`);
      setSelectedRide(null);

      await loadRides();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to cancel this ride. Check its status, backend route, and admin permissions."
        )
      );
    } finally {
      setActionId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#080d18] text-white">
      <header className="border-b border-white/10 bg-[#0c1422]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-lime-300"
          >
            <FaArrowLeft />
            Admin dashboard
          </Link>

          <span className="text-lg font-black">
            GoCab<span className="text-lime-300">.</span>
          </span>

          <button
            type="button"
            onClick={loadRides}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-bold hover:border-lime-300/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaRotate className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8 lg:py-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">
          Operations
        </p>

        <h1 className="mt-3 text-3xl font-black sm:text-4xl">
          Ride management
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Review ride activity, inspect trip details, and manage eligible rides.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={loadRides}
              disabled={loading}
              className="mt-3 font-bold underline disabled:opacity-50"
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

        <section className="mt-8 rounded-3xl border border-white/10 bg-[#0d1523] p-4 sm:p-6">
          <div className="relative max-w-lg">
            <FaMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search ride ID, rider, driver, route..."
              aria-label="Search rides"
              className="w-full rounded-xl border border-white/10 bg-[#101827] py-3.5 pl-11 pr-4 text-sm outline-none focus:border-lime-300/50"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {filters.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  filter === value
                    ? "bg-lime-300 text-slate-950"
                    : "border border-white/10 text-slate-300 hover:border-white/20"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
          <span>
            {loading
              ? "Loading ride records..."
              : `${visibleRides.length} ride(s) shown`}
          </span>
          <span className="capitalize">
            Status: {filter.replaceAll("_", " ")}
          </span>
        </div>

        <section className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-[#0d1523]">
          {loading ? (
            <div className="p-12 text-center text-sm text-slate-400">
              Loading rides...
            </div>
          ) : visibleRides.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <FaCarSide className="mx-auto text-3xl text-slate-500" />
              <h2 className="mt-4 text-xl font-bold">No matching rides</h2>
              <p className="mt-2 text-sm text-slate-400">
                No records were returned for this status and search.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-white/[0.025] text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Ride</th>
                    <th className="px-5 py-4 font-semibold">
                      Rider / driver
                    </th>
                    <th className="px-5 py-4 font-semibold">Route</th>
                    <th className="px-5 py-4 font-semibold">Fare</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/[0.06]">
                  {visibleRides.map((ride, index) => {
                    const id = ride.id ?? ride.ride_id ?? ride._id;
                    const status = getRideStatus(ride);
                    const terminal = isTerminalStatus(status);
                    const fare =
                      ride.fare ?? ride.estimated_fare ?? ride.total_fare;

                    return (
                      <tr
                        key={id ?? index}
                        className="align-top hover:bg-white/[0.02]"
                      >
                        <td className="px-5 py-5">
                          <p className="font-bold">
                            #{String(id ?? "—")}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatDate(ride.created_at ?? ride.requested_at)}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-semibold">
                            {ride.rider_name ||
                              ride.rider?.name ||
                              ride.rider?.full_name ||
                              "—"}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">Rider</p>

                          <p className="mt-3 font-semibold">
                            {ride.driver_name ||
                              ride.driver?.name ||
                              ride.driver?.full_name ||
                              "Unassigned"}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">Driver</p>
                        </td>

                        <td className="max-w-xs px-5 py-5">
                          <p className="line-clamp-2 text-slate-200">
                            {ride.pickup_address ||
                              ride.pickup?.address ||
                              "Pickup unavailable"}
                          </p>
                          <p className="my-2 text-xs text-lime-300">
                            ↓ Destination
                          </p>
                          <p className="line-clamp-2 text-slate-400">
                            {ride.destination_address ||
                              ride.destination?.address ||
                              "Destination unavailable"}
                          </p>
                        </td>

                        <td className="px-5 py-5 font-bold">
                          {formatINR(fare)}
                          <p className="mt-1 text-xs font-normal capitalize text-slate-500">
                            Payment:{" "}
                            {String(
                              ride.payment_status || "unavailable"
                            ).replaceAll("_", " ")}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <StatusPill value={status} />
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex flex-col items-start gap-3">
                            <button
                              type="button"
                              onClick={() => setSelectedRide(ride)}
                              className="text-sm font-bold text-lime-300 hover:text-lime-200"
                            >
                              View details
                            </button>

                            {!terminal && (
                              <button
                                type="button"
                                onClick={() => cancelRide(ride)}
                                disabled={actionId !== null}
                                className="flex items-center gap-2 text-xs font-semibold text-red-300 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <FaBan />
                                {actionId === String(id)
                                  ? "Processing..."
                                  : "Cancel ride"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {selectedRide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedRide(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="ride-dialog-title"
            className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0d1523] p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-lime-300">
                  Ride record
                </p>
                <h2
                  id="ride-dialog-title"
                  className="mt-2 break-words text-2xl font-black"
                >
                  Ride #
                  {String(
                    selectedRide.id ??
                      selectedRide.ride_id ??
                      selectedRide._id ??
                      "—"
                  )}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRide(null)}
                aria-label="Close ride details"
                className="rounded-xl border border-white/10 p-3 text-slate-300 hover:text-white"
              >
                <FaXmark />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <Detail
                label="Status"
                value={normalizeStatus(selectedRide.status).replaceAll("_", " ")}
              />
              <Detail
                label="Rider"
                value={
                  selectedRide.rider_name ||
                  selectedRide.rider?.name ||
                  selectedRide.rider?.full_name
                }
              />
              <Detail
                label="Driver"
                value={
                  selectedRide.driver_name ||
                  selectedRide.driver?.name ||
                  selectedRide.driver?.full_name
                }
              />
              <Detail
                label="Driver phone"
                value={
                  selectedRide.driver_phone ||
                  selectedRide.driver?.phone ||
                  selectedRide.driver?.phone_number
                }
              />
              <Detail
                label="Pickup"
                value={
                  selectedRide.pickup_address ||
                  selectedRide.pickup?.address
                }
              />
              <Detail
                label="Destination"
                value={
                  selectedRide.destination_address ||
                  selectedRide.destination?.address
                }
              />
              <Detail
                label="Fare"
                value={formatINR(
                  selectedRide.fare ??
                    selectedRide.estimated_fare ??
                    selectedRide.total_fare
                )}
              />
              <Detail
                label="Payment status"
                value={selectedRide.payment_status}
              />
              <Detail
                label="Ride type"
                value={
                  selectedRide.ride_type || selectedRide.vehicle_type
                }
              />
              <Detail
                label="Created at"
                value={formatDate(
                  selectedRide.created_at ?? selectedRide.requested_at,
                  true
                )}
              />
            </div>

            {!isTerminalStatus(getRideStatus(selectedRide)) && (
              <button
                type="button"
                onClick={() => cancelRide(selectedRide)}
                disabled={actionId !== null}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3.5 font-bold text-red-200 hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaBan />
                {actionId !== null ? "Processing..." : "Cancel this ride"}
              </button>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

function StatusPill({ value }) {
  const status = normalizeStatus(value);

  const color = ["completed", "paid", "verified", "approved"].includes(status)
    ? "bg-lime-300/10 text-lime-200"
    : ["cancelled", "canceled", "failed", "rejected"].includes(status)
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

function Detail({ label, value }) {
  return (
    <div className="rounded-xl bg-white/[0.035] p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold">
        {value == null || value === "" ? "Not provided" : String(value)}
      </p>
    </div>
  );
}