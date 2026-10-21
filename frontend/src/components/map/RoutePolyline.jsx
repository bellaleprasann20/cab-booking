
import { Polyline } from "react-leaflet";

export default function RoutePolyline({
  positions = [],
  color = "#d9ff65",
  weight = 5,
  opacity = 0.9,
}) {
  const validPositions = positions
    .map((point) => {
      if (!Array.isArray(point) || point.length < 2) {
        return null;
      }

      const lat = Number(point[0]);
      const lng = Number(point[1]);

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
    })
    .filter(Boolean);

  if (validPositions.length < 2) return null;

  return (
    <Polyline
      positions={validPositions}
      pathOptions={{
        color,
        weight,
        opacity,
        lineCap: "round",
        lineJoin: "round",
      }}
    />
  );
}
