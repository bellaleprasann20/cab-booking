
import { useCallback, useState } from "react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"
).replace(/\/+$/, "");

export default function useBookRide() {
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bookRide = useCallback(async ({
    pickup_address,
    destination_address,
    ride_type,
    promo_code,
  }) => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Please sign in before booking a ride.");
      }

      const response = await fetch(`${API_URL}/rides`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pickup_address,
          destination_address,
          ride_type,
          ...(promo_code ? { promo_code } : {}),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || "Unable to book your ride.");
      }

      setRide(data);
      return data;
    } catch (err) {
      setError(err.message || "Unable to book your ride.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { ride, loading, error, bookRide, setRide };
}
