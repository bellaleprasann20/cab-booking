import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaCarSide,
  FaCheck,
  FaClock,
  FaLocationDot,
  FaMapLocationDot,
  FaShieldHalved,
  FaWallet,
} from "react-icons/fa6";

const services = [
  {
    icon: FaCarSide,
    title: "Everyday rides",
    description:
      "Reliable rides for your daily commute, errands, and everything in between.",
    number: "01",
  },
  {
    icon: FaMapLocationDot,
    title: "Live ride tracking",
    description:
      "Know where your driver is and follow your journey with real-time updates.",
    number: "02",
  },
  {
    icon: FaWallet,
    title: "Transparent fares",
    description:
      "See your estimated fare before booking, with clear payment information.",
    number: "03",
  },
];

const benefits = [
  { icon: FaShieldHalved, text: "Safety-first experience" },
  { icon: FaClock, text: "Convenient booking" },
  { icon: FaLocationDot, text: "Real-time trip updates" },
  { icon: FaWallet, text: "Clear fare estimates" },
];

const steps = [
  {
    number: "01",
    title: "Choose your destination",
    description: "Enter your pickup point and where you want to go.",
  },
  {
    number: "02",
    title: "Choose your ride",
    description: "Review available options and your estimated fare.",
  },
  {
    number: "03",
    title: "Enjoy the journey",
    description: "Track your driver and follow your ride in real time.",
  },
];

function SectionLabel({ children }) {
  return (
    <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-lime-300">
      <span className="h-2 w-2 rounded-full bg-lime-300" />
      {children}
    </p>
  );
}

function Brand({ light = false }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-300 text-slate-950">
        <FaCarSide size={21} />
      </span>
      <span
        className={`text-xl font-black tracking-tight ${
          light ? "text-white" : "text-slate-950"
        }`}
      >
        GoCab<span className="text-lime-400">.</span>
      </span>
    </Link>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080d18] text-white">
      <header className="relative z-20 border-b border-white/10">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <Brand light />

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
            <a href="#services" className="transition hover:text-lime-300">
              Services
            </a>
            <a
              href="#how-it-works"
              className="transition hover:text-lime-300"
            >
              How it works
            </a>
            <a href="#why-gocab" className="transition hover:text-lime-300">
              Why GoCab
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/signin"
              className="hidden rounded-full px-4 py-2.5 text-sm font-semibold text-white transition hover:text-lime-300 sm:inline-flex"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-lime-200"
            >
              Get started <FaArrowRight />
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative">
        <div className="pointer-events-none absolute -right-40 top-0 h-[480px] w-[480px] rounded-full bg-lime-300/10 blur-[130px]" />
        <div className="pointer-events-none absolute -left-40 bottom-0 h-[350px] w-[350px] rounded-full bg-indigo-500/10 blur-[120px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:py-24">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/[0.07] px-4 py-2 text-xs font-semibold text-lime-200">
              <span className="h-2 w-2 animate-pulse rounded-full bg-lime-300" />
              A smarter way to move
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-[1.06] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Your city.
              <br />
              Your journey.
              <br />
              <span className="text-lime-300">Your ride.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
              Get where you need to be with convenient ride booking,
              transparent fare estimates, and a journey designed around you.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="group inline-flex items-center gap-3 rounded-full bg-lime-300 px-7 py-4 font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-lime-200"
              >
                Book your first ride
                <FaArrowRight className="transition group-hover:translate-x-1" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center rounded-full border border-white/15 px-7 py-4 font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
              >
                See how it works
              </a>
            </div>

            <div className="mt-11 flex flex-wrap gap-x-7 gap-y-4 text-sm text-slate-300">
              {["Simple booking", "Fare estimates", "Trip updates"].map(
                (item) => (
                  <span key={item} className="flex items-center gap-2">
                    <FaCheck className="text-lime-300" />
                    {item}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-lime-300/10 via-indigo-500/10 to-transparent blur-2xl" />

            <div className="relative rounded-[2rem] border border-white/10 bg-[#101827] p-4 shadow-2xl shadow-black/30 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Plan your ride
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Your next journey starts here
                  </p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-300/10 text-lime-300">
                  <FaMapLocationDot size={20} />
                </span>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-[#0b1220] p-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center pt-1">
                    <span className="h-3 w-3 rounded-full border-[3px] border-lime-300" />
                    <span className="my-2 h-10 border-l border-dashed border-slate-600" />
                    <span className="h-3 w-3 rounded-sm bg-white" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div>
                      <p className="text-xs text-slate-500">PICKUP</p>
                      <p className="mt-1 truncate text-sm font-semibold">
                        Your current location
                      </p>
                    </div>
                    <div className="mt-6">
                      <p className="text-xs text-slate-500">DROP-OFF</p>
                      <p className="mt-1 truncate text-sm font-semibold">
                        Where would you like to go?
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mt-4 h-52 overflow-hidden rounded-2xl border border-white/10 bg-[#131f2c]">
                <svg
                  viewBox="0 0 420 220"
                  className="absolute inset-0 h-full w-full"
                  fill="none"
                  aria-label="Illustration of a city route"
                  role="img"
                >
                  <g stroke="#334155" strokeWidth="15" opacity=".55">
                    <path d="M-20 45 L130 100 L230 30 L440 90" />
                    <path d="M20 230 L90 135 L180 190 L290 105 L440 160" />
                    <path d="M115 -20 L155 75 L125 155 L175 240" />
                    <path d="M300 -20 L265 65 L340 125 L315 240" />
                  </g>
                  <g stroke="#64748b" strokeWidth="1.5" opacity=".55">
                    <path d="M-20 45 L130 100 L230 30 L440 90" />
                    <path d="M20 230 L90 135 L180 190 L290 105 L440 160" />
                    <path d="M115 -20 L155 75 L125 155 L175 240" />
                    <path d="M300 -20 L265 65 L340 125 L315 240" />
                  </g>
                  <path
                    d="M90 135 C125 120 145 110 180 115 S240 130 265 65"
                    stroke="#bef264"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="7 7"
                  />
                  <circle cx="90" cy="135" r="10" fill="#bef264" />
                  <circle cx="90" cy="135" r="4" fill="#0b1220" />
                  <circle cx="265" cy="65" r="10" fill="#ffffff" />
                  <circle cx="265" cy="65" r="4" fill="#0b1220" />
                  <g transform="translate(166 90)">
                    <rect width="42" height="42" rx="14" fill="#bef264" />
                    <path
                      d="M9 24 L12 16 Q13 13 16 13 H26 Q29 13 30 16 L33 24 V30 H29 V27 H13 V30 H9 Z"
                      fill="#0b1220"
                    />
                    <path d="M14 20 H28" stroke="#bef264" strokeWidth="2" />
                  </g>
                </svg>

                <div className="absolute bottom-3 left-3 rounded-xl border border-white/10 bg-[#080d18]/90 px-3 py-2 backdrop-blur">
                  <p className="text-[10px] text-slate-400">YOUR ROUTE</p>
                  <p className="mt-0.5 text-xs font-semibold">Ready to plan</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-lime-300 p-4 text-slate-950">
                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    READY WHEN YOU ARE
                  </p>
                  <p className="mt-1 font-extrabold">Let's get moving.</p>
                </div>
                <Link
                  to="/signup"
                  aria-label="Get started with GoCab"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-950 text-lime-300 transition hover:scale-105"
                >
                  <FaArrowRight />
                </Link>
              </div>
            </div>

            <div className="absolute -left-5 top-20 hidden items-center gap-3 rounded-2xl border border-white/10 bg-[#111b2a] p-3 shadow-xl sm:flex">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-300/10 text-lime-300">
                <FaShieldHalved />
              </span>
              <div>
                <p className="text-xs font-bold">Designed for confidence</p>
                <p className="mt-1 text-[10px] text-slate-400">
                  A clear ride experience
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-7 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-12">
          {benefits.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 text-sm font-medium text-slate-300"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lime-300">
                <Icon />
              </span>
              {text}
            </div>
          ))}
        </div>
      </section>

      <section
        id="services"
        className="scroll-mt-20 px-5 py-20 sm:px-8 lg:px-12 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <SectionLabel>Built around your journey</SectionLabel>
              <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-5xl">
                A better ride starts with{" "}
                <span className="text-lime-300">a better experience.</span>
              </h2>
            </div>
            <p className="max-w-md leading-7 text-slate-400">
              From the moment you book to the end of your trip, the essentials
              stay simple, clear, and easy to access.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {services.map(({ icon: Icon, title, description, number }) => (
              <article
                key={number}
                className="group rounded-3xl border border-white/10 bg-white/[0.025] p-7 transition duration-300 hover:-translate-y-1 hover:border-lime-300/30 hover:bg-white/[0.045] sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-300/10 text-2xl text-lime-300 transition group-hover:bg-lime-300 group-hover:text-slate-950">
                    <Icon />
                  </span>
                  <span className="text-sm font-bold text-slate-600">
                    {number}
                  </span>
                </div>
                <h3 className="mt-8 text-xl font-bold">{title}</h3>
                <p className="mt-3 leading-7 text-slate-400">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-20 bg-[#0d1523] px-5 py-20 sm:px-8 lg:px-12 lg:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <SectionLabel>Three simple steps</SectionLabel>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              Less planning.
              <br />
              <span className="text-lime-300">More moving.</span>
            </h2>
            <p className="mt-6 max-w-md leading-7 text-slate-400">
              Your time matters. Start your booking journey with a simple,
              straightforward flow.
            </p>
            <Link
              to="/signup"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-lime-300 px-6 py-3.5 font-bold text-slate-950 transition hover:bg-lime-200"
            >
              Get started <FaArrowRight />
            </Link>
          </div>

          <div className="space-y-4">
            {steps.map((step) => (
              <article
                key={step.number}
                className="flex gap-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:gap-6 sm:p-7"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-lime-300/20 bg-lime-300/10 font-extrabold text-lime-300">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 leading-6 text-slate-400">
                    {step.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="why-gocab"
        className="scroll-mt-20 px-5 py-20 sm:px-8 lg:px-12 lg:py-28"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionLabel>A platform built for people</SectionLabel>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              Great journeys begin with{" "}
              <span className="text-lime-300">trust.</span>
            </h2>
            <p className="mt-6 max-w-xl leading-8 text-slate-400">
              We believe booking a ride should feel straightforward. Clear
              information, accessible trip details, and a thoughtful interface
              help you stay informed throughout the journey.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                ["Clear information", "Understand your booking at a glance."],
                ["Thoughtful design", "A focused experience across devices."],
                ["Trip visibility", "Access ride details and status updates."],
                ["Flexible access", "A dedicated experience for each role."],
              ].map(([title, description]) => (
                <div key={title} className="flex gap-3">
                  <FaCheck className="mt-1 shrink-0 text-lime-300" />
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#172438] to-[#0d1420] p-7 sm:p-10">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-lime-300/10 blur-3xl" />

            <div className="relative">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-300 text-slate-950">
                  <FaCarSide size={23} />
                </span>
                <div>
                  <p className="font-extrabold">Your journey, simplified.</p>
                  <p className="mt-1 text-xs text-slate-400">
                    A more thoughtful way to book
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                {[
                  ["Booking experience", "Simple and straightforward"],
                  ["Fare information", "Estimated before confirmation"],
                  ["Ride updates", "Designed for real-time visibility"],
                ].map(([title, description]) => (
                  <div
                    key={title}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/10 p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold">{title}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {description}
                      </p>
                    </div>
                    <FaCheck className="shrink-0 text-lime-300" />
                  </div>
                ))}
              </div>

              <p className="mt-6 text-xs leading-6 text-slate-500">
                Availability of booking, fare, and tracking features depends on
                the backend integrations configured in your application.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-lime-300 px-6 py-12 text-slate-950 sm:px-12 sm:py-16 lg:px-16">
          <div className="absolute -right-10 -top-24 h-64 w-64 rounded-full border-[40px] border-slate-950/[0.06]" />
          <div className="absolute -bottom-28 right-44 h-64 w-64 rounded-full border-[35px] border-slate-950/[0.05]" />

          <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-700">
                Your next journey starts here
              </p>
              <h2 className="mt-4 max-w-2xl text-3xl font-black tracking-tight sm:text-5xl">
                Ready to move on your terms?
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-slate-800/80">
                Create your account and explore the ride-booking experience.
              </p>
            </div>

            <Link
              to="/signup"
              className="inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-slate-950 px-7 py-4 font-bold text-white transition hover:bg-slate-800 md:self-center"
            >
              Create your account <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <Brand light />
            <p className="mt-3 text-xs text-slate-500">
              A thoughtful ride-booking experience.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-sm text-slate-400">
            <a href="#services" className="transition hover:text-lime-300">
              Services
            </a>
            <a
              href="#how-it-works"
              className="transition hover:text-lime-300"
            >
              How it works
            </a>
            <Link to="/signin" className="transition hover:text-lime-300">
              Log in
            </Link>
            <Link to="/signup" className="transition hover:text-lime-300">
              Register
            </Link>
          </div>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} GoCab. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}