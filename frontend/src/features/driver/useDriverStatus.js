
import { useCallback, useEffect, useState } from "react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"
).replace(/\/+$/, "");

export default function useDriverStatus({ autoLoad = true } = {}) {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const request = useCallback(async (path, options = {}) => {
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
      throw new Error(data.detail || "Driver request failed.");
    }

    return data;
  }, []);

  const refreshDriver = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await request("/drivers/me");
      setDriver(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [request]);

  const setAvailability = useCallback(async (isAvailable) => {
    setUpdating(true);
    setError("");

    try {
      const data = await request("/drivers/me/availability", {
        method: "PATCH",
        body: JSON.stringify({ is_available: isAvailable }),
      });

      setDriver((current) =>
        current ? { ...current, ...data, is_available: isAvailable } : data
      );

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, [request]);

  useEffect(() => {
    if (!autoLoad) return;

    refreshDriver().catch(() => {});
  }, [autoLoad, refreshDriver]);

  return {
    driver,
    loading,
    updating,
    error,
    refreshDriver,
    setAvailability,
  };
}
