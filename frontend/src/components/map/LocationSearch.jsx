
import { useEffect, useRef, useState } from "react";
import {
  FaLocationDot,
  FaMagnifyingGlass,
  FaXmark,
} from "react-icons/fa6";

const SEARCH_URL = "https://nominatim.openstreetmap.org/search";

export default function LocationSearch({
  onSelect,
  placeholder = "Search pickup or destination...",
  initialValue = "",
}) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const requestRef = useRef(0);

  useEffect(() => {
    setQuery(initialValue || "");
  }, [initialValue]);

  useEffect(() => {
    const term = query.trim();
    const requestId = ++requestRef.current;

    if (term.length < 3) {
      setResults([]);
      setLoading(false);
      setError("");
      return undefined;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          q: term,
          format: "jsonv2",
          limit: "5",
          addressdetails: "1",
        });

        const response = await fetch(`${SEARCH_URL}?${params}`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(
            "Location search is temporarily unavailable. Please try again."
          );
        }

        const data = await response.json();

        if (requestId === requestRef.current) {
          setResults(Array.isArray(data) ? data : []);
          setOpen(true);
        }
      } catch (err) {
        if (
          err.name !== "AbortError" &&
          requestId === requestRef.current
        ) {
          setError(err.message || "Unable to search for this location.");
          setResults([]);
        }
      } finally {
        if (requestId === requestRef.current) {
          setLoading(false);
        }
      }
    }, 600);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  function selectResult(result) {
    const location = {
      label: result.display_name,
      lat: Number(result.lat),
      lng: Number(result.lon),
    };

    setQuery(location.label);
    setResults([]);
    setOpen(false);
    setError("");
    onSelect?.(location);
  }

  function clearSearch() {
    setQuery("");
    setResults([]);
    setOpen(false);
    setError("");
    onSelect?.(null);
  }

  return (
    <div className="relative w-full">
      <label className="relative flex items-center">
        <FaMagnifyingGlass className="pointer-events-none absolute left-4 text-slate-400" />

        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
          placeholder={placeholder}
          autoComplete="off"
          aria-label={placeholder}
          aria-expanded={open && results.length > 0}
          className="w-full rounded-xl border border-white/10 bg-[#101827] py-3.5 pl-11 pr-11 text-sm text-white outline-none placeholder:text-slate-500 focus:border-lime-300/50"
        />

        {query && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear location search"
            className="absolute right-3 rounded-lg p-2 text-slate-400 hover:text-white"
          >
            <FaXmark />
          </button>
        )}
      </label>

      {loading && (
        <p className="mt-2 text-xs text-slate-400">
          Searching locations...
        </p>
      )}

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-300">
          {error}
        </p>
      )}

      {open && results.length > 0 && (
        <div className="absolute inset-x-0 top-full z-[1000] mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1523] shadow-2xl">
          {results.map((result) => (
            <button
              type="button"
              key={`${result.place_id}-${result.lat}-${result.lon}`}
              onClick={() => selectResult(result)}
              className="flex w-full items-start gap-3 border-b border-white/[0.06] px-4 py-3.5 text-left last:border-b-0 hover:bg-white/[0.05]"
            >
              <FaLocationDot className="mt-1 shrink-0 text-lime-300" />
              <span className="text-sm leading-5 text-slate-200">
                {result.display_name}
              </span>
            </button>
          ))}
        </div>
      )}

      {open &&
        !loading &&
        !error &&
        query.trim().length >= 3 &&
        results.length === 0 && (
          <div className="absolute inset-x-0 top-full z-[1000] mt-2 rounded-xl border border-white/10 bg-[#0d1523] p-4 text-sm text-slate-400 shadow-xl">
            No locations found. Try a nearby landmark or a more specific address.
          </div>
        )}
    </div>
  );
}
