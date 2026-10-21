
import { useState } from "react";
import {
  FaCheckCircle,
  FaCreditCard,
  FaSpinner,
  FaTimesCircle,
} from "react-icons/fa";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"
).replace(/\/+$/, "");

const getToken = () =>
  localStorage.getItem("access_token") ||
  localStorage.getItem("token");

export default function CheckoutForm({
  rideId,
  amount,
  promoCode,
  onSuccess,
  onError,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [payment, setPayment] = useState(null);

  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

  const handlePayment = async () => {
    if (loading) return;

    setError("");
    setPayment(null);

    if (!rideId) {
      setError("Ride ID is missing. Please book a ride first.");
      return;
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      setError("The payment amount is invalid.");
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Please sign in before making a payment.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/payments/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ride_id: rideId,
          promo_code: promoCode || null,
          payment_method: "demo",
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : data.message || "Unable to process payment."
        );
      }

      const status = String(
        data.status || data.payment_status || ""
      ).toLowerCase();

      if (!["success", "succeeded"].includes(status)) {
        throw new Error(
          data.message ||
            "The backend has not confirmed payment success."
        );
      }

      setPayment(data);
      onSuccess?.(data);
    } catch (err) {
      const message = err.message || "Payment failed. Please try again.";
      setError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  if (payment) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center text-white">
        <FaCheckCircle className="mx-auto mb-3 text-4xl text-emerald-400" />

        <h3 className="text-xl font-bold">Payment Successful</h3>

        <p className="mt-2 text-slate-300">
          {formattedAmount} — payment confirmed by the backend.
        </p>

        {payment.payment_id && (
          <p className="mt-2 break-all text-sm text-slate-400">
            Payment ID: {payment.payment_id}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c1422] p-6 text-white">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl bg-lime-300/10 p-3">
          <FaCreditCard className="text-xl text-lime-300" />
        </div>

        <div>
          <h3 className="text-lg font-bold">Confirm Payment</h3>
          <p className="text-sm text-slate-400">
            Payment is processed and recorded by the GoCab backend.
          </p>
        </div>
      </div>

      <div className="mb-5 rounded-xl bg-[#101827] p-4">
        <p className="text-sm text-slate-400">Amount</p>
        <p className="mt-1 text-3xl font-bold">{formattedAmount}</p>

        {promoCode && (
          <p className="mt-2 text-sm text-emerald-400">
            Promo code: {promoCode}
          </p>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 flex gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-300"
        >
          <FaTimesCircle className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handlePayment}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-lime-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <FaSpinner className="animate-spin" />
            Processing...
          </>
        ) : (
          `Confirm Demo Payment · ${formattedAmount}`
        )}
      </button>

      <p className="mt-3 text-center text-xs text-slate-500">
        Demo mode only. This does not charge a bank account or transfer money.
      </p>
    </div>
  );
}
