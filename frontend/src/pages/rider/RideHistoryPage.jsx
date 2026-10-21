

import { useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import axios from "axios";

import {

  FaArrowRight,

  FaCarSide,

  FaMagnifyingGlass,

  FaRoute,

  FaCalendarDays,

} from "react-icons/fa6";



const API = (

  import.meta.env.VITE_API_URL || "http://localhost:8000/api"

).replace(/\/+$/, "");



const filters = [

  "all",

  "requested",

  "accepted",

  "in_progress",

  "completed",

  "cancelled",

];



export default function RideHistoryPage() {

  const [rides, setRides] = useState([]);

  const [filter, setFilter] = useState("all");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");



  useEffect(() => {

    let active = true;



    const loadRides = async () => {

      try {

        setLoading(true);

        setError("");



        const token = localStorage.getItem("access_token");



        if (!token) {

          throw new Error("Please sign in to view your ride history.");

        }



        const response = await axios.get(`${API}/rides`, {

          headers: {

            Authorization: `Bearer ${token}`,

          },

        });



        const payload = response.data;



        const items = Array.isArray(payload)

          ? payload

          : Array.isArray(payload?.rides)

            ? payload.rides

            : Array.isArray(payload?.items)

              ? payload.items

              : [];



        if (active) {

          setRides(items);

        }

      } catch (err) {

        if (active) {

          const detail = err.response?.data?.detail;



          setError(

            typeof detail === "string"

              ? detail

              : err.message || "Unable to load ride history. Please try again."

          );

        }

      } finally {

        if (active) {

          setLoading(false);

        }

      }

    };



    loadRides();



    return () => {

      active = false;

    };

  }, []);



  const filteredRides = useMemo(() => {

    const query = search.trim().toLowerCase();



    return rides.filter((ride) => {

      const status = String(ride.status || "")

        .toLowerCase()

        .replaceAll("-", "_")

        .replaceAll(" ", "_");



      const matchesFilter = filter === "all" || status === filter;



      const searchable = [

        ride.id,

        ride.ride_id,

        ride.pickup_address,

        ride.destination_address,

        ride.pickup?.address,

        ride.destination?.address,

      ]

        .filter((value) => value != null && value !== "")

        .join(" ")

        .toLowerCase();



      return matchesFilter && (!query || searchable.includes(query));

    });

  }, [rides, filter, search]);



  const completedCount = rides.filter(

    (ride) => String(ride.status || "").toLowerCase() === "completed"

  ).length;



  return (

    <main className="min-h-screen bg-[#080d18] text-white">

      <header className="border-b border-white/10 bg-[#0c1422]">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">

          <Link

            to="/rider/dashboard"

            className="text-sm text-slate-300 transition hover:text-lime-300"

          >

            ← Dashboard

          </Link>



          <span className="text-lg font-black">

            GoCab<span className="text-lime-300">.</span>

          </span>



          <Link

            to="/rider/book"

            className="rounded-full bg-lime-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-lime-200"

          >

            Book a ride

          </Link>

        </div>

      </header>



      <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8 lg:py-12">

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">

          Your journeys

        </p>



        <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

          <div>

            <h1 className="text-3xl font-black sm:text-4xl">

              Ride history

            </h1>



            <p className="mt-2 text-sm text-slate-400">

              Review your trips and open any ride for more details.

            </p>

          </div>



          <div className="grid grid-cols-2 gap-3">

            <Stat label="Rides loaded" value={rides.length} />

            <Stat label="Completed" value={completedCount} />

          </div>

        </div>



        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="relative w-full lg:max-w-sm">

            <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />



            <input

              type="text"

              value={search}

              onChange={(event) => setSearch(event.target.value)}

              placeholder="Search ride or location..."

              aria-label="Search rides or locations"

              className="w-full rounded-2xl border border-white/10 bg-[#101827] py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-lime-300/50"

            />

          </div>



          <div className="flex gap-2 overflow-x-auto pb-1">

            {filters.map((item) => (

              <button

                key={item}

                type="button"

                onClick={() => setFilter(item)}

                aria-pressed={filter === item}

                className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-bold capitalize transition ${

                  filter === item

                    ? "bg-lime-300 text-slate-950"

                    : "border border-white/10 bg-white/[0.025] text-slate-300 hover:border-white/25"

                }`}

              >

                {item.replaceAll("_", " ")}

              </button>

            ))}

          </div>

        </div>



        {error && (

          <div

            role="alert"

            className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200"

          >

            {error}

          </div>

        )}



        <section className="mt-6 space-y-4">

          {loading ? (

            <div className="rounded-3xl border border-white/10 bg-[#0d1523] p-12 text-center text-slate-400">

              Loading your rides...

            </div>

          ) : filteredRides.length === 0 ? (

            <div className="rounded-3xl border border-white/10 bg-[#0d1523] px-6 py-14 text-center">

              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-300/10 text-2xl text-lime-300">

                <FaCarSide />

              </span>



              <h2 className="mt-5 text-xl font-bold">

                {error

                  ? "Ride history unavailable"

                  : search || filter !== "all"

                    ? "No matching rides"

                    : "No rides found"}

              </h2>



              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">

                {error

                  ? "Check your connection and sign-in status, then try again."

                  : search || filter !== "all"

                    ? "Try another search term or select a different status filter."

                    : "Book your first ride to start your journey."}

              </p>



              {!error && !search && filter === "all" && (

                <Link

                  to="/rider/book"

                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-lime-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-lime-200"

                >

                  Book a ride <FaArrowRight />

                </Link>

              )}

            </div>

          ) : (

            filteredRides.map((ride, index) => {

              const id = ride.id ?? ride.ride_id;



              const status = String(ride.status || "unknown")

                .toLowerCase()

                .replaceAll("-", "_")

                .replaceAll(" ", "_");



              const pickup =

                ride.pickup_address ||

                ride.pickup?.address ||

                "Pickup unavailable";



              const destination =

                ride.destination_address ||

                ride.destination?.address ||

                "Destination unavailable";



              const fare =

                ride.final_fare ?? ride.estimated_fare ?? ride.fare;



              const numericFare =

                fare !== null &&

                fare !== undefined &&

                fare !== "" &&

                Number.isFinite(Number(fare));



              const date = ride.created_at || ride.requested_at;

              const parsedDate = date ? new Date(date) : null;

              const validDate =

                parsedDate && !Number.isNaN(parsedDate.getTime());



              return (

                <article

                  key={id ?? `ride-${index}`}

                  className="rounded-3xl border border-white/10 bg-[#0d1523] p-5 transition hover:border-white/20 sm:p-6"

                >

                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                    <div className="flex min-w-0 gap-4">

                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lime-300/10 text-xl text-lime-300">

                        <FaCarSide />

                      </span>



                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <p className="font-bold">

                            Ride #{String(id ?? "—")}

                          </p>



                          <StatusBadge status={status} />

                        </div>



                        <p className="mt-2 truncate text-sm text-slate-300">

                          {pickup}

                        </p>



                        <p className="mt-1 truncate text-sm text-slate-400">

                          → {destination}

                        </p>



                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">

                          {validDate && (

                            <span className="flex items-center gap-2">

                              <FaCalendarDays />

                              {parsedDate.toLocaleString()}

                            </span>

                          )}



                          {ride.distance_km != null && (

                            <span className="flex items-center gap-2">

                              <FaRoute />

                              {ride.distance_km} km

                            </span>

                          )}

                        </div>

                      </div>

                    </div>



                    <div className="flex items-center justify-between gap-5 border-t border-white/10 pt-4 md:border-0 md:pt-0">

                      <div>

                        <p className="text-xs text-slate-500">Fare</p>



                        <p className="mt-1 text-xl font-black">

                          {numericFare

                            ? `₹${Number(fare).toFixed(2)}`

                            : "—"}

                        </p>

                      </div>



                      {id != null ? (

                        <Link

                          to={`/rider/rides/${encodeURIComponent(String(id))}`}

                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold transition hover:border-lime-300/40 hover:text-lime-300"

                        >

                          Details <FaArrowRight />

                        </Link>

                      ) : (

                        <span className="text-xs text-slate-500">

                          Details unavailable

                        </span>

                      )}

                    </div>

                  </div>

                </article>

              );

            })

          )}

        </section>

      </div>

    </main>

  );

}



function Stat({ label, value }) {

  return (

    <div className="rounded-2xl border border-white/10 bg-[#0d1523] px-4 py-3">

      <p className="text-xs text-slate-500">{label}</p>

      <p className="mt-1 text-xl font-black">{value}</p>

    </div>

  );

}



function StatusBadge({ status }) {

  const colors = {

    requested: "bg-amber-400/10 text-amber-300",

    accepted: "bg-lime-300/10 text-lime-200",

    in_progress: "bg-sky-400/10 text-sky-300",

    completed: "bg-emerald-400/10 text-emerald-300",

    cancelled: "bg-red-400/10 text-red-300",

  };



  return (

    <span

      className={`rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${

        colors[status] || "bg-white/5 text-slate-300"

      }`}

    >

      {status.replaceAll("_", " ")}

    </span>

  );

}
