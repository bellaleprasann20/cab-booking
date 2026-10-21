
import requests


OSRM_BASE_URL = "https://router.project-osrm.org/route/v1/driving"


def get_route(origin: str, destination: str) -> dict:
    """
    Get a driving route using the public OSRM demo server.

    Coordinates must be provided as "latitude,longitude".
    OSRM expects coordinates in "longitude,latitude" order.
    """

    try:
        origin_lat, origin_lng = map(float, origin.split(","))
        destination_lat, destination_lng = map(float, destination.split(","))
    except (ValueError, AttributeError) as exc:
        raise ValueError("Invalid origin or destination coordinates.") from exc

    for lat, lng in (
        (origin_lat, origin_lng),
        (destination_lat, destination_lng),
    ):
        if not (-90 <= lat <= 90 and -180 <= lng <= 180):
            raise ValueError("Coordinates are outside valid latitude/longitude ranges.")

    coordinates = (
        f"{origin_lng},{origin_lat};"
        f"{destination_lng},{destination_lat}"
    )

    try:
        response = requests.get(
            f"{OSRM_BASE_URL}/{coordinates}",
            params={"overview": "simplified", "steps": "false"},
            timeout=15,
        )
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as exc:
        raise RuntimeError("Unable to contact the routing service right now.") from exc
    except ValueError as exc:
        raise RuntimeError("The routing service returned an invalid response.") from exc

    if data.get("code") != "Ok" or not data.get("routes"):
        raise ValueError("No driving route found between these locations.")

    route = data["routes"][0]
    distance_meters = int(round(route["distance"]))
    duration_seconds = int(round(route["duration"]))

    return {
        "distance_meters": distance_meters,
        "distance_km": distance_meters / 1000,
        "duration_seconds": duration_seconds,
        "duration_minutes": duration_seconds / 60,
        "start_address": origin,
        "end_address": destination,
        "polyline": route.get("geometry"),
    }
