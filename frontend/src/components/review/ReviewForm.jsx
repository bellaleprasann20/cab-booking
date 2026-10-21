
import { useState } from "react";
import { FaCheckCircle, FaPaperPlane } from "react-icons/fa6";
import RatingStars from "./RatingStars";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"
).replace(/\/+$/, "");

export default function ReviewForm({
  rideId,
  driverId,
  onSubmitted,
  className = "",
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (rideId == null || rideId === "") {
      setError("A valid ride is required before submitting a review.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setError("Please select a rating from 1 to 5 stars.");
      return;
    }

    if (!comment.trim()) {
      setError("Please write a short review.");
      return;
    }

    if (comment.trim().length > 1000) {
      setError("Your review must be 1000 characters or fewer.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ride_id: rideId,
          ...(driverId != null ? { driver_id: driverId } : {}),
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || "Unable to submit your review."
        );
      }

      if (onSubmitted) {
        await onSubmitted(data);
      }

      setSuccess(true);
      setRating(0);
      setComment("");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className={`rounded-3xl border border-white/10 bg-[#0d1523] p-5 sm:p-6 ${className}`}
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">
          Your feedback
        </p>
        <h2 className="mt-2 text-xl font-black text-white">
          Rate your ride
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Tell us how your ride experience went.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="mb-3 block text-sm font-semibold text-slate-200">
            Your rating
          </label>

          <RatingStars
            value={rating}
            onChange={setRating}
            size="lg"
            label="Choose your ride rating"
          />
        </div>

        <div>
          <label
            htmlFor="ride-review"
            className="mb-2 block text-sm font-semibold text-slate-200"
          >
            Write your review
          </label>

          <textarea
            id="ride-review"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="How was the driver, journey, and overall experience?"
            rows={4}
            maxLength={1000}
            required
            className="w-full resize-y rounded-xl border border-white/10 bg-[#080d16] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-lime-300/50"
          />

          <p className="mt-2 text-right text-xs text-slate-500">
            {comment.length}/1000
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200"
          >
            {error}
          </p>
        )}

        {success && (
          <p
            role="status"
            className="flex items-center gap-2 rounded-xl border border-lime-300/20 bg-lime-300/5 p-3 text-sm text-lime-200"
          >
            <FaCheckCircle />
            Your review was submitted successfully.
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-lime-300 px-5 py-3.5 font-bold text-slate-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <FaPaperPlane />
          {loading ? "Submitting..." : "Submit review"}
        </button>
      </form>
    </section>
  );
}
