
import { useCallback, useState } from "react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"
).replace(/\/+$/, "");

export default function useReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const apiRequest = useCallback(async (path, options = {}) => {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.detail || "The review request failed.");
    }

    return data;
  }, []);

  const fetchReviews = useCallback(async (rideId) => {
    setLoading(true);
    setError("");

    try {
      const path =
        rideId != null
          ? `/reviews?ride_id=${encodeURIComponent(rideId)}`
          : "/reviews";

      const data = await apiRequest(path);
      const items = Array.isArray(data)
        ? data
        : data.items ?? data.reviews ?? [];

      setReviews(items);
      return items;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  const submitReview = useCallback(async ({
    ride_id,
    driver_id,
    rating,
    comment,
  }) => {
    setSubmitting(true);
    setError("");

    try {
      if (ride_id == null) {
        throw new Error("A ride ID is required.");
      }

      if (!Number.isInteger(Number(rating)) || rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5.");
      }

      if (!comment?.trim()) {
        throw new Error("Please enter a review.");
      }

      const data = await apiRequest("/reviews", {
        method: "POST",
        body: JSON.stringify({
          ride_id,
          ...(driver_id != null ? { driver_id } : {}),
          rating: Number(rating),
          comment: comment.trim(),
        }),
      });

      setReviews((current) => [data, ...current]);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [apiRequest]);

  return {
    reviews,
    loading,
    submitting,
    error,
    fetchReviews,
    submitReview,
    setReviews,
  };
}
