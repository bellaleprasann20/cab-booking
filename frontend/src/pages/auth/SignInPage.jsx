
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaArrowRight,
  FaCarSide,
  FaCheck,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaShieldHalved,
  FaEnvelope,
} from "react-icons/fa6";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"
).replace(/\/$/, "");

const roleRoutes = {
  rider: "/rider/dashboard",
  driver: "/driver/dashboard",
  admin: "/admin/dashboard",
};

function Brand() {
  return (
    <Link to="/" className="inline-flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-300 text-slate-950">
        <FaCarSide size={23} />
      </span>

      <span className="text-xl font-black tracking-tight text-white">
        GoCab<span className="text-lime-300">.</span>
      </span>
    </Link>
  );
}

export default function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(location.state?.message || "");

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setNotice("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const email = form.email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!form.password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password: form.password,
      });

      const data = response.data;
      const token = data.access_token || data.token;
      const user = data.user || data;

      if (!token || !user.role) {
        setError(
          "The server response is missing the login token or user role. Check your authentication API response."
        );
        return;
      }

      const role = String(user.role).toLowerCase();
      const destination = roleRoutes[role];

      if (!destination) {
        setError("Your account has an unsupported role.");
        return;
      }

      const normalizedUser = {
        ...user,
        role,
      };

      localStorage.setItem("access_token", token);
      localStorage.setItem("user", JSON.stringify(normalizedUser));

      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }

      const requestedPath = location.state?.from?.pathname;
      const allowedRequestedPath =
        requestedPath &&
        requestedPath.startsWith("/") &&
        !requestedPath.startsWith("//") &&
        requestedPath !== "/signin" &&
        requestedPath !== "/signup" &&
        requestedPath !== "/login" &&
        requestedPath !== "/register";

      navigate(
        allowedRequestedPath ? requestedPath : destination,
        { replace: true }
      );
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      const message = err.response?.data?.error?.message;

      if (status === 401) {
        setError("Incorrect email or password. Please try again.");
      } else if (status === 429) {
        setError("Too many attempts. Please wait before trying again.");
      } else if (Array.isArray(detail)) {
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
            "Unable to sign in. Check your connection and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#080d18] text-white">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-[30rem] w-[30rem] rounded-full bg-lime-300/[0.07] blur-[130px]" />

      {/* Left visual panel */}
      <aside className="relative hidden w-[46%] flex-col justify-between overflow-hidden border-r border-white/10 bg-[#0c1422] p-12 xl:flex">
        <Brand />

        <div className="relative z-10 max-w-xl py-12">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/[0.07] px-4 py-2 text-xs font-semibold text-lime-200">
            <FaShieldHalved />
            Your journey starts here
          </div>

          <h1 className="text-5xl font-black leading-[1.08] tracking-[-0.045em] 2xl:text-6xl">
            Every journey
            <br />
            begins with
            <br />
            <span className="text-lime-300">a little trust.</span>
          </h1>

          <p className="mt-7 max-w-md leading-8 text-slate-400">
            Sign in to manage your rides, view trip details, and enjoy a
            straightforward booking experience.
          </p>

          <div className="mt-10 space-y-4">
            {[
              "Simple ride booking",
              "Clear fare information",
              "Access to your trip history",
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
        </div>

        <div className="relative z-10 border-t border-white/10 pt-5 text-xs text-slate-500">
          GoCab · A thoughtful ride-booking experience
        </div>

        <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full border border-lime-300/10" />
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-56 w-56 rounded-full border border-lime-300/10" />
      </aside>

      {/* Sign-in form */}
      <section className="relative flex flex-1 items-center justify-center px-5 py-12 sm:px-10 lg:px-14">
        <div className="w-full max-w-md">
          <div className="mb-10 xl:hidden">
            <Brand />
          </div>

          <div className="mb-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-lime-300">
              Welcome back
            </p>

            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Sign in to GoCab
            </h2>

            <p className="mt-3 leading-7 text-slate-400">
              Enter your account details to continue your journey.
            </p>
          </div>

          {notice && (
            <div
              role="status"
              className="mb-5 rounded-2xl border border-lime-300/20 bg-lime-300/[0.07] px-4 py-3 text-sm leading-6 text-lime-200"
            >
              {notice}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/[0.08] px-4 py-3 text-sm leading-6 text-red-200"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="signin-email"
                className="mb-2 block text-sm font-semibold text-slate-200"
              >
                Email address
              </label>

              <div className="relative">
                <FaEnvelope className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />

                <input
                  id="signin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={updateField}
                  required
                  maxLength={254}
                  className="w-full rounded-2xl border border-white/10 bg-[#101827] py-4 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-lime-300/60 focus:ring-2 focus:ring-lime-300/10"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="signin-password"
                  className="text-sm font-semibold text-slate-200"
                >
                  Password
                </label>

                <span className="text-xs text-slate-500">
                  Keep your account secure
                </span>
              </div>

              <div className="relative">
                <FaLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />

                <input
                  id="signin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={updateField}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-[#101827] py-4 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-lime-300/60 focus:ring-2 focus:ring-lime-300/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-lime-300"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-lime-300 px-5 py-4 font-bold text-slate-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing you in..." : "Sign in"}

              {!loading && (
                <FaArrowRight className="transition group-hover:translate-x-1" />
              )}
            </button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-slate-500">NEW TO GOCAB?</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <Link
            to="/signup"
            className="flex w-full items-center justify-center rounded-2xl border border-white/15 px-5 py-4 text-sm font-semibold text-white transition hover:border-lime-300/40 hover:bg-white/[0.03]"
          >
            Create an account
          </Link>

          <p className="mt-8 text-center text-xs leading-6 text-slate-500">
            By continuing, you agree to use the platform in accordance with its
            applicable terms and privacy policy.
          </p>

          <Link
            to="/"
            className="mt-6 block text-center text-sm text-slate-400 transition hover:text-lime-300"
          >
            ← Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
