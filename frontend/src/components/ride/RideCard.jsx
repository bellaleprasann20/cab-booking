import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaCalendar,
  FaCarSide,
  FaLocationDot,
  FaRoute,
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
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function RideCard({
  ride,
  onView,
  detailsTo,
  className = "",
}) {
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
    ride.total_fare ??
    ride.estimated_fare;

  const date = ride.created_at ?? ride.requested_at;
  const rideType = ride.ride_type ?? ride.vehicle_type;

  const driver =
    ride.driver ??
    ride.assigned_driver ??
    null;

  const driverName =
    driver?.full_name ??
    driver?.name ??
    ride.driver_name;

  const driverPhone =
    driver?.phone_number ??
    driver?.phone ??
    ride.driver_phone;

  const action = onView ? (
    <button
      type="button"
      onClick={() => onView(ride)}
      className="inline-flex items-center gap-2 text-sm font-bold text-lime-300 transition hover:text-lime-200"
    >
      View details <FaArrowRight />
    </button>
  ) : detailsTo ? (
    <Link
      to={detailsTo}
      className="inline-flex items-center gap-2 text-sm font-bold text-lime-300 transition hover:text-lime-200"
    >
      View details <FaArrowRight />
    </Link>
  ) : null;

  return (
    <article
      className={`rounded-2xl border border-white/10 bg-[#0d1523] p-5 transition hover:border-lime-300/20 sm:p-6 ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Ride ID
          </p>

          <h3 className="mt-1 text-lg font-black text-white">
            #{String(id ?? "—")}
          </h3>

          <p className="mt-2 flex items-center gap-2 text-xs text-slate-400">
            <FaCalendar />
            {formatDate(date)}
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <StatusBadge status={ride.status} />

          <p className="text-xl font-black text-lime-300">
            {formatINR(fare)}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-white/[0.025] p-4">
        <div className="flex gap-3">
          <FaLocationDot className="mt-1 shrink-0 text-lime-300" />

          <div className="min-w-0">
            <p className="text-xs text-slate-500">Pickup</p>

            <p className="mt-1 break-words text-sm font-medium text-slate-200">
              {pickup || "Pickup address unavailable"}
            </p>
          </div>
        </div>

        <div className="ml-[7px] my-2 h-5 border-l border-dashed border-white/20" />

        <div className="flex gap-3">
          <FaLocationDot className="mt-1 shrink-0 text-orange-300" />

          <div className="min-w-0">
            <p className="text-xs text-slate-500">Destination</p>

            <p className="mt-1 break-words text-sm font-medium text-slate-200">
              {destination || "Destination address unavailable"}
            </p>
          </div>
        </div>
      </div>

      {driver && (
        <div className="mt-4 rounded-xl border border-lime-300/10 bg-lime-300/[0.04] p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-lime-300">
            Assigned driver
          </p>

          <p className="mt-2 font-bold text-white">
            {driverName || "Driver assigned"}
          </p>

          {driverPhone && (
            <a
              href={`tel:${String(driverPhone).replace(/[^\d+]/g, "")}`}
              className="mt-1 inline-block text-sm text-slate-300 hover:text-lime-300"
            >
              {driverPhone}
            </a>
          )}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {rideType ? <FaCarSide /> : <FaRoute />}

          <span className="capitalize">
            {rideType
              ? String(rideType).replaceAll("_", " ")
              : "Ride"}
          </span>
        </div>

        {action}
      </div>
    </article>
  );
}