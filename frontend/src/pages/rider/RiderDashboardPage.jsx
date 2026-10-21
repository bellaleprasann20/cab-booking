
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaCar,
  FaHistory,
  FaWallet,
  FaArrowRight,
  FaExclamationCircle,
  FaMapMarkerAlt,
  FaSearch,
  FaBriefcase,
  FaStar,
} from "react-icons/fa";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"
).replace(/\/+$/, "");

const quickLinks = [
  {
    title: "Book a Ride",
    description: "Choose your pickup and destination.",
    path: "/rider/book",
    icon: FaCar,
  },
  {
    title: "Ride History",
    description: "View your previous journeys.",
    path: "/rider/history",
    icon: FaHistory,
  },
  {
    title: "My Wallet",
    description: "Access your wallet section.",
    path: "/rider/wallet",
    icon: FaWallet,
  },
];

function getErrorMessage(err, fallback) {
  const detail = err.response?.data?.detail;
  return typeof detail === "string" ? detail : fallback;
}

export default function RiderDashboardPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [destination, setDestination] = useState("");

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

        if (active) {
          const profile = response.data?.user || response.data;
          setUser(profile);

          // Keep the cached profile available to the shared navbar.
          localStorage.setItem("user", JSON.stringify(profile));
          setError("");
        }
      } catch (err) {
        if (!active) return;

        if ([401, 403].includes(err.response?.status)) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          navigate("/signin", { replace: true });
          return;
        }

        setError(
          getErrorMessage(
            err,
            err.code === "ERR_NETWORK"
              ? "Cannot connect to GoCab's backend. Start your FastAPI server and try again."
              : "Unable to load your profile. Please try again."
          )
        );

        try {
          const cachedUser = localStorage.getItem("user");

          if (cachedUser && active) {
            setUser(JSON.parse(cachedUser));
          }
        } catch {
          // Ignore invalid cached profile data.
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [navigate]);

  function handleDestinationSearch(event) {
    event.preventDefault();

    navigate("/rider/book", {
      state: { destination: destination.trim() },
    });
  }

  function handleSavedPlace(place) {
    if (place === "saved") {
      navigate("/rider/book");
      return;
    }

    // These are convenience labels, not saved addresses.
    setDestination(place === "home" ? "Home" : "Work");
  }

  const firstName =
    user?.name?.trim() ||
    user?.full_name?.trim() ||
    user?.fullName?.trim() ||
    "Rider";

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030d1b] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-lime-300" />
          <p className="text-sm text-slate-300">
            Loading your dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#030d1b] text-white">
      {/* The shared navbar from components/layout should render
          above this page through your existing layout or router. */}

      <div className="min-w-0 px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-200"
          >
            <FaExclamationCircle className="mt-1 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <section className="grid items-start gap-8 xl:grid-cols-[1.02fr_1fr] xl:gap-10">
          <div className="min-w-0">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.25em] text-lime-300">
              Rider Dashboard
            </p>

            <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-[43px]">
              Welcome back,
              <br className="hidden sm:block" />{" "}
              <span className="text-lime-300">{firstName}!</span>
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              Your next journey is just a few clicks away. Book a ride or
              manage your GoCab account from here.
            </p>

            <form
              onSubmit={handleDestinationSearch}
              className="mt-8 rounded-2xl border border-[#20334b] bg-gradient-to-br from-[#0d1c30] to-[#071322] p-3 sm:p-4"
            >
              <div className="flex items-center gap-3 rounded-full border border-[#263b56] bg-[#112238] p-1.5 pl-4 focus-within:border-lime-300/60">
                <FaMapMarkerAlt className="shrink-0 text-xl text-lime-300" />

                <input
                  type="text"
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  placeholder="Where do you want to go?"
                  aria-label="Destination"
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-400 sm:text-base"
                />

                <button
                  type="submit"
                  aria-label="Search destination"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-lime-300 text-lg text-[#07111f] transition hover:bg-lime-200"
                >
                  <FaSearch />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 divide-x divide-[#30445e]">
                <button
                  type="button"
                  onClick={() => handleSavedPlace("home")}
                  className="flex min-w-0 items-start gap-2 rounded-lg px-2 py-2 text-left transition hover:bg-white/5 sm:gap-3 sm:px-3"
                >
                  <FaMapMarkerAlt className="mt-1 shrink-0 text-lg text-indigo-400" />
                  <span>
                    <span className="block text-xs font-bold sm:text-sm">
                      Home
                    </span>
                    <span className="mt-1 block text-[11px] text-slate-400 sm:text-xs">
                      Add address
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSavedPlace("work")}
                  className="flex min-w-0 items-start gap-2 rounded-lg px-2 py-2 text-left transition hover:bg-white/5 sm:gap-3 sm:px-3"
                >
                  <FaBriefcase className="mt-1 shrink-0 text-lg text-indigo-400" />
                  <span>
                    <span className="block text-xs font-bold sm:text-sm">
                      Work
                    </span>
                    <span className="mt-1 block text-[11px] text-slate-400 sm:text-xs">
                      Add address
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSavedPlace("saved")}
                  className="flex min-w-0 items-start gap-2 rounded-lg px-2 py-2 text-left transition hover:bg-white/5 sm:gap-3 sm:px-3"
                >
                  <FaStar className="mt-1 shrink-0 text-lg text-indigo-400" />
                  <span>
                    <span className="block text-xs font-bold sm:text-sm">
                      Saved Places
                    </span>
                    <span className="mt-1 block text-[11px] text-slate-400 sm:text-xs">
                      View all
                    </span>
                  </span>
                </button>
              </div>
            </form>

            <Link
              to="/rider/book"
              state={{ destination: destination.trim() }}
              className="mt-5 inline-flex min-h-[58px] w-full items-center justify-center gap-4 rounded-full bg-lime-300 px-6 py-4 font-extrabold text-[#07111f] transition hover:bg-lime-200 sm:w-auto sm:min-w-[280px]"
            >
              <FaCar className="text-lg" />
              Book your next ride
              <FaArrowRight />
            </Link>
          </div>

          <div className="relative h-[300px] overflow-hidden rounded-2xl border border-[#20334b] bg-[#07182b] sm:h-[370px] xl:h-[415px]">
            <iframe
              title="Map of Bengaluru"
              src="https://www.openstreetmap.org/export/embed.html?bbox=77.50%2C12.90%2C77.70%2C13.10&layer=mapnik"
              className="absolute inset-0 h-full w-full border-0 opacity-80"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#031020]/65 via-transparent to-[#031020]/20" />

            <div className="pointer-events-none absolute left-5 top-5 rounded-xl border border-white/10 bg-[#061426]/85 px-4 py-2 backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-widest text-lime-300">
                Your city
              </p>
              <p className="mt-1 text-xl font-extrabold">Bengaluru</p>
            </div>

            <div className="absolute bottom-4 right-4">
              <a
                href="https://www.openstreetmap.org/#map=12/12.975/77.606"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#031020]/95 px-4 py-3 text-xs font-bold text-white shadow-lg transition hover:text-lime-300"
              >
                <FaMapMarkerAlt className="text-lime-300" />
                Open Live Map
              </a>
            </div>
          </div>
        </section>

        <section className="mt-12 lg:mt-14">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.23em] text-lime-300">
                Quick Access
              </p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Your ride services
              </h2>
            </div>

            <p className="text-sm text-slate-400">
              Manage your rides, wallet and more
              <FaArrowRight className="ml-3 inline text-lime-300" />
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {quickLinks.map(({ title, description, path, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className="group flex min-h-[125px] items-center gap-4 rounded-2xl border border-[#20334b] bg-gradient-to-br from-[#0a192c] to-[#061221] p-5 transition duration-200 hover:-translate-y-1 hover:border-lime-300/40 hover:bg-[#0e2035] sm:p-6"
              >
                <span className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-2xl bg-lime-300/10 text-2xl text-lime-300 transition group-hover:bg-lime-300 group-hover:text-[#07111f]">
                  <Icon />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-base font-extrabold sm:text-lg">
                    {title}
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-slate-400">
                    {description}
                  </span>
                </span>

                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/5 text-lg text-lime-300 transition group-hover:bg-lime-300 group-hover:text-[#07111f]">
                  <FaArrowRight />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-[#16263b] py-6 text-sm text-slate-400">
          <p>
            <span className="font-black text-white">
              GoCab<span className="text-lime-300">.</span>
            </span>
            <span className="ml-3">Rider Portal</span>
          </p>

          <p className="text-xs sm:text-sm">
            Safe <span className="mx-2 text-lime-300">•</span>
            Reliable <span className="mx-2 text-lime-300">•</span>
            Always There
          </p>
        </footer>
      </div>
    </main>
  );
}
