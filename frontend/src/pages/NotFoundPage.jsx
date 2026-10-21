import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCarSide,
  FaHouse,
  FaRoute,
} from "react-icons/fa6";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080d18] px-5 py-16 text-white">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px]" />

      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-lime-300/10 blur-[120px]" />

      <section className="relative w-full max-w-2xl text-center">
        <Link to="/" className="mb-12 inline-flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-300 text-slate-950">
            <FaCarSide size={23} />
          </span>

          <span className="text-xl font-black tracking-tight">
            GoCab<span className="text-lime-300">.</span>
          </span>
        </Link>

        <div className="relative mx-auto mb-7 flex h-48 w-48 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] sm:h-56 sm:w-56">
          <div className="absolute inset-4 rounded-full border border-dashed border-lime-300/30" />

          <div className="absolute right-5 top-7 h-3 w-3 rounded-full bg-lime-300" />

          <div className="absolute bottom-8 left-6 h-2 w-2 rounded-full bg-indigo-400" />

          <div className="text-center">
            <FaRoute className="mx-auto mb-2 text-3xl text-lime-300" />

            <span className="text-6xl font-black tracking-tighter sm:text-7xl">
              404
            </span>
          </div>
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.25em] text-lime-300">
          Wrong turn?
        </p>

        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
          Looks like you've
          <br />
          <span className="text-slate-400">
            missed your destination.
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-md leading-7 text-slate-400">
          The page you're looking for doesn't exist or may have moved.
          Let's get you back on the right route.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-3 rounded-full bg-lime-300 px-7 py-4 font-bold text-slate-950 transition hover:bg-lime-200"
          >
            <FaHouse />
            Back to home
          </Link>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-3 rounded-full border border-white/15 px-7 py-4 font-semibold text-white transition hover:bg-white/5"
          >
            <FaArrowLeft />
            Go back
          </button>
        </div>

        <p className="mt-12 text-xs text-slate-600">
          GoCab · A thoughtful ride-booking experience
        </p>
      </section>
    </main>
  );
}