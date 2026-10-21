
import { useCallback, useEffect, useState } from "react";

const DEFAULT_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 5000,
};

export default function useGeolocation({
  watch = false,
  enabled = true,
  options = {},
} = {}) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [supported, setSupported] = useState(true);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setSupported(false);
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        });
        setLoading(false);
      },
      (err) => {
        const messages = {
          1: "Location permission was denied. Allow location access in your browser settings.",
          2: "Your current location could not be determined.",
          3: "Location request timed out. Please try again.",
        };

        setError(messages[err.code] || "Unable to retrieve your location.");
        setLoading(false);
      },
      { ...DEFAULT_OPTIONS, ...options }
    );
  }, [options]);

  useEffect(() => {
    if (!enabled || watch) return;

    // One-time lookup runs only when explicitly requested.
  }, [enabled, watch]);

  useEffect(() => {
    if (!enabled || !watch) return undefined;

    if (!navigator.geolocation) {
      setSupported(false);
      setError("Geolocation is not supported by this browser.");
      return undefined;
    }

    setSupported(true);
    setLoading(true);
    setError("");

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        });
        setLoading(false);
        setError("");
      },
      (err) => {
        const messages = {
          1: "Location permission was denied. Allow location access in your browser settings.",
          2: "Your current location could not be determined.",
          3: "Location request timed out. Waiting for another location update.",
        };

        setError(messages[err.code] || "Unable to track your location.");
        setLoading(false);
      },
      { ...DEFAULT_OPTIONS, ...options }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [enabled, watch, options]);

  return {
    location,
    loading,
    error,
    supported,
    requestLocation,
  };
}
