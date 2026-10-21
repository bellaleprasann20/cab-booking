import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaCheck,
  FaMagnifyingGlass,
  FaRotate,
  FaShieldHalved,
  FaUser,
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

function normalizeStatus(value) {
  return String(value || "unknown")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function extractDrivers(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.drivers)) return data.drivers;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function getDriverStatus(driver) {
  if (driver.is_verified === true) return "approved";

  return normalizeStatus(
    driver.verification_status ?? driver.status ?? "pending"
  );
}

function formatDate(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("en-IN");
}

export default function DriverVerificationPage() {
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [actionKey, setActionKey] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadDrivers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${API}/admin/drivers`, {
        ...authConfig(),
        params: filter === "all" ? {} : { verification_status: filter },
      });

      setDrivers(extractDrivers(response.data));
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to load driver records. Verify the admin drivers endpoint and your permissions."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

  const visibleDrivers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return drivers.filter((driver) => {
      const status = getDriverStatus(driver);

      if (filter !== "all" && status !== filter) {
        return false;
      }

      if (!query) return true;

      const user = driver.user || {};
      const vehicle = driver.vehicle || {};

      const searchableText = [
        driver.id,
        driver.driver_id,
        driver.user_id,
        driver.name,
        driver.full_name,
        driver.email,
        driver.phone,
        driver.phone_number,
        driver.vehicle_model,
        driver.vehicle_number,
        driver.license_number,
        driver.driving_license_number,
        user.name,
        user.full_name,
        user.email,
        user.phone,
        user.phone_number,
        vehicle.model,
        vehicle.registration_number,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [drivers, search, filter]);

  async function reviewDriver(driver, decision) {
    const id = driver.id ?? driver.driver_id ?? driver.user_id;

    if (id == null || actionKey !== null) return;

    const name =
      driver.name ||
      driver.full_name ||
      driver.user?.name ||
      `driver #${id}`;

    const actionText = decision === "approve" ? "approve" : "reject";

    if (!window.confirm(`Are you sure you want to ${actionText} ${name}?`)) {
      return;
    }

    setActionKey(String(id));
    setError("");
    setNotice("");

    try {
      await axios.patch(
        `${API}/admin/drivers/${encodeURIComponent(String(id))}/verification`,
        {
          status: decision === "approve" ? "approved" : "rejected",
        },
        authConfig()
      );

      setNotice(
        `${name} ${decision === "approve" ? "approved" : "rejected"} successfully.`
      );

      await loadDrivers();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          `Unable to ${actionText} this driver. Check the backend verification route and payload.`
        )
      );
    } finally {
      setActionKey(null);
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
            onClick={loadDrivers}
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
          Trust and safety
        </p>

        <h1 className="mt-3 text-3xl font-black sm:text-4xl">
          Driver verification
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Review driver account and vehicle details before making an approval
          decision.
        </p>

        <section className="mt-8 rounded-3xl border border-white/10 bg-[#0d1523] p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <FaMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, vehicle or ID..."
                aria-label="Search drivers"
                className="w-full rounded-xl border border-white/10 bg-[#101827] py-3.5 pl-11 pr-4 text-sm outline-none focus:border-lime-300/50"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                ["pending", "Pending"],
                ["approved", "Approved"],
                ["rejected", "Rejected"],
                ["all", "All drivers"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setFilter(value);
                    setNotice("");
                  }}
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
          </div>

          {(error || notice) && (
            <div
              role={error ? "alert" : "status"}
              className={`mt-5 rounded-xl border p-4 text-sm ${
                error
                  ? "border-red-400/20 bg-red-400/10 text-red-200"
                  : "border-lime-300/20 bg-lime-300/10 text-lime-200"
              }`}
            >
              {error || notice}
            </div>
          )}
        </section>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
          <span>
            {loading
              ? "Loading records..."
              : `${visibleDrivers.length} driver record(s)`}
          </span>
          <span className="capitalize">Filter: {filter.replaceAll("_", " ")}</span>
        </div>

        {loading ? (
          <div className="mt-5 rounded-3xl border border-white/10 bg-[#0d1523] p-12 text-center text-slate-400">
            Loading driver applications...
          </div>
        ) : visibleDrivers.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-white/10 bg-[#0d1523] px-6 py-16 text-center">
            <FaShieldHalved className="mx-auto text-3xl text-slate-500" />
            <h2 className="mt-4 text-xl font-bold">
              No matching driver records
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              No records match the current filter and search.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            {visibleDrivers.map((driver, index) => {
              const id = driver.id ?? driver.driver_id ?? driver.user_id;

              const name =
                driver.name ||
                driver.full_name ||
                driver.user?.name ||
                driver.user?.full_name ||
                "Unnamed driver";

              const email =
                driver.email || driver.user?.email || "Email unavailable";

              const status = getDriverStatus(driver);
              const busy = actionKey === String(id);

              const pending = [
                "pending",
                "submitted",
                "under_review",
              ].includes(status);

              return (
                <article
                  key={id ?? index}
                  className="rounded-3xl border border-white/10 bg-[#0d1523] p-5 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lime-300/10 text-xl text-lime-300">
                        <FaUser />
                      </span>

                      <div className="min-w-0">
                        <h2 className="break-words font-bold">{name}</h2>
                        <p className="mt-1 break-all text-xs text-slate-400">
                          {email}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Driver ID: {String(id ?? "—")}
                        </p>
                      </div>
                    </div>

                    <StatusPill status={status} />
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <Detail
                      label="Phone"
                      value={
                        driver.phone ||
                        driver.phone_number ||
                        driver.user?.phone ||
                        driver.user?.phone_number
                      }
                    />
                    <Detail
                      label="Vehicle"
                      value={driver.vehicle_model || driver.vehicle?.model}
                    />
                    <Detail
                      label="Registration"
                      value={
                        driver.vehicle_number ||
                        driver.vehicle?.registration_number
                      }
                    />
                    <Detail
                      label="License number"
                      value={
                        driver.license_number ||
                        driver.driving_license_number
                      }
                    />
                    <Detail
                      label="Submitted"
                      value={formatDate(driver.created_at)}
                    />
                    <Detail
                      label="Verification notes"
                      value={
                        driver.verification_notes || driver.rejection_reason
                      }
                    />
                  </div>

                  {pending && (
                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => reviewDriver(driver, "reject")}
                        disabled={actionKey !== null}
                        className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 font-bold text-slate-300 hover:border-red-300/40 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <FaXmark />
                        {busy ? "Processing..." : "Reject"}
                      </button>

                      <button
                        type="button"
                        onClick={() => reviewDriver(driver, "approve")}
                        disabled={actionKey !== null}
                        className="flex items-center justify-center gap-2 rounded-xl bg-lime-300 px-4 py-3 font-bold text-slate-950 hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <FaCheck />
                        {busy ? "Processing..." : "Approve"}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function StatusPill({ status }) {
  const color = ["approved", "verified"].includes(status)
    ? "bg-lime-300/10 text-lime-200"
    : status === "rejected"
      ? "bg-red-400/10 text-red-200"
      : "bg-amber-300/10 text-amber-200";

  const label = {
    under_review: "Under review",
  }[status] || status.replaceAll("_", " ");

  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${color}`}
    >
      {label}
    </span>
  );
}

function Detail({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl bg-white/[0.035] p-3.5">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold">
        {value == null || value === "" ? "Not provided" : String(value)}
      </p>
    </div>
  );
}