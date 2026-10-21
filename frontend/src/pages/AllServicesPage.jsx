
import { useNavigate } from "react-router-dom";
import {
  FaMotorcycle,
  FaCarSide,
  FaTruck,
  FaArrowRight,
  FaPlane,
} from "react-icons/fa6";

import Navbar from "../components/layout/Navbar";

const services = [
  {
    id: "parcel",
    title: "Parcel on Bike",
    subtitle: "Send packages safely and quickly.",
    icon: FaTruck,
    vehicleType: "truck",
  },
  {
    id: "auto",
    title: "Auto",
    subtitle: "Affordable rides around your city.",
    icon: FaCarSide,
    vehicleType: "auto",
  },
  {
    id: "bike",
    title: "Bike",
    subtitle: "Beat traffic and reach faster.",
    icon: FaMotorcycle,
    vehicleType: "bike",
  },
  {
    id: "travel",
    title: "Travel",
    subtitle: "Plan your comfortable journey.",
    icon: FaPlane,
    vehicleType: "car",
  },
];

export default function AllServicesPage() {
  const navigate = useNavigate();

  function selectService(service) {
    navigate("/rider/book", {
      state: {
        serviceType: service.id,
        vehicleType: service.vehicleType,
      },
    });
  }

  return (
    <main className="min-h-screen bg-[#030d1b] text-white">
      {/* Shared website navbar */}
      

      <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-7 sm:py-10 lg:px-10 lg:py-12">
        {/* Page heading */}
        <header className="mb-9 sm:mb-12">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.25em] text-lime-300">
            GoCab Services
          </p>

          <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            All Services<span className="text-lime-300">.</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            From everyday rides to parcel delivery, choose the service that
            fits your journey.
          </p>
        </header>

        {/* Service cards */}
        <section
          aria-label="Available services"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
        >
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <button
                key={service.id}
                type="button"
                onClick={() => selectService(service)}
                aria-label={`Choose ${service.title}`}
                className="group flex min-h-[260px] flex-col rounded-2xl border border-[#20334b] bg-gradient-to-br from-[#0c1b2e] to-[#061221] p-6 text-left transition duration-200 hover:-translate-y-1 hover:border-lime-300/50 hover:shadow-xl hover:shadow-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-300 sm:min-h-[285px] sm:p-7"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-300/10 text-3xl text-lime-300 transition group-hover:bg-lime-300 group-hover:text-[#07111f]">
                    <Icon />
                  </span>

                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-lg text-slate-400 transition group-hover:border-lime-300 group-hover:bg-lime-300 group-hover:text-[#07111f]">
                    <FaArrowRight />
                  </span>
                </div>

                <div className="mt-auto pt-8">
                  <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                    {service.title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {service.subtitle}
                  </p>

                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-lime-300 transition group-hover:gap-3">
                    Choose service
                    <FaArrowRight className="text-xs" />
                  </span>
                </div>
              </button>
            );
          })}
        </section>

        {/* Booking prompt */}
        <section className="mt-8 flex flex-col gap-5 rounded-2xl border border-[#20334b] bg-[#09182a] p-5 sm:mt-10 sm:flex-row sm:items-center sm:p-7">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-lime-300 text-xl text-[#07111f]">
            <FaArrowRight />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-extrabold sm:text-xl">
              Ready to go?
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              Select a service above to continue to your booking.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/rider/book")}
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-lime-300 px-6 py-3 text-sm font-extrabold text-[#07111f] transition hover:bg-lime-200"
          >
            Book a Ride
            <FaArrowRight />
          </button>
        </section>

        {/* Footer */}
        <footer className="mt-12 flex flex-col gap-3 border-t border-[#16263b] py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
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
