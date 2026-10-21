
import { useCallback, useEffect, useState } from "react";
import useSocket from "./useSocket";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"
).replace(/\/+$/, "");

export default function useRide(rideId, { live = true } = {}) {
  const [ride, setRide] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    connected,
    error: socketError,
    subscribe,
  } = useSocket({ enabled: live && Boolean(rideId) });

  const refreshRide = useCallback(async () => {
    if (rideId == null || rideId === "") {
      setRide(null);
      return null;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/rides/${encodeURIComponent(rideId)}`,
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || "Unable to load ride details.");
      }

      setRide(data);
      return data;
    } catch (err) {
      setError(err.message || "Unable to load ride details.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [rideId]);

  useEffect(() => {
    if (rideId == null || rideId === "") {
      setRide(null);
      setDriverLocation(null);
      return;
    }

    refreshRide().catch(() => {});
  }, [rideId, refreshRide]);

  useEffect(() => {
    if (!live || !rideId) return undefined;

    const unsubscribeStatus = subscribe("ride_status", (payload) => {
      const eventRideId = payload?.ride_id ?? payload?.rideId;

      if (
        eventRideId != null &&
        String(eventRideId) === String(rideId)
      ) {
        if (payload.status) {
          setRide((current) =>
            current ? { ...current, status: payload.status } : current
          );
        }

        refreshRide().catch(() => {});
      }
    });

    const unsubscribeLocation = subscribe("driver_location", (payload) => {
      const eventRideId = payload?.ride_id ?? payload?.rideId;

      if (
        eventRideId != null &&
        String(eventRideId) === String(rideId)
      ) {
        const lat = Number(payload.lat ?? payload.latitude);
        const lng = Number(payload.lng ?? payload.longitude);

        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          setDriverLocation({
            lat,
            lng,
            heading: payload.heading ?? null,
            updatedAt: Date.now(),
          });
        }
      }
    });

    return () => {
      unsubscribeStatus();
      unsubscribeLocation();
    };
  }, [live, rideId, subscribe, refreshRide]);

  return {
    ride,
    driverLocation,
    loading,
    error,
    connected,
    socketError,
    refreshRide,
    setRide,
  };
}
