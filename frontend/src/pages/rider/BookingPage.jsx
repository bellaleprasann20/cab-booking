import { useState } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import axios from "axios";

import {

  FaArrowLeft,

  FaArrowRight,

  FaCar,

  FaCarSide,

  FaCheck,

  FaClock,

  FaMapLocationDot,

  FaRoute,

  FaShieldHalved,

  FaMotorcycle,

} from "react-icons/fa6";

import LocationSearch from "../../components/map/LocationSearch";



const API = (

  import.meta.env.VITE_API_URL || "http://localhost:8000/api"

).replace(/\/+$/, "");



const rideTypes = [

  { id: "bike", name: "Go Bike", description: "Quick, affordable two-wheeler rides", icon: FaMotorcycle },

  { id: "economy", name: "Go Economy", description: "Affordable everyday car rides", icon: FaCar },

  { id: "comfort", name: "Go Comfort", description: "Extra room for your journey", icon: FaCarSide },

  { id: "premium", name: "Go Premium", description: "A more premium ride", icon: FaCarSide },

];



function getErrorMessage(err, fallback) {

  const detail = err.response?.data?.detail;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {

    return detail.map((item) => item.msg || JSON.stringify(item)).join(", ");

  }

  return fallback;

}



export default function BookingPage() {

  const navigate = useNavigate();

  const location = useLocation();



  const [pickup, setPickup] = useState(null);

  const [destination, setDestination] = useState(null);

  const [rideType, setRideType] = useState(

    location.state?.service || "economy"

  );

  const [estimate, setEstimate] = useState(null);

  const [loadingEstimate, setLoadingEstimate] = useState(false);

  const [booking, setBooking] = useState(false);

  const [error, setError] = useState("");



  const token = localStorage.getItem("access_token");

  const headers = token

    ? { Authorization: `Bearer ${token}` }

    : {};



  function getRidePayload() {

    return {

      pickup: { lat: Number(pickup.lat), lng: Number(pickup.lng) },

      drop: { lat: Number(destination.lat), lng: Number(destination.lng) },

      pickup_address: pickup.label,

      drop_address: destination.label,

      payment_method: "card",

      vehicle_type: rideType,

    };

  }



  function validateLocations() {

    if (!pickup || !destination) {

      setError("Select both pickup and destination from the location suggestions.");

      return false;

    }



    if (

      Number(pickup.lat) === Number(destination.lat) &&

      Number(pickup.lng) === Number(destination.lng)

    ) {

      setError("Pickup and destination must be different locations.");

      return false;

    }



    return true;

  }



  async function getEstimate(event) {

    event.preventDefault();

    setError("");

    setEstimate(null);



    if (!validateLocations()) return;



    setLoadingEstimate(true);



    try {

      const response = await axios.post(

        `${API}/rides/estimate`,

        getRidePayload(),

        { headers }

      );



      setEstimate(response.data?.estimate || response.data);

    } catch (err) {

      setError(getErrorMessage(err, "Could not calculate the fare. Please try again."));

    } finally {

      setLoadingEstimate(false);

    }

  }



  async function bookRide() {

    setError("");



    if (!validateLocations()) return;



    if (!token) {

      navigate("/signin", { replace: true });

      return;

    }



    setBooking(true);



    try {

      const response = await axios.post(

        `${API}/rides`,

        getRidePayload(),

        { headers }

      );



      const ride = response.data?.ride || response.data;

      const rideId = ride?.id || ride?.ride_id;



      if (rideId == null) {

        setError("The server did not return a ride ID. Check the booking API response.");

        return;

      }



      navigate(`/rider/rides/${rideId}`);

    } catch (err) {

      setError(getErrorMessage(err, "Your booking could not be created. Please try again."));

    } finally {

      setBooking(false);

    }

  }



  const fare = estimate?.fare_estimate ?? estimate?.estimated_fare ?? estimate?.fare;

  const distanceKm =

    estimate?.distance_meters != null

      ? Number(estimate.distance_meters) / 1000

      : estimate?.distance_km != null

        ? Number(estimate.distance_km)

        : null;



  const durationMinutes =

    estimate?.duration_secs != null

      ? Number(estimate.duration_secs) / 60

      : estimate?.duration_minutes != null

        ? Number(estimate.duration_minutes)

        : null;



  const currency = estimate?.currency || "INR";



  function formatFare(value) {

    if (value == null || !Number.isFinite(Number(value))) return "Unavailable";



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



  return (

    <main className="min-h-screen bg-[#080d18] text-white">

      <header className="border-b border-white/10 bg-[#0c1422]">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">

          <Link

            to="/rider/dashboard"

            className="flex items-center gap-3 text-sm text-slate-300 hover:text-lime-300"

          >

            <FaArrowLeft /> Dashboard

          </Link>

          <span className="text-lg font-black">

            GoCab<span className="text-lime-300">.</span>

          </span>

          <span className="rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1.5 text-xs font-semibold text-lime-200">

            New booking

          </span>

        </div>

      </header>



      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-12">

        <div className="mb-8">

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">

            Your next journey

          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">

            Where are we going?

          </h1>

          <p className="mt-2 text-slate-400">

            Enter your route and review your ride before booking.

          </p>

        </div>



        <div className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">

          <section className="rounded-3xl border border-white/10 bg-[#0d1523] p-5 sm:p-7">

            <form onSubmit={getEstimate} className="space-y-5">

              <div>

                <label className="mb-2 block text-sm font-semibold">

                  Pickup location

                </label>

                <LocationSearch

                  key="pickup-location"

                  placeholder="Search pickup address or place..."

                  onSelect={(place) => {

                    setPickup(place);

                    setEstimate(null);

                    setError("");

                  }}

                />

                {pickup && (

                  <p className="mt-2 break-words text-xs text-slate-400">

                    Selected: {pickup.label}

                  </p>

                )}

              </div>



              <div className="flex justify-center">

                <div className="h-7 border-l border-dashed border-slate-600" />

              </div>



              <div>

                <label className="mb-2 block text-sm font-semibold">

                  Destination

                </label>

                <LocationSearch

                  key="destination-location"

                  placeholder="Search destination address or place..."

                  onSelect={(place) => {

                    setDestination(place);

                    setEstimate(null);

                    setError("");

                  }}

                />

                {destination && (

                  <p className="mt-2 break-words text-xs text-slate-400">

                    Selected: {destination.label}

                  </p>

                )}

              </div>



              <div className="pt-2">

                <h2 className="mb-3 text-sm font-bold">Choose your ride</h2>

                <div className="space-y-3">

                  {rideTypes.map(({ id, name, description, icon: Icon }) => (

                    <button

                      key={id}

                      type="button"

                      onClick={() => {

                        setRideType(id);

                        setEstimate(null);

                        setError("");

                      }}

                      aria-pressed={rideType === id}

                      className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${

                        rideType === id

                          ? "border-lime-300/60 bg-lime-300/[0.07]"

                          : "border-white/10 bg-[#101827] hover:border-white/25"

                      }`}

                    >

                      <span

                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${

                          rideType === id

                            ? "bg-lime-300 text-slate-950"

                            : "bg-white/5 text-slate-300"

                        }`}

                      >

                        <Icon size={22} />

                      </span>

                      <span className="min-w-0 flex-1">

                        <span className="block font-bold">{name}</span>

                        <span className="mt-1 block text-xs text-slate-400">

                          {description}

                        </span>

                      </span>

                      <span

                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${

                          rideType === id

                            ? "border-lime-300 bg-lime-300 text-slate-950"

                            : "border-slate-600"

                        }`}

                      >

                        {rideType === id && <FaCheck size={10} />}

                      </span>

                    </button>

                  ))}

                </div>

              </div>



              {error && (

                <p

                  role="alert"

                  className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200"

                >

                  {error}

                </p>

              )}



              <button

                type="submit"

                disabled={loadingEstimate || booking}

                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-lime-300 px-5 py-4 font-bold text-slate-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"

              >

                {loadingEstimate ? "Calculating fare..." : "Calculate my fare"}

                {!loadingEstimate && <FaArrowRight />}

              </button>

            </form>



            {estimate && (

              <div className="mt-5 rounded-2xl border border-lime-300/20 bg-lime-300/[0.06] p-5">

                <p className="text-xs font-bold uppercase tracking-wider text-lime-300">

                  Fare estimate

                </p>

                <div className="mt-2 flex flex-wrap items-end justify-between gap-3">

                  <p className="text-3xl font-black">{formatFare(fare)}</p>

                  <p className="text-xs text-slate-400">Final fare may vary</p>

                </div>



                {distanceKm != null && Number.isFinite(distanceKm) && (

                  <p className="mt-3 text-sm text-slate-300">

                    Distance: {distanceKm.toFixed(2)} km

                  </p>

                )}

                {durationMinutes != null && Number.isFinite(durationMinutes) && (

                  <p className="mt-1 text-sm text-slate-300">

                    Estimated time: {Math.ceil(durationMinutes)} min

                  </p>

                )}



                <button

                  type="button"

                  onClick={bookRide}

                  disabled={booking}

                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-bold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"

                >

                  {booking ? "Booking ride..." : "Confirm booking"}

                  {!booking && <FaArrowRight />}

                </button>

              </div>

            )}

          </section>



          <section className="flex min-h-[380px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#101827]">

            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">

              <div>

                <p className="font-bold">Your route</p>

                <p className="mt-1 text-xs text-slate-400">Route preview</p>

              </div>

              <FaRoute className="text-xl text-lime-300" />

            </div>



            <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#111d2b] p-6">

              <svg

                viewBox="0 0 500 430"

                className="absolute inset-0 h-full w-full"

                role="img"

                aria-label="Decorative route preview"

              >

                <g stroke="#334155" strokeWidth="20" opacity=".55" fill="none">

                  <path d="M-30 70 L170 130 L270 40 L530 110" />

                  <path d="M-20 300 L130 220 L260 340 L390 200 L530 280" />

                  <path d="M100 -30 L160 120 L130 240 L210 470" />

                  <path d="M360 -30 L310 100 L390 220 L350 470" />

                </g>

                <path

                  d="M130 220 C180 190 220 245 260 210 S315 130 390 200"

                  fill="none"

                  stroke="#bef264"

                  strokeWidth="5"

                  strokeDasharray="9 9"

                  strokeLinecap="round"

                />

                <circle cx="130" cy="220" r="13" fill="#bef264" />

                <circle cx="130" cy="220" r="5" fill="#111d2b" />

                <circle cx="390" cy="200" r="13" fill="white" />

                <circle cx="390" cy="200" r="5" fill="#111d2b" />

              </svg>



              <div className="relative rounded-2xl border border-white/10 bg-[#080d18]/90 p-5 text-center backdrop-blur">

                <FaMapLocationDot className="mx-auto text-3xl text-lime-300" />

                <p className="mt-3 font-bold">

                  {pickup && destination ? "Route selected" : "Your journey, visualized"}

                </p>

                <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">

                  {pickup && destination

                    ? `${pickup.label} → ${destination.label}`

                    : "Select pickup and destination suggestions to calculate your fare."}

                </p>

              </div>

            </div>



            <div className="grid grid-cols-2 gap-3 border-t border-white/10 p-4">

              <div className="rounded-xl bg-white/[0.03] p-3">

                <FaClock className="text-lime-300" />

                <p className="mt-2 text-xs font-semibold">Time estimate</p>

                <p className="mt-1 text-xs text-slate-500">

                  {durationMinutes != null && Number.isFinite(durationMinutes)

                    ? `${Math.ceil(durationMinutes)} minutes`

                    : "After route lookup"}

                </p>

              </div>

              <div className="rounded-xl bg-white/[0.03] p-3">

                <FaShieldHalved className="text-lime-300" />

                <p className="mt-2 text-xs font-semibold">Ride details</p>

                <p className="mt-1 text-xs text-slate-500">

                  Review before confirming

                </p>

              </div>

            </div>

          </section>

        </div>

      </div>

    </main>

  );

}