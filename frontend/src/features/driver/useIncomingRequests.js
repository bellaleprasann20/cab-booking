
import { useCallback, useEffect, useState } from "react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"
).replace(/\/+$/, "");

export default function useIncomingRequests({ autoLoad = true } = {}) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
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
      throw new Error(data.detail || "The ride request failed.");
    }

    return data;
  }, []);

  const refreshRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/drivers/ride-requests");
      const items = Array.isArray(data)
        ? data
        : data.items ?? data.requests ?? [];

      setRequests(items);
      return items;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  const respondToRequest = useCallback(async (ride, action) => {
    const id = ride?.id ?? ride?.ride_id;

    if (id == null) {
      throw new Error("The ride request is missing its ID.");
    }

    setActionId(String(id));
    setError("");

    try {
      const result = await apiRequest(
        `/rides/${encodeURIComponent(id)}/${action}`,
        { method: "POST" }
      );

      setRequests((current) =>
        current.filter(
          (item) => String(item.id ?? item.ride_id) !== String(id)
        )
      );

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setActionId(null);
    }
  }, [apiRequest]);

  const acceptRequest = useCallback(
    (ride) => respondToRequest(ride, "accept"),
    [respondToRequest]
  );

  const rejectRequest = useCallback(
    (ride) => respondToRequest(ride, "reject"),
    [respondToRequest]
  );

  useEffect(() => {
    if (!autoLoad) return;

    refreshRequests().catch(() => {});
  }, [autoLoad, refreshRequests]);

  return {
    requests,
    loading,
    actionId,
    error,
    refreshRequests,
    acceptRequest,
    rejectRequest,
  };
}
