
import { useCallback, useState } from "react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"
).replace(/\/+$/, "");

export default function usePayment() {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createPaymentIntent = useCallback(async ({
    ride_id,
    promo_code,
  }) => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Please sign in before making a payment.");
      }

      const response = await fetch(`${API_URL}/payments/create-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ride_id,
          ...(promo_code ? { promo_code } : {}),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || "Unable to initialize payment.");
      }

      if (!data.client_secret) {
        throw new Error("The server did not return a payment client secret.");
      }

      setPayment(data);
      return data;
    } catch (err) {
      setError(err.message || "Unable to initialize payment.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearPayment = useCallback(() => {
    setPayment(null);
    setError("");
  }, []);

  return {
    payment,
    loading,
    error,
    createPaymentIntent,
    clearPayment,
  };
}
