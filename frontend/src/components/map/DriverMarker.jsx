
import { useMemo } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const driverIcon = L.divIcon({
  className: "gocab-driver-marker",
  html: `
    <div style="
      width:42px;
      height:42px;
      display:flex;
      align-items:center;
      justify-content:center;
      border-radius:14px;
      background:#d9ff65;
      border:3px solid #080d18;
      box-shadow:0 5px 18px rgba(0,0,0,.35);
      color:#080d18;
      font-size:19px;
    ">🚘</div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -22],
});

export default function DriverMarker({
  position,
  driverName = "Your driver",
  phoneNumber,
  vehicleNumber,
}) {
  const coordinates = useMemo(() => {
    if (!position) return null;

    const lat = Number(position.lat ?? position.latitude);
    const lng = Number(
      position.lng ?? position.lon ?? position.longitude
    );

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
  }, [position]);

  if (!coordinates) return null;

  const phone = phoneNumber ? String(phoneNumber).trim() : "";

  return (
    <Marker position={coordinates} icon={driverIcon}>
      <Popup>
        <div className="min-w-40 text-sm">
          <p className="font-bold">{driverName}</p>

          {phone && (
            <p className="mt-2">
              <span className="font-semibold">Phone: </span>
              <a href={`tel:${phone}`} className="text-blue-600 underline">
                {phone}
              </a>
            </p>
          )}

          {vehicleNumber && (
            <p className="mt-1 text-slate-600">
              Vehicle: {vehicleNumber}
            </p>
          )}

          <p className="mt-2 text-xs text-slate-500">
            Latest reported driver location
          </p>
        </div>
      </Popup>
    </Marker>
  );
}
