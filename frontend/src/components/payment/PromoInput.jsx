
import { useEffect, useState } from "react";
import { FaCheck, FaTag, FaTimes } from "react-icons/fa";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"
).replace(/\/+$/, "");

export default function PromoInput({
  rideId,
  onApplied,
  onRemoved,
  appliedPromo,
}) {
  const [code, setCode] = useState(appliedPromo?.code || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setCode(appliedPromo?.code || "");
  }, [appliedPromo?.code]);

  const handleApply = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");
    setSuccess("");

    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      setError("Please enter a promo code.");
      return;
    }

    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("token");

    if (!token) {
      setError("Please sign in to apply a promo code.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/promos/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: normalizedCode,
          ride_id: rideId || null,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : data.message || "Could not validate promo code."
        );
      }

      if (data.valid !== true && data.is_valid !== true) {
        throw new Error(data.message || "This promo code is invalid.");
      }

      const promo = {
        ...data,
        code: data.code || normalizedCode,
      };

      setCode(promo.code);
      setSuccess(data.message || "Promo code applied successfully.");
      onApplied?.(promo);
    } catch (err) {
      setError(err.message || "Could not apply promo code.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setCode("");
    setError("");
    setSuccess("");
    onRemoved?.();
  };

  if (appliedPromo) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-white">
        <div className="flex min-w-0 items-center gap-3">
          <FaCheck className="shrink-0 text-emerald-400" />

          <div className="min-w-0">
            <p className="font-semibold">{appliedPromo.code} applied</p>
            <p className="text-sm text-slate-300">
              {appliedPromo.message || "Discount verified by backend"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRemove}
          className="shrink-0 rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
          aria-label="Remove promo code"
        >
          <FaTimes />
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleApply}
      className="rounded-xl border border-white/10 bg-[#0c1422] p-4"
    >
      <label
        htmlFor="promo-code"
        className="mb-3 flex items-center gap-2 font-semibold text-white"
      >
        <FaTag className="text-lime-300" />
        Have a promo code?
      </label>

      <div className="flex gap-2">
        <input
          id="promo-code"
          type="text"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="Enter promo code"
          maxLength={40}
          autoComplete="off"
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#101827] px-3 py-3 text-white outline-none placeholder:text-slate-500 focus:border-lime-300/60"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-lime-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Checking..." : "Apply"}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {success && (
        <p role="status" className="mt-3 text-sm text-emerald-400">
          {success}
        </p>
      )}
    </form>
  );
}
