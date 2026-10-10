interface Coordinates {
  latitude: number;
  longitude: number;
}

interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
}

interface RouteResult {
  steps: RouteStep[];
  totalDistance: number;
  totalDuration: number;
}

const ORS_BASE_URL = "https://api.openrouteservice.org";

async function geocodeWithOrs(query: string, near: Coordinates): Promise<Coordinates | null> {
  const apiKey = process.env.OPENROUTE_API_KEY;
  if (!apiKey) return null;

  const url =
    `${ORS_BASE_URL}/geocode/search?api_key=${encodeURIComponent(apiKey)}` +
    `&text=${encodeURIComponent(query)}` +
    `&focus.point.lon=${near.longitude}&focus.point.lat=${near.latitude}` +
    `&boundary.country=IN&size=1`;

  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.text();
    console.error("ORS geocode error:", response.status, body.slice(0, 300));
    return null;
  }

  const data = await response.json();
  const coords = data.features?.[0]?.geometry?.coordinates;
  if (!coords) return null;

  return { latitude: coords[1], longitude: coords[0] };
}

async function geocodeWithNominatim(query: string, near: Coordinates): Promise<Coordinates | null> {
  const contact = process.env.CONTACT_EMAIL || "student-project";
  const headers = { "User-Agent": `BeyondSightAI/1.0 (${contact})` };

  for (const offset of [0.3, 1.5]) {
    const viewbox = [
      near.longitude - offset,
      near.latitude + offset,
      near.longitude + offset,
      near.latitude - offset,
    ].join(",");

    const url =
      `https://nominatim.openstreetmap.org/search?format=json&limit=1` +
      `&q=${encodeURIComponent(query)}&viewbox=${viewbox}&bounded=1`;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      console.error("Nominatim error:", response.status);
      return null;
    }

    const data = await response.json();
    if (data && data.length > 0) {
      return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
    }
  }

  return null;
}

export async function geocodePlace(
  query: string,
  nearLatitude: number,
  nearLongitude: number
): Promise<Coordinates> {
  const near = { latitude: nearLatitude, longitude: nearLongitude };

  try {
    const result = await geocodeWithOrs(query, near);
    if (result) return result;
  } catch (error) {
    console.error("ORS geocode failed:", error);
  }

  try {
    const result = await geocodeWithNominatim(query, near);
    if (result) return result;
  } catch (error) {
    console.error("Nominatim geocode failed:", error);
  }

  throw new Error(
    `Could not find "${query}". Try saying the city too, for example "Pune railway station".`
  );
}

export async function getRoute(start: Coordinates, end: Coordinates): Promise<RouteResult> {
  const apiKey = process.env.OPENROUTE_API_KEY;

  if (!apiKey) {
    throw new Error("Navigation service is not configured.");
  }

  const response = await fetch(`${ORS_BASE_URL}/v2/directions/foot-walking`, {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      coordinates: [
        [start.longitude, start.latitude],
        [end.longitude, end.latitude],
      ],
      radiuses: [-1, -1],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenRouteService route error:", response.status, errorText.slice(0, 300));
    throw new Error("Could not calculate a route to that destination.");
  }

  const data = await response.json();
  const route = data.routes?.[0];

  if (!route) {
    throw new Error("No route was found to that destination.");
  }

  const steps: RouteStep[] = [];
  route.segments?.[0]?.steps?.forEach((step: any) => {
    steps.push({
      instruction: step.instruction,
      distance: Math.round(step.distance),
      duration: Math.round(step.duration),
    });
  });

  return {
    steps,
    totalDistance: Math.round(route.summary.distance),
    totalDuration: Math.round(route.summary.duration),
  };
}