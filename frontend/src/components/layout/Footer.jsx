
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaCarSide,
  FaGithub,
  FaShieldHalved,
} from "react-icons/fa6";

const footerLinks = [
  { label: "Home", to: "/" },
  { label: "All Services", to: "/services" },
  { label: "Book a ride", to: "/rider/book" },
  { label: "Sign in", to: "/signin" },
  { label: "Create account", to: "/signup" },
];

export default function Footer() {
  const githubUrl = import.meta.env.VITE_GITHUB_URL || "";

  return (
    <footer className="border-t border-white/10 bg-[#080d18] text-white">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-300 text-lg text-slate-950">
                <FaCarSide />
              </span>
              <span className="text-xl font-black">
                GoCab<span className="text-lime-300">.</span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              A smarter way to plan your next ride. Explore convenient
              ride-booking features with a simple, modern experience.
            </p>

            <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
              <FaShieldHalved className="text-lime-300" />
              Designed with safety and convenience in mind
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold">Explore GoCab</h2>
            <ul className="mt-5 space-y-3">
              {footerLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-lime-300"
                  >
                    <FaArrowRight className="text-[10px]" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold">Project information</h2>
            <p className="mt-5 text-sm leading-7 text-slate-400">
              GoCab is a ride-booking platform. Ride availability, rewards,
              payments, and tracking depend on the configured application
              services.
            </p>

            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-lime-300/30 hover:text-lime-300"
              >
                <FaGithub /> View source code
              </a>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} GoCab. All rights reserved.</p>
          <p>Built with React and FastAPI.</p>
        </div>
      </div>
    </footer>
  );
}