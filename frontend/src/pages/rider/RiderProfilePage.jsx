
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaShieldHalved,
  FaCalendarDays,
  FaCircleCheck,
  FaCircleExclamation,
  FaFloppyDisk,
  FaRotate,
} from "react-icons/fa6";

import Navbar from "../../components/layout/Navbar";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"
).replace(/\/+$/, "");

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function getErrorMessage(error, fallback) {
  const detail = error.response?.data?.detail;

  if (typeof detail === "string") return detail;

  if (error.code === "ERR_NETWORK") {
    return "Cannot connect to GoCab's backend. Start your FastAPI server and try again.";
  }

  return fallback;
}

export default function RiderProfilePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => readStoredUser());
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/signin", { replace: true });
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!active) return;

        const profile = response.data?.user || response.data;

        setUser(profile);
        setForm({
          full_name: profile.full_name || profile.name || "",
          email: profile.email || "",
          phone: profile.phone || profile.phone_number || "",
        });

        localStorage.setItem("user", JSON.stringify(profile));
        setError("");
      } catch (err) {
        if (!active) return;

        if ([401, 403].includes(err.response?.status)) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          navigate("/signin", { replace: true });
          return;
        }

        setError(
          getErrorMessage(err, "Unable to load your profile.")
        );

        // Show cached profile information if the backend is unavailable.
        const cachedUser = readStoredUser();

        if (cachedUser) {
          setUser(cachedUser);
          setForm({
            full_name: cachedUser.full_name || cachedUser.name || "",
            email: cachedUser.email || "",
            phone: cachedUser.phone || cachedUser.phone_number || "",
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [navigate]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setSuccess("");
  }

  async function handleSave(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/signin", { replace: true });
      return;
    }

    setSaving(true);

    try {
      /*
       * Connect this to your backend's actual profile-update endpoint.
       * Change the URL and payload if your FastAPI schema differs.
       */
      const response = await axios.patch(
        `${API_URL}/users/me`,
        {
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedProfile =
        response.data?.user || response.data;

      const nextUser = {
        ...user,
        ...updatedProfile,
        full_name:
          updatedProfile.full_name ||
          form.full_name.trim(),
        email: updatedProfile.email || form.email,
        phone:
          updatedProfile.phone ||
          updatedProfile.phone_number ||
          form.phone.trim(),
      };

      setUser(nextUser);
      setForm({
        full_name: nextUser.full_name || "",
        email: nextUser.email || "",
        phone: nextUser.phone || "",
      });

      localStorage.setItem("user", JSON.stringify(nextUser));
      setSuccess("Your profile has been updated.");
    } catch (err) {
      if ([401, 403].includes(err.response?.status)) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        navigate("/signin", { replace: true });
        return;
      }

      setError(
        getErrorMessage(
          err,
          "Unable to save your profile. Check your backend endpoint and try again."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  const displayName =
    user?.full_name ||
    user?.name ||
    user?.email ||
    "GoCab Rider";

  const initial = displayName.trim().charAt(0).toUpperCase() || "R";
  const role = user?.role || "rider";

  return (
    <main className="min-h-screen bg-[#030d1b] text-white">
      

      <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-7 sm:py-10 lg:px-10 lg:py-12">
        {/* Page heading */}
        <header className="mb-8">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.25em] text-lime-300">
            Account Settings
          </p>

          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            My Profile<span className="text-lime-300">.</span>
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            Manage your personal information and keep your GoCab
            account details up to date.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-200"
          >
            <FaExclamationCircle className="mt-1 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-xl border border-lime-300/20 bg-lime-300/5 p-4 text-sm text-lime-200"
          >
            <FaCircleCheck className="mt-1 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-[#20334b] bg-[#09182a]">
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-lime-300" />
            <p className="text-sm text-slate-400">
              Loading your profile...
            </p>
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            {/* Profile summary */}
            <aside className="overflow-hidden rounded-2xl border border-[#20334b] bg-gradient-to-br from-[#0c1b2e] to-[#061221]">
              <div className="h-24 bg-gradient-to-r from-lime-300/20 via-lime-300/5 to-transparent" />

              <div className="px-6 pb-7">
                <div className="-mt-11 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-[#0b192a] bg-lime-300 text-3xl font-black text-[#07111f] shadow-lg">
                  {initial}
                </div>

                <h2 className="mt-5 break-words text-xl font-extrabold">
                  {displayName}
                </h2>

                <p className="mt-1 break-all text-sm text-slate-400">
                  {user?.email || "No email available"}
                </p>

                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-2 text-xs font-bold capitalize text-lime-300">
                  <FaCircleCheck />
                  {role}
                </div>

                <div className="mt-7 space-y-4 border-t border-white/10 pt-5">
                  <div className="flex items-start gap-3 text-sm">
                    <FaShieldHalved className="mt-1 text-lime-300" />
                    <div>
                      <p className="font-bold text-slate-200">
                        Account security
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        Keep your account details current.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-sm">
                    <FaCalendarDays className="mt-1 text-lime-300" />
                    <div>
                      <p className="font-bold text-slate-200">
                        GoCab member
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        Your rider account at a glance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Editable profile form */}
            <section className="rounded-2xl border border-[#20334b] bg-gradient-to-br from-[#0a192c] to-[#061221] p-5 sm:p-7 lg:p-8">
              <div className="mb-7 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold sm:text-2xl">
                    Personal Information
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Review and update your profile details.
                  </p>
                </div>

                <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lime-300/10 text-xl text-lime-300 sm:flex">
                  <FaUser />
                </span>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label
                    htmlFor="full_name"
                    className="mb-2 block text-sm font-bold text-slate-200"
                  >
                    Full Name
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border border-[#263b56] bg-[#071426] px-4 transition focus-within:border-lime-300/60">
                    <FaUser className="shrink-0 text-slate-500" />

                    <input
                      id="full_name"
                      name="full_name"
                      type="text"
                      autoComplete="name"
                      value={form.full_name}
                      onChange={handleChange}
                      required
                      maxLength={100}
                      placeholder="Enter your full name"
                      className="min-w-0 flex-1 bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-bold text-slate-200"
                  >
                    Email Address
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border border-[#263b56] bg-[#071426] px-4">
                    <FaEnvelope className="shrink-0 text-slate-500" />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      readOnly
                      aria-describedby="email-help"
                      className="min-w-0 flex-1 cursor-not-allowed bg-transparent py-3.5 text-sm text-slate-400 outline-none"
                    />
                  </div>

                  <p
                    id="email-help"
                    className="mt-2 text-xs text-slate-500"
                  >
                    Email is read-only on this page.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-bold text-slate-200"
                  >
                    Phone Number
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border border-[#263b56] bg-[#071426] px-4 transition focus-within:border-lime-300/60">
                    <FaPhone className="shrink-0 text-slate-500" />

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={handleChange}
                      maxLength={20}
                      placeholder="Enter your phone number"
                      className="min-w-0 flex-1 bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      const cachedUser = readStoredUser() || user;

                      setForm({
                        full_name:
                          cachedUser?.full_name ||
                          cachedUser?.name ||
                          "",
                        email: cachedUser?.email || "",
                        phone:
                          cachedUser?.phone ||
                          cachedUser?.phone_number ||
                          "",
                      });

                      setError("");
                      setSuccess("");
                    }}
                    disabled={saving}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#30445e] px-6 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FaRotate />
                    Reset
                  </button>

                  <button
                    type="submit"
                    disabled={saving || !form.full_name.trim()}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-lime-300 px-7 py-3 text-sm font-extrabold text-[#07111f] transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FaFloppyDisk />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
