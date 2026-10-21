
import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import DriverMarker from "./DriverMarker";
import RoutePolyline from "./RoutePolyline";
import LocationSearch from "./LocationSearch";

const DEFAULT_CENTER = [12.9716, 77.5946];

function makePin(color, letter) {
  return L.divIcon({
    className: "gocab-location-pin",
    html: `
      <div style="
        width:34px;
        height:34px;
        display:flex;
        align-items:center;
        justify-content:center;
        border-radius:50% 50% 50% 8px;
        transform:rotate(-45deg);
        background:${color};
        border:3px solid #080d18;
        box-shadow:0 4px 12px rgba(0,0,0,.35);
      ">
        <span style="
          color:#080d18;
          font-size:12px;
          font-weight:900;
          transform:rotate(45deg);
        ">${letter}</span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32],
  });
}

const pickupIcon = makePin("#d9ff65", "P");
const destinationIcon = makePin("#fb923c", "D");

function toLatLng(value) {
  if (!value) return null;

  const lat = Number(value.lat ?? value.latitude);
  const lng = Number(value.lng ?? value.lon ?? value.longitude);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }

  return [lat, lng];
}

function MapController({ center, routePositions, pickup, destination }) {
  const map = useMap();

  useEffect(() => {
    const routePoints = (routePositions || [])
      .map((point) =>
        Array.isArray(point)
          ? point.length >= 2 &&
            Number.isFinite(Number(point[0])) &&
            Number.isFinite(Number(point[1]))
            ? [Number(point[0]), Number(point[1])]
            : null
          : toLatLng(point)
      )
      .filter(Boolean);

    const points = [
      toLatLng(pickup),
      toLatLng(destination),
      ...routePoints,
    ].filter(Boolean);

    if (points.length >= 2) {
      map.fitBounds(points, {
        padding: [40, 40],
        maxZoom: 15,
      });
    } else if (points.length === 1) {
      map.setView(points[0], 15);
    } else {
      const nextCenter = toLatLng(center);
      if (nextCenter) map.setView(nextCenter, map.getZoom());
    }
  }, [map, center, pickup, destination, routePositions]);

  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(event) {
      onMapClick?.({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  return null;
}

export default function MapView({
  center = DEFAULT_CENTER,
  zoom = 12,
  pickup = null,
  destination = null,
  driver = null,
  routePositions = [],
  onPickupSelect,
  onDestinationSelect,
  onMapClick,
  showSearch = false,
  className = "",
  height = "480px",
}) {
  const safeCenter = useMemo(
    () => toLatLng(center) || DEFAULT_CENTER,
    [center]
  );

  const pickupPosition = toLatLng(pickup);
  const destinationPosition = toLatLng(destination);

  const driverPosition = driver?.position || driver;

  const driverName =
    driver?.name ||
    driver?.full_name ||
    driver?.driver_name ||
    "Your driver";

  const driverPhone =
    driver?.phone_number ||
    driver?.phoneNumber ||
    driver?.phone ||
    driver?.mobile_number ||
    driver?.mobile ||
    "";

  const vehicleNumber =
    driver?.vehicleNumber ||
    driver?.vehicle_number ||
    driver?.vehicle?.registration_number ||
    "";

  return (
    <div className={`w-full ${className}`}>
      {showSearch && (
        <div className="relative z-20 mb-4 grid gap-3 sm:grid-cols-2">
          <LocationSearch
            key={`pickup-${pickup?.label || ""}`}
            placeholder="Search pickup location..."
            initialValue={pickup?.label || ""}
            onSelect={onPickupSelect}
          />

          <LocationSearch
            key={`destination-${destination?.label || ""}`}
            placeholder="Search destination..."
            initialValue={destination?.label || ""}
            onSelect={onDestinationSelect}
          />
        </div>
      )}

      <div
        className="relative z-0 overflow-hidden rounded-2xl border border-white/10 bg-[#101827]"
        style={{ height }}
      >
        <MapContainer
          center={safeCenter}
          zoom={zoom}
          scrollWheelZoom
          className="h-full w-full"
          style={{ background: "#101827" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController
            center={safeCenter}
            routePositions={routePositions}
            pickup={pickup}
            destination={destination}
          />

          <MapClickHandler onMapClick={onMapClick} />

          {pickupPosition && (
            <Marker position={pickupPosition} icon={pickupIcon}>
              <Popup>
                <strong>Pickup</strong>
                <br />
                {pickup?.label || "Pickup location"}
              </Popup>
            </Marker>
          )}

          {destinationPosition && (
            <Marker position={destinationPosition} icon={destinationIcon}>
              <Popup>
                <strong>Destination</strong>
                <br />
                {destination?.label || "Destination location"}
              </Popup>
            </Marker>
          )}

          <RoutePolyline positions={routePositions} />

          {driver && (
            <DriverMarker
              position={driverPosition}
              driverName={driverName}
              phoneNumber={driverPhone}
              vehicleNumber={vehicleNumber}
            />
          )}
        </MapContainer>
      </div>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        Map data © OpenStreetMap contributors. Driver position and route
        accuracy depend on data supplied by your backend and routing service.
      </p>
    </div>
  );
}
