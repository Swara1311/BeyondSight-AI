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

export async function geocodePlace(
  query: string,
  nearLatitude: number,
  nearLongitude: number
): Promise<Coordinates> {
  const viewboxOffset = 0.3;
  const viewbox = [
    nearLongitude - viewboxOffset,
    nearLatitude + viewboxOffset,
    nearLongitude + viewboxOffset,
    nearLatitude - viewboxOffset,
  ].join(",");

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query
  )}&limit=1&viewbox=${viewbox}&bounded=1`;

  const response = await fetch(url, {
    headers: { "User-Agent": "BeyondSightAI/1.0" },
  });

  if (!response.ok) {
    throw new Error("Could not search for that place.");
  }

  const data = await response.json();

  if (!data || data.length === 0) {
    throw new Error(`Could not find "${query}" near you.`);
  }

  return {
    latitude: parseFloat(data[0].lat),
    longitude: parseFloat(data[0].lon),
  };
}

export async function getRoute(
  start: Coordinates,
  end: Coordinates
): Promise<RouteResult> {
  const apiKey = process.env.OPENROUTE_API_KEY;

  if (!apiKey) {
    throw new Error("Navigation service is not configured.");
  }

  const url = "https://api.openrouteservice.org/v2/directions/foot-walking";

  const response = await fetch(url, {
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
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenRouteService error:", response.status, errorText);
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