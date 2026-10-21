
from math import atan2, cos, radians, sin, sqrt


def calculate_distance_km(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
) -> float:
    """Calculate straight-line distance between two coordinates."""
    earth_radius_km = 6371.0

    d_lat = radians(lat2 - lat1)
    d_lon = radians(lon2 - lon1)

    a = (
        sin(d_lat / 2) ** 2
        + cos(radians(lat1))
        * cos(radians(lat2))
        * sin(d_lon / 2) ** 2
    )

    return earth_radius_km * 2 * atan2(sqrt(a), sqrt(1 - a))


def rank_drivers(
    drivers: list[dict],
    pickup_lat: float,
    pickup_lon: float,
    max_distance_km: float = 10.0,
) -> list[dict]:
    """Rank supplied available drivers by pickup distance."""
    ranked = []

    for driver in drivers:
        if not driver.get("is_available", False):
            continue

        distance = calculate_distance_km(
            pickup_lat,
            pickup_lon,
            float(driver["latitude"]),
            float(driver["longitude"]),
        )

        if distance <= max_distance_km:
            ranked.append({**driver, "distance_km": round(distance, 2)})

    return sorted(ranked, key=lambda driver: driver["distance_km"])
