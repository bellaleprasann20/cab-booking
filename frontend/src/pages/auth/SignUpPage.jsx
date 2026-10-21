
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaArrowRight,
  FaCarSide,
  FaCheck,
  FaEye,
  FaEyeSlash,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaCar,
  FaUserCheck,
} from "react-icons/fa6";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"
).replace(/\/$/, "");

const accountTypes = [
  {
    value: "rider",
    title: "Rider",
    description: "Book rides and manage your journeys.",
    icon: FaCar,
  },
  {
    value: "driver",
    title: "Driver",
    description: "Access ride requests and manage trips.",
    icon: FaUserCheck,
  },
];

export default function SignUpPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "rider",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();

    if (name.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
      setError(
        "Enter your phone in international format, e.g. +919876543210."
      );
      return;
    }

    if (form.password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    if (!["rider", "driver"].includes(form.role)) {
      setError("Please select a valid account type.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        phone,
        password: form.password,
        role: form.role,
      });

      navigate("/signin", {
        replace: true,
        state: {
          message: "Your account was created. Please sign in to continue.",
        },
      });
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      const message = err.response?.data?.error?.message;

      if (status === 409) {
        setError("An account with these details may already exist.");
      } else if (status === 422 && Array.isArray(detail)) {
        setError(
          detail
            .map((item) => item.msg)
            .filter(Boolean)
            .join(" ")
        );
      } else {
        setError(
          message ||
            (typeof detail === "string" ? detail : "") ||
            "Unable to create your account. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080d18] px-5 py-8 text-white sm:px-8 sm:py-12">
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-[30rem] w-[30rem] rounded-full bg-lime-300/[0.07] blur-[130px]" />

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-300 text-slate-950">
              <FaCarSide size={23} />
            </span>

            <span className="text-xl font-black tracking-tight">
              GoCab<span className="text-lime-300">.</span>
            </span>
          </Link>

          <p className="text-right text-sm text-slate-400">
            Already a member?{" "}
            <Link
              to="/signin"
              className="font-bold text-lime-300 transition hover:text-lime-200"
            >
              Sign in
            </Link>
          </p>
        </header>

        <div className="mx-auto grid max-w-5xl gap-12 py-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:py-16">
          {/* Intro panel */}
          <section className="hidden lg:block">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/[0.07] px-4 py-2 text-xs font-semibold text-lime-200">
              <span className="h-2 w-2 rounded-full bg-lime-300" />
              Make your next move
            </div>

            <h1 className="text-5xl font-black leading-[1.08] tracking-[-0.045em]">
              Your journey
              <br />
              starts with
              <br />
              <span className="text-lime-300">one account.</span>
            </h1>

            <p className="mt-6 max-w-md leading-8 text-slate-400">
              Create your GoCab account to explore a simple ride-booking
              experience, manage your trips, and keep your journey details
              together.
            </p>

            <div className="mt-10 space-y-5">
              {[
                "A straightforward registration process",
                "A dedicated experience for your role",
                "Access your account from your devices",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-300/10 text-lime-300">
                    <FaCheck size={10} />
                  </span>
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.025] p-6">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-300/10 text-xl text-lime-300">
                  <FaLock />
                </span>

                <div>
                  <p className="font-bold">Your account matters</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Use a strong, unique password to help protect your account.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Registration form */}
          <section className="rounded-[2rem] border border-white/10 bg-[#0d1523]/90 p-5 shadow-2xl shadow-black/20 sm:p-8 lg:p-9">
            <div className="mb-7">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-lime-300">
                Create your account
              </p>

              <h2 className="text-3xl font-black tracking-tight">
                Join GoCab
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Enter your details to get started.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/[0.08] px-4 py-3 text-sm leading-6 text-red-200"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Account type */}
              <fieldset>
                <legend className="mb-3 text-sm font-semibold text-slate-200">
                  I want to join as
                </legend>

                <div className="grid grid-cols-2 gap-3">
                  {accountTypes.map(
                    ({ value, title, description, icon: Icon }) => {
                      const selected = form.role === value;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setForm((previous) => ({
                              ...previous,
                              role: value,
                            }));
                            setError("");
                          }}
                          aria-pressed={selected}
                          className={`relative rounded-2xl border p-4 text-left transition ${
                            selected
                              ? "border-lime-300/60 bg-lime-300/[0.08]"
                              : "border-white/10 bg-[#101827] hover:border-white/25"
                          }`}
                        >
                          <span
                            className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${
                              selected
                                ? "bg-lime-300 text-slate-950"
                                : "bg-white/5 text-slate-300"
                            }`}
                          >
                            <Icon />
                          </span>

                          <span className="block text-sm font-bold">
                            {title}
                          </span>

                          <span className="mt-1 block text-xs leading-5 text-slate-400">
                            {description}
                          </span>

                          {selected && (
                            <FaCheck className="absolute right-3 top-3 text-xs text-lime-300" />
                          )}
                        </button>
                      );
                    }
                  )}
                </div>

                {form.role === "driver" && (
                  <p className="mt-3 text-xs leading-5 text-amber-200/80">
                    Driver access may require additional verification and
                    approval by your platform administrator.
                  </p>
                )}
              </fieldset>

              {/* Full name */}
              <div>
                <label
                  htmlFor="signup-name"
                  className="mb-2 block text-sm font-semibold text-slate-200"
                >
                  Full name
                </label>

                <div className="relative">
                  <FaUser className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />

                  <input
                    id="signup-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={updateField}
                    required
                    minLength={2}
                    maxLength={100}
                    className="w-full rounded-2xl border border-white/10 bg-[#101827] py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-600 focus:border-lime-300/60 focus:ring-2 focus:ring-lime-300/10"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="signup-email"
                  className="mb-2 block text-sm font-semibold text-slate-200"
                >
                  Email address
                </label>

                <div className="relative">
                  <FaEnvelope className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />

                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={updateField}
                    required
                    maxLength={254}
                    className="w-full rounded-2xl border border-white/10 bg-[#101827] py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-600 focus:border-lime-300/60 focus:ring-2 focus:ring-lime-300/10"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="signup-phone"
                  className="mb-2 block text-sm font-semibold text-slate-200"
                >
                  Phone number
                </label>

                <div className="relative">
                  <FaPhone className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />

                  <input
                    id="signup-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+919876543210"
                    value={form.phone}
                    onChange={updateField}
                    required
                    maxLength={16}
                    className="w-full rounded-2xl border border-white/10 bg-[#101827] py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-600 focus:border-lime-300/60 focus:ring-2 focus:ring-lime-300/10"
                  />
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Include your country code, for example +91.
                </p>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="signup-password"
                  className="mb-2 block text-sm font-semibold text-slate-200"
                >
                  Password
                </label>

                <div className="relative">
                  <FaLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />

                  <input
                    id="signup-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={updateField}
                    required
                    minLength={8}
                    maxLength={128}
                    className="w-full rounded-2xl border border-white/10 bg-[#101827] py-3.5 pl-11 pr-12 text-sm outline-none transition placeholder:text-slate-600 focus:border-lime-300/60 focus:ring-2 focus:ring-lime-300/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-lime-300"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label
                  htmlFor="signup-confirm-password"
                  className="mb-2 block text-sm font-semibold text-slate-200"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <FaLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />

                  <input
                    id="signup-confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Enter your password again"
                    value={form.confirmPassword}
                    onChange={updateField}
                    required
                    maxLength={128}
                    className="w-full rounded-2xl border border-white/10 bg-[#101827] py-3.5 pl-11 pr-12 text-sm outline-none transition placeholder:text-slate-600 focus:border-lime-300/60 focus:ring-2 focus:ring-lime-300/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((value) => !value)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-lime-300"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-3 text-xs leading-6 text-slate-400">
                <input
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 shrink-0 accent-lime-300"
                />

                <span>
                  I confirm that the information provided is accurate and
                  agree to the platform&apos;s applicable terms and privacy
                  policy.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-lime-300 px-5 py-4 font-bold text-slate-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating your account..." : "Create account"}

                {!loading && (
                  <FaArrowRight className="transition group-hover:translate-x-1" />
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs leading-6 text-slate-500">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="font-bold text-lime-300 hover:text-lime-200"
              >
                Sign in
              </Link>
            </p>
          </section>
        </div>

        <footer className="text-center text-xs text-slate-600">
          © {new Date().getFullYear()} GoCab. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
