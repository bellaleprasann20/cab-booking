
import { useCallback, useState } from "react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"
).replace(/\/+$/, "");

export default function useFareEstimate() {
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getFareEstimate = useCallback(async ({
    pickup_address,
    destination_address,
    ride_type,
  }) => {
    setLoading(true);
    setError("");
    setEstimate(null);

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${API_URL}/rides/estimate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          pickup_address,
          destination_address,
          ...(ride_type ? { ride_type } : {}),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || "Unable to estimate the fare.");
      }

      setEstimate(data);
      return data;
    } catch (err) {
      setError(err.message || "Unable to estimate the fare.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearEstimate = useCallback(() => {
    setEstimate(null);
    setError("");
  }, []);

  return {
    estimate,
    loading,
    error,
    getFareEstimate,
    clearEstimate,
  };
}
