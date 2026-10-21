import { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import axios from "axios";

import { io } from "socket.io-client";

import {

  FaArrowLeft,

  FaCarSide,

  FaClock,

  FaLocationDot,

  FaPhone,

  FaRoute,

  FaShieldHalved,

} from "react-icons/fa6";



const API = (

  import.meta.env.VITE_API_URL || "http://localhost:8000/api"

).replace(/\/+$/, "");



const SOCKET_URL = (

  import.meta.env.VITE_SOCKET_URL || "http://localhost:8000"

).replace(/\/+$/, "");



function getErrorMessage(err, fallback) {

  const detail = err.response?.data?.detail;

  return typeof detail === "string" ? detail : fallback;

}



function formatStatus(value) {

  return String(value || "requested")

    .replaceAll("_", " ")

    .replace(/\b\w/g, (letter) => letter.toUpperCase());

}



export default function LiveRidePage() {

  const { rideId } = useParams();



  const [ride, setRide] = useState(null);

  const [driverLocation, setDriverLocation] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");



  useEffect(() => {

    let active = true;

    const token = localStorage.getItem("access_token");



    async function loadRide() {

      if (!token) {

        setError("Please sign in to view this ride.");

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

          setError(getErrorMessage(err, "Unable to load this ride."));

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



  useEffect(() => {

    const token = localStorage.getItem("access_token");

    if (!token || !rideId) return undefined;



    const socket = io(SOCKET_URL, {

      auth: { token },

      autoConnect: true,

      reconnection: true,

      reconnectionAttempts: 5,

      timeout: 10000,

    });



    function handleRideStatus(update) {

      if (

        update?.ride_id != null &&

        String(update.ride_id) !== String(rideId)

      ) {

        return;

      }



      if (update?.status) {

        setRide((previous) =>

          previous

            ? {

                ...previous,

                status: update.status,

                status_message:

                  update.status_message || previous.status_message,

              }

            : previous

        );

      }

    }



    function handleDriverLocation(location) {

      if (

        location?.ride_id != null &&

        String(location.ride_id) !== String(rideId)

      ) {

        return;

      }



      const latitude = Number(location?.latitude);

      const longitude = Number(location?.longitude);



      if (

        Number.isFinite(latitude) &&

        Number.isFinite(longitude) &&

        location?.latitude != null &&

        location?.longitude != null

      ) {

        setDriverLocation({ latitude, longitude });

      }

    }



    socket.on("ride_status", handleRideStatus);

    socket.on("driver_location", handleDriverLocation);



    return () => {

      socket.off("ride_status", handleRideStatus);

      socket.off("driver_location", handleDriverLocation);

      socket.disconnect();

    };

  }, [rideId]);



  if (loading) {

    return <StatusScreen message="Loading your ride..." />;

  }



  if (error) {

    return <StatusScreen message={error} error />;

  }



  if (!ride) {

    return <StatusScreen message="Ride not found." error />;

  }



  const status = formatStatus(ride.status);

  const pickup =

    ride.pickup_address ||

    ride.pickup?.address ||

    "Pickup details unavailable";

  const destination =

    ride.drop_address ||

    ride.destination_address ||

    ride.drop?.address ||

    ride.destination?.address ||

    "Destination details unavailable";

  const driver = ride.driver || {};



  return (

    <main className="min-h-screen bg-[#080d18] text-white">

      <header className="border-b border-white/10 bg-[#0c1422]">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">

          <Link

            to="/rider/history"

            className="flex items-center gap-2 text-sm text-slate-300 hover:text-lime-300"

          >

            <FaArrowLeft /> My rides

          </Link>



          <span className="text-lg font-black">

            GoCab<span className="text-lime-300">.</span>

          </span>



          <span className="rounded-full bg-lime-300/10 px-3 py-1.5 text-xs font-bold text-lime-200">

            {status}

          </span>

        </div>

      </header>



      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-12">

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">

          Your journey

        </p>

        <h1 className="mt-3 text-3xl font-black sm:text-4xl">

          Ride tracking

        </h1>

        <p className="mt-2 text-sm text-slate-400">

          Ride reference: {String(ride.id || ride.ride_id || rideId)}

        </p>



        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">

          <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#0d1523]">

            <div className="flex items-center justify-between border-b border-white/10 p-5">

              <div>

                <h2 className="font-bold">Journey overview</h2>

                <p className="mt-1 text-xs text-slate-400">

                  Your pickup and destination

                </p>

              </div>

              <FaRoute className="text-xl text-lime-300" />

            </div>



            <div className="relative flex min-h-72 items-center justify-center overflow-hidden bg-[#111d2b] p-6">

              <svg

                viewBox="0 0 500 300"

                className="absolute inset-0 h-full w-full"

                role="img"

                aria-label="Decorative ride route preview"

              >

                <g

                  stroke="#334155"

                  strokeWidth="18"

                  opacity=".55"

                  fill="none"

                >

                  <path d="M-20 40 L130 110 L260 30 L530 100" />

                  <path d="M-20 240 L150 170 L270 270 L390 150 L530 220" />

                  <path d="M110 -20 L170 120 L130 320" />

                  <path d="M360 -20 L300 110 L390 320" />

                </g>

                <path

                  d="M130 170 C190 125 220 205 270 155 S330 110 390 150"

                  fill="none"

                  stroke="#bef264"

                  strokeWidth="5"

                  strokeDasharray="9 9"

                />

                <circle cx="130" cy="170" r="12" fill="#bef264" />

                <circle cx="390" cy="150" r="12" fill="white" />

              </svg>



              <div className="relative max-w-sm rounded-2xl border border-white/10 bg-[#080d18]/90 p-5 text-center backdrop-blur">

                <FaCarSide className="mx-auto text-3xl text-lime-300" />

                <p className="mt-3 font-bold">

                  {driverLocation

                    ? "Driver location received"

                    : "Live map connection"}

                </p>

                {driverLocation ? (

                  <p className="mt-2 break-words text-xs text-slate-300">

                    Lat {driverLocation.latitude.toFixed(5)}, Lng{" "}

                    {driverLocation.longitude.toFixed(5)}

                  </p>

                ) : (

                  <p className="mt-2 text-xs leading-5 text-slate-400">

                    Waiting for the driver's location. The backend must send

                    authorized driver_location events for this ride.

                  </p>

                )}

              </div>

            </div>



            <div className="space-y-5 p-5">

              <RoutePoint

                icon={FaLocationDot}

                label="PICKUP"

                value={pickup}

              />

              <div className="ml-2 h-5 border-l border-dashed border-slate-600" />

              <RoutePoint

                icon={FaRoute}

                label="DESTINATION"

                value={destination}

              />

            </div>

          </section>



          <div className="space-y-6">

            <section className="rounded-3xl border border-white/10 bg-[#0d1523] p-5 sm:p-6">

              <div className="flex items-center gap-4">

                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-300/10 text-lime-300">

                  <FaCarSide size={25} />

                </span>

                <div className="min-w-0 flex-1">

                  <h2 className="font-bold">Driver details</h2>

                  <p className="mt-1 text-sm text-slate-400">

                    {driver.name || driver.full_name || "Driver details pending"}

                  </p>

                </div>

              </div>



              <div className="mt-5 grid grid-cols-2 gap-3">

                <Info

                  label="Vehicle"

                  value={

                    driver.vehicle_model ||

                    driver.vehicle?.model ||

                    "Not provided"

                  }

                />

                <Info

                  label="Registration"

                  value={

                    driver.vehicle_number ||

                    driver.vehicle?.registration_number ||

                    "Not provided"

                  }

                />

              </div>



              {driver.phone && (

                <a

                  href={`tel:${driver.phone}`}

                  className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold hover:border-lime-300/40"

                >

                  <FaPhone className="text-lime-300" /> Contact driver

                </a>

              )}

            </section>



            <section className="rounded-3xl border border-white/10 bg-[#0d1523] p-5 sm:p-6">

              <h2 className="font-bold">Ride status</h2>

              <div className="mt-5 flex gap-3">

                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-300/10 text-lime-300">

                  <FaClock />

                </span>

                <div>

                  <p className="font-semibold">{status}</p>

                  <p className="mt-1 text-sm leading-6 text-slate-400">

                    {ride.status_message ||

                      "This status reflects the latest ride information received from the server."}

                  </p>

                </div>

              </div>



              <div className="mt-5 flex gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-4">

                <FaShieldHalved className="mt-1 shrink-0 text-lime-300" />

                <p className="text-xs leading-6 text-slate-400">

                  Share trip details with someone you trust. Contact local

                  emergency services if you are in immediate danger.

                </p>

              </div>

            </section>



            <Link

              to={`/rider/rides/${rideId}`}

              className="flex items-center justify-center rounded-2xl bg-lime-300 px-5 py-4 font-bold text-slate-950 hover:bg-lime-200"

            >

              View full ride details

            </Link>

          </div>

        </div>

      </div>

    </main>

  );

}



function RoutePoint({ icon: Icon, label, value }) {

  return (

    <div className="flex items-start gap-3">

      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-lime-300">

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



function StatusScreen({ message, error = false }) {

  return (

    <main className="flex min-h-screen items-center justify-center bg-[#080d18] px-5 text-white">

      <div className="max-w-md text-center">

        <FaCarSide

          className={`mx-auto text-4xl ${

            error ? "text-red-300" : "text-lime-300"

          }`}

        />

        <p className="mt-5 leading-7 text-slate-300">{message}</p>

        <Link

          to="/rider/history"

          className="mt-6 inline-block text-sm font-bold text-lime-300"

        >

          Return to my rides

        </Link>

      </div>

    </main>

  );

}