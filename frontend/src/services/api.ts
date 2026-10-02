const API_BASE_URL = "http://localhost:5000/api";

export async function checkBackendHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error(`Backend responded with status ${response.status}`);
  }

  return response.json();
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    preferredLanguage: string;
  };
}

export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Registration failed");
  }

  return data;
}

export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  return data;
}

export async function summarizeText(
  text: string,
  token: string | null
): Promise<{ summary: string }> {
  const response = await fetch(`${API_BASE_URL}/ocr/summarize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ text }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Summarization failed");
  }

  return data;
}

interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
}

interface NavigationResult {
  destination: string;
  destinationCoords: { latitude: number; longitude: number };
  route: {
    steps: RouteStep[];
    totalDistance: number;
    totalDuration: number;
  };
}

export async function getNavigationRoute(
  destination: string,
  currentLatitude: number,
  currentLongitude: number
): Promise<NavigationResult> {
  const response = await fetch(`${API_BASE_URL}/navigation/route`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ destination, currentLatitude, currentLongitude }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Navigation failed");
  }

  return data;
}

export async function getNavigationRouteByCoords(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number
): Promise<{ steps: RouteStep[]; totalDistance: number; totalDuration: number }> {
  const response = await fetch(`${API_BASE_URL}/navigation/route-coords`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ startLat, startLon, endLat, endLon }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Navigation failed");
  }

  return data.route;
}

export interface SavedPlace {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

export async function createSavedPlace(
  name: string,
  latitude: number,
  longitude: number,
  token: string
): Promise<{ place: SavedPlace }> {
  const response = await fetch(`${API_BASE_URL}/saved-places`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, latitude, longitude }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Could not save this place");
  }

  return data;
}

export async function listSavedPlaces(token: string): Promise<{ places: SavedPlace[] }> {
  const response = await fetch(`${API_BASE_URL}/saved-places`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Could not load saved places");
  }

  return data;
}

export async function deleteSavedPlace(id: string, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/saved-places/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Could not delete this place");
  }
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export async function createContact(
  name: string,
  phone: string,
  relationship: string,
  token: string
): Promise<{ contact: EmergencyContact }> {
  const response = await fetch(`${API_BASE_URL}/emergency-contacts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, phone, relationship }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Could not save this contact");
  }

  return data;
}

export async function listContacts(token: string): Promise<{ contacts: EmergencyContact[] }> {
  const response = await fetch(`${API_BASE_URL}/emergency-contacts`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Could not load contacts");
  }

  return data;
}

export async function deleteContact(id: string, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/emergency-contacts/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Could not delete this contact");
  }
}

export interface SosEvent {
  id: string;
  latitude: number;
  longitude: number;
  message: string | null;
  status: string;
  createdAt: string;
}

export async function triggerSos(
  latitude: number,
  longitude: number,
  token: string,
  message?: string
): Promise<{ sosEvent: SosEvent; contacts: EmergencyContact[] }> {
  const response = await fetch(`${API_BASE_URL}/sos/trigger`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ latitude, longitude, message }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Could not trigger SOS");
  }

  return data;
}