import { useState } from "react";
import {
  FaArrowRight,
  FaCarSide,
  FaCheck,
  FaClock,
  FaLocationDot,
  FaRoute,
  FaXmark,
} from "react-icons/fa6";
import StatusBadge from "./StatusBadge";

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

function formatDate(value) {
  if (!value) return "Time unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Time unavailable";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function RideRequestCard({
  ride,
  onAccept,
  onReject,
  loading = false,
  className = "",
}) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  if (!ride) return null;

  const id = ride.id ?? ride.ride_id ?? ride._id;

  const pickup =
    ride.pickup_address ??
    ride.pickup?.address ??
    ride.pickup_location;

  const destination =
    ride.destination_address ??
    ride.destination?.address ??
    ride.destination_location;

  const fare =
    ride.fare ??
    ride.estimated_fare ??
    ride.total_fare;

  const requestedAt = ride.created_at ?? ride.requested_at;
  const rideType = ride.ride_type ?? ride.vehicle_type;

  const busy = loading || processing;

  async function handleAction(action) {
    if (busy || id == null) return;

    const callback =
      action === "accept" ? onAccept : onReject;

    if (typeof callback !== "function") {
      setError(`The ${action} action is not configured.`);
      return;
    }

    setProcessing(true);
    setError("");

    try {
      await callback(ride);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          `Unable to ${action} this ride. Please try again.`
      );
    } finally {
      setProcessing(false);
    }
  }

  return (
    <article
      className={`rounded-3xl border border-white/10 bg-[#0d1523] p-5 transition hover:border-lime-300/20 sm:p-6 ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-300/10 text-xl text-lime-300">
            <FaCarSide />
          </span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Incoming request
            </p>

            <h3 className="mt-1 text-lg font-black text-white">
              Ride #{String(id ?? "—")}
            </h3>
          </div>
        </div>

        <StatusBadge status={ride.status || "requested"} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
          <p className="text-xs text-slate-500">Estimated fare</p>

          <p className="mt-2 text-xl font-black text-lime-300">
            {formatINR(fare)}
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
          <p className="text-xs text-slate-500">Ride type</p>

          <p className="mt-2 flex items-center gap-2 text-sm font-bold capitalize text-white">
            <FaRoute className="text-lime-300" />

            {rideType
              ? String(rideType).replaceAll("_", " ")
              : "Not specified"}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-white/[0.025] p-4">
        <div className="flex items-start gap-3">
          <FaLocationDot className="mt-1 shrink-0 text-lime-300" />

          <div className="min-w-0">
            <p className="text-xs text-slate-500">Pickup location</p>

            <p className="mt-1 break-words text-sm font-medium text-slate-200">
              {pickup || "Pickup address unavailable"}
            </p>
          </div>
        </div>

        <div className="ml-[7px] my-3 h-5 border-l border-dashed border-white/20" />

        <div className="flex items-start gap-3">
          <FaLocationDot className="mt-1 shrink-0 text-orange-300" />

          <div className="min-w-0">
            <p className="text-xs text-slate-500">Destination</p>

            <p className="mt-1 break-words text-sm font-medium text-slate-200">
              {destination || "Destination address unavailable"}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <FaClock />
        Requested: {formatDate(requestedAt)}
      </p>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200"
        >
          {error}
        </p>
      )}

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => handleAction("reject")}
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3.5 text-sm font-bold text-slate-300 transition hover:border-red-400/30 hover:bg-red-400/5 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FaXmark />
          {busy ? "Processing..." : "Reject"}
        </button>

        <button
          type="button"
          onClick={() => handleAction("accept")}
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-xl bg-lime-300 px-4 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FaCheck />
          {busy ? "Processing..." : "Accept ride"}
          {!busy && <FaArrowRight />}
        </button>
      </div>
    </article>
  );
}