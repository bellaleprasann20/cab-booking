import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaCarSide,
  FaCircleCheck,
  FaFloppyDisk,
  FaIdCard,
  FaShieldHalved,
  FaUser,
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

const emptyForm = {
  name: "",
  phone: "",
  vehicle_model: "",
  vehicle_number: "",
  vehicle_color: "",
};

export default function DriverProfilePage() {
  const [form, setForm] = useState(emptyForm);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get(`${API}/drivers/me`, authConfig());
        const data = response.data?.driver ?? response.data;
        const user = data?.user ?? {};
        const vehicle = data?.vehicle ?? {};

        if (!active) return;

        setProfile(data);
        setForm({
          name: data?.name ?? data?.full_name ?? user.name ?? "",
          phone: data?.phone ?? user.phone ?? "",
          vehicle_model: data?.vehicle_model ?? vehicle.model ?? "",
          vehicle_number: data?.vehicle_number ?? vehicle.registration_number ?? "",
          vehicle_color: data?.vehicle_color ?? vehicle.color ?? "",
        });
      } catch (err) {
        if (active) {
          setError(getErrorMessage(err, "Unable to load your profile. Check the driver profile API."));
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      vehicle_model: form.vehicle_model.trim(),
      vehicle_number: form.vehicle_number.trim().toUpperCase(),
      vehicle_color: form.vehicle_color.trim(),
    };

    try {
      const response = await axios.patch(`${API}/drivers/me`, payload, authConfig());
      const updated = response.data?.driver ?? response.data;

      setProfile((previous) => ({
        ...previous,
        ...updated,
        user: { ...(previous?.user ?? {}), ...(updated?.user ?? {}) },
        vehicle: { ...(previous?.vehicle ?? {}), ...(updated?.vehicle ?? {}) },
      }));

      setForm((previous) => ({ ...previous, ...payload }));
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(getErrorMessage(err, "Could not update your profile. Check the accepted profile fields."));
    } finally {
      setSaving(false);
    }
  }

  const verification = String(
    profile?.verification_status ??
      (profile?.is_verified === true
        ? "verified"
        : profile?.is_verified === false
          ? "pending"
          : "unknown")
  ).toLowerCase();

  const verified = ["verified", "approved", "active"].includes(verification);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080d18] text-white">
        <p className="text-slate-400">Loading driver profile...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080d18] text-white">
      <header className="border-b border-white/10 bg-[#0c1422]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-5 sm:px-8">
          <Link to="/driver/dashboard" className="flex items-center gap-2 text-sm text-slate-300 hover:text-lime-300">
            <FaArrowLeft /> Dashboard
          </Link>
          <Link to="/" className="text-lg font-black">
            GoCab<span className="text-lime-300">.</span>
          </Link>
          <span className="text-xs font-semibold text-slate-400">Driver profile</span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-9 sm:px-8 lg:py-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">
          Account settings
        </p>
        <h1 className="mt-3 text-3xl font-black sm:text-4xl">Driver profile</h1>
        <p className="mt-2 text-sm text-slate-400">
          Manage your contact and vehicle information.
        </p>

        {error && (
          <div role="alert" className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div role="status" className="mt-6 rounded-2xl border border-lime-300/20 bg-lime-300/10 p-4 text-sm text-lime-200">
            {success}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <aside className="space-y-5">
            <section className="rounded-3xl border border-white/10 bg-[#0d1523] p-6 sm:p-7">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-lime-300/10 text-3xl text-lime-300">
                <FaUser />
              </div>
              <h2 className="mt-5 text-xl font-black">{form.name || "Driver"}</h2>
              <p className="mt-1 break-all text-sm text-slate-400">
                {profile?.email || profile?.user?.email || "Email not provided"}
              </p>

              <div className={`mt-5 flex items-center gap-3 rounded-2xl border p-4 ${
                verified
                  ? "border-lime-300/20 bg-lime-300/[0.06]"
                  : "border-amber-300/20 bg-amber-300/[0.06]"
              }`}>
                {verified ? (
                  <FaCircleCheck className="text-xl text-lime-300" />
                ) : (
                  <FaShieldHalved className="text-xl text-amber-300" />
                )}
                <div>
                  <p className="text-sm font-bold">
                    {verified ? "Verified driver" : "Verification pending"}
                  </p>
                  <p className="mt-1 text-xs capitalize text-slate-400">
                    Server status: {verification.replaceAll("_", " ")}
                  </p>
                </div>
              </div>

              <p className="mt-5 text-xs leading-6 text-slate-500">
                Driver approval and identity verification are controlled by the platform.
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-[#0d1523] p-6">
              <div className="flex items-center gap-3">
                <FaCarSide className="text-xl text-lime-300" />
                <h2 className="font-bold">Vehicle summary</h2>
              </div>
              <p className="mt-4 text-lg font-bold">{form.vehicle_model || "Vehicle not added"}</p>
              <p className="mt-2 text-sm text-slate-400">
                {form.vehicle_number || "Registration number not added"}
              </p>
              {form.vehicle_color && (
                <p className="mt-2 text-sm text-slate-400">Color: {form.vehicle_color}</p>
              )}
            </section>
          </aside>

          <section className="rounded-3xl border border-white/10 bg-[#0d1523] p-5 sm:p-8">
            <div className="flex items-center gap-3">
              <FaIdCard className="text-xl text-lime-300" />
              <div>
                <h2 className="text-lg font-bold">Personal and vehicle details</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Update the fields supported by your account.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-semibold">Full name</label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  maxLength={120}
                  autoComplete="name"
                  className="w-full rounded-xl border border-white/10 bg-[#101827] px-4 py-3.5 text-sm outline-none focus:border-lime-300/50"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-semibold">Phone number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  maxLength={20}
                  autoComplete="tel"
                  className="w-full rounded-xl border border-white/10 bg-[#101827] px-4 py-3.5 text-sm outline-none focus:border-lime-300/50"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="border-t border-white/10 pt-5">
                <h3 className="font-bold">Vehicle information</h3>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Enter accurate details for the vehicle registered with the platform.
                </p>
              </div>

              <div>
                <label htmlFor="vehicle_model" className="mb-2 block text-sm font-semibold">Vehicle make and model</label>
                <input
                  id="vehicle_model"
                  name="vehicle_model"
                  value={form.vehicle_model}
                  onChange={handleChange}
                  maxLength={100}
                  className="w-full rounded-xl border border-white/10 bg-[#101827] px-4 py-3.5 text-sm outline-none focus:border-lime-300/50"
                  placeholder="e.g. vehicle make and model"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="vehicle_number" className="mb-2 block text-sm font-semibold">Registration number</label>
                  <input
                    id="vehicle_number"
                    name="vehicle_number"
                    value={form.vehicle_number}
                    onChange={handleChange}
                    maxLength={30}
                    className="w-full rounded-xl border border-white/10 bg-[#101827] px-4 py-3.5 text-sm uppercase outline-none focus:border-lime-300/50"
                    placeholder="Vehicle registration"
                  />
                </div>
                <div>
                  <label htmlFor="vehicle_color" className="mb-2 block text-sm font-semibold">Vehicle color</label>
                  <input
                    id="vehicle_color"
                    name="vehicle_color"
                    value={form.vehicle_color}
                    onChange={handleChange}
                    maxLength={40}
                    className="w-full rounded-xl border border-white/10 bg-[#101827] px-4 py-3.5 text-sm outline-none focus:border-lime-300/50"
                    placeholder="Vehicle color"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-lime-300 px-5 py-4 font-bold text-slate-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaFloppyDisk /> {saving ? "Saving changes..." : "Save changes"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}