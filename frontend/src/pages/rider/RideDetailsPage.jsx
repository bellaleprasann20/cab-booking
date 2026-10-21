import { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import axios from "axios";

import {

  FaArrowLeft,

  FaCarSide,

  FaCalendarDays,

  FaCircleCheck,

  FaClock,

  FaLocationDot,

  FaReceipt,

  FaRoute,

  FaWallet,

} from "react-icons/fa6";



const API = (

  import.meta.env.VITE_API_URL || "http://localhost:8000/api"

).replace(/\/+$/, "");



function formatStatus(value) {

  return String(value || "unknown")

    .replaceAll("_", " ")

    .replace(/\b\w/g, (letter) => letter.toUpperCase());

}



function getErrorMessage(err, fallback) {

  const detail = err.response?.data?.detail;

  return typeof detail === "string" ? detail : fallback;

}



function formatMoney(value, currency = "INR") {

  if (value == null || !Number.isFinite(Number(value))) return "—";



  try {

    return new Intl.NumberFormat("en-IN", {

      style: "currency",

      currency,

      maximumFractionDigits: 2,

    }).format(Number(value));

  } catch {

    return `${currency} ${Number(value).toFixed(2)}`;

  }

}



export default function RideDetailsPage() {

  const { rideId } = useParams();



  const [ride, setRide] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");



  useEffect(() => {

    let active = true;

    const token = localStorage.getItem("access_token");



    async function loadRide() {

      if (!token) {

        setError("Please sign in to view ride details.");

        setLoading(false);

        return;

      }



      try {

        const response = await axios.get(`${API}/rides/${rideId}`, {

          headers: { Authorization: `Bearer ${token}` },

        });



        if (active) {

          setRide(response.data?.ride || response.data);

          setError("");

        }

      } catch (err) {

        if (active) {

          setError(

            getErrorMessage(err, "Unable to retrieve ride details.")

          );

        }

      } finally {

        if (active) setLoading(false);

      }

    }



    loadRide();



    return () => {

      active = false;

    };

  }, [rideId]);



  if (loading || error || !ride) {

    return (

      <main className="flex min-h-screen items-center justify-center bg-[#080d18] px-5 text-white">

        <div className="text-center">

          <FaCarSide className="mx-auto text-4xl text-lime-300" />

          <p className="mt-4 text-slate-300">

            {loading ? "Loading ride details..." : error || "Ride not found."}

          </p>

          <Link

            to="/rider/history"

            className="mt-5 inline-block text-sm font-bold text-lime-300"

          >

            Back to ride history

          </Link>

        </div>

      </main>

    );

  }



  const id = ride.id || ride.ride_id || rideId;

  const pickup =

    ride.pickup_address || ride.pickup?.address || "Not provided";

  const destination =

    ride.drop_address ||

    ride.destination_address ||

    ride.drop?.address ||

    ride.destination?.address ||

    "Not provided";

  const fare = ride.final_fare ?? ride.estimated_fare ?? ride.fare_estimate ?? ride.fare;

  const status = formatStatus(ride.status);

  const rawStatus = String(ride.status || "").toLowerCase();

  const driver = ride.driver || {};

  const currency = ride.currency || "INR";



  const activeStatuses = [

    "requested",

    "accepted",

    "driver_arriving",

    "driver_arrived",

    "in_progress",

  ];



  const breakdown = [

    ["Base fare", ride.base_fare],

    ["Distance fare", ride.distance_fare],

    ["Time fare", ride.time_fare],

    ["Surge charge", ride.surge_charge],

    [

      "Discount",

      ride.discount_amount == null

        ? null

        : -Math.abs(Number(ride.discount_amount)),

    ],

    ["Tax", ride.tax_amount],

  ].filter(([, amount]) => amount != null);



  return (

    <main className="min-h-screen bg-[#080d18] text-white">

      <header className="border-b border-white/10 bg-[#0c1422]">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">

          <Link

            to="/rider/history"

            className="flex items-center gap-2 text-sm text-slate-300 hover:text-lime-300"

          >

            <FaArrowLeft /> Ride history

          </Link>

          <span className="text-lg font-black">

            GoCab<span className="text-lime-300">.</span>

          </span>

          <span className="rounded-full bg-lime-300/10 px-3 py-1.5 text-xs font-bold text-lime-200">

            {status}

          </span>

        </div>

      </header>



      <div className="mx-auto max-w-6xl px-5 py-9 sm:px-8 lg:py-12">

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

          <div>

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">

              Trip summary

            </p>

            <h1 className="mt-3 text-3xl font-black sm:text-4xl">

              Ride details

            </h1>

            <p className="mt-2 text-sm text-slate-400">

              Reference #{String(id)}

            </p>

          </div>



          {activeStatuses.includes(rawStatus) && (

            <Link

              to={`/rider/live/${id}`}

              className="inline-flex items-center justify-center gap-2 rounded-xl bg-lime-300 px-5 py-3 font-bold text-slate-950 hover:bg-lime-200"

            >

              Track this ride <FaRoute />

            </Link>

          )}

        </div>



        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">

          <div className="space-y-6">

            <section className="rounded-3xl border border-white/10 bg-[#0d1523] p-5 sm:p-7">

              <div className="flex items-center gap-3">

                <FaRoute className="text-xl text-lime-300" />

                <h2 className="text-lg font-bold">Route information</h2>

              </div>



              <div className="mt-7 space-y-5">

                <RouteItem

                  icon={FaLocationDot}

                  label="PICKUP LOCATION"

                  value={pickup}

                />

                <div className="ml-4 h-7 border-l border-dashed border-slate-600" />

                <RouteItem

                  icon={FaLocationDot}

                  label="DESTINATION"

                  value={destination}

                />

              </div>



              <div className="mt-7 grid grid-cols-2 gap-3">

                <Info

                  label="Distance"

                  value={

                    ride.distance_km != null

                      ? `${ride.distance_km} km`

                      : ride.distance_meters != null

                        ? `${(Number(ride.distance_meters) / 1000).toFixed(2)} km`

                        : "—"

                  }

                />

                <Info

                  label="Duration"

                  value={

                    ride.duration_minutes != null

                      ? `${ride.duration_minutes} min`

                      : ride.duration_secs != null

                        ? `${Math.ceil(Number(ride.duration_secs) / 60)} min`

                        : "—"

                  }

                />

                <Info

                  label="Requested"

                  value={

                    ride.created_at

                      ? new Date(ride.created_at).toLocaleString()

                      : "—"

                  }

                />

                <Info

                  label="Completed"

                  value={

                    ride.completed_at

                      ? new Date(ride.completed_at).toLocaleString()

                      : "—"

                  }

                />

              </div>

            </section>



            <section className="rounded-3xl border border-white/10 bg-[#0d1523] p-5 sm:p-7">

              <div className="flex items-center gap-3">

                <FaCarSide className="text-xl text-lime-300" />

                <h2 className="text-lg font-bold">Driver and vehicle</h2>

              </div>



              <div className="mt-5 flex items-center gap-4">

                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-xl text-slate-300">

                  <FaCarSide />

                </span>

                <div className="min-w-0">

                  <p className="break-words font-bold">

                    {driver.name ||

                      driver.full_name ||

                      "Driver information unavailable"}

                  </p>

                  <p className="mt-1 text-sm text-slate-400">

                    {driver.vehicle_model ||

                      driver.vehicle?.model ||

                      "Vehicle details unavailable"}

                  </p>

                </div>

              </div>



              {driver.vehicle_number && (

                <div className="mt-4">

                  <Info

                    label="Vehicle registration"

                    value={driver.vehicle_number}

                  />

                </div>

              )}



              {driver.phone && (

                <a

                  href={`tel:${driver.phone}`}

                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold hover:border-lime-300/40"

                >

                  Contact driver: {driver.phone}

                </a>

              )}

            </section>

          </div>



          <div className="space-y-6">

            <section className="rounded-3xl border border-white/10 bg-[#0d1523] p-5 sm:p-7">

              <div className="flex items-center gap-3">

                <FaReceipt className="text-xl text-lime-300" />

                <h2 className="text-lg font-bold">Fare summary</h2>

              </div>



              <div className="mt-6 space-y-4">

                {breakdown.length ? (

                  breakdown.map(([label, amount]) => (

                    <div

                      key={label}

                      className="flex items-center justify-between gap-4 text-sm"

                    >

                      <span className="text-slate-400">{label}</span>

                      <span className="font-semibold">

                        {formatMoney(amount, currency)}

                      </span>

                    </div>

                  ))

                ) : (

                  <p className="text-sm leading-6 text-slate-400">

                    The backend hasn't supplied a detailed fare breakdown for

                    this ride.

                  </p>

                )}



                <div className="border-t border-white/10 pt-4">

                  <div className="flex items-center justify-between gap-4">

                    <span className="font-bold">Total fare</span>

                    <span className="text-2xl font-black text-lime-300">

                      {formatMoney(fare, currency)}

                    </span>

                  </div>

                </div>

              </div>



              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-white/[0.035] p-4">

                <FaWallet className="mt-1 text-lime-300" />

                <div>

                  <p className="text-sm font-semibold">Payment status</p>

                  <p className="mt-1 text-sm capitalize text-slate-400">

                    {String(ride.payment_status || "Not provided").replaceAll("_", " ")}

                  </p>

                </div>

              </div>

            </section>



            <section className="rounded-3xl border border-white/10 bg-[#0d1523] p-5 sm:p-7">

              <h2 className="font-bold">Ride status</h2>

              <div className="mt-5 flex items-start gap-3">

                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-300/10 text-lime-300">

                  <FaCircleCheck />

                </span>

                <div>

                  <p className="font-semibold">{status}</p>

                  <p className="mt-1 text-sm leading-6 text-slate-400">

                    {ride.status_message ||

                      "This is the latest status returned by the ride API."}

                  </p>

                </div>

              </div>



              {ride.created_at && (

                <p className="mt-5 flex items-center gap-2 text-xs text-slate-500">

                  <FaCalendarDays />

                  Created {new Date(ride.created_at).toLocaleString()}

                </p>

              )}



              {ride.duration_minutes != null && (

                <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">

                  <FaClock /> {ride.duration_minutes} minutes

                </p>

              )}

            </section>

          </div>

        </div>

      </div>

    </main>

  );

}



function RouteItem({ icon: Icon, label, value }) {

  return (

    <div className="flex items-start gap-3">

      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lime-300/10 text-lime-300">

        <Icon />

      </span>

      <div className="min-w-0">

        <p className="text-[10px] font-bold tracking-wider text-slate-500">

          {label}

        </p>

        <p className="mt-1 break-words text-sm leading-6 text-slate-200">

          {value}

        </p>

      </div>

    </div>

  );

}



function Info({ label, value }) {

  return (

    <div className="rounded-xl bg-white/[0.035] p-3">

      <p className="text-xs text-slate-500">{label}</p>

      <p className="mt-2 break-words text-sm font-semibold">{value}</p>

    </div>

  );

}