export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

  const response = await fetch(url, {
    headers: {
      "Accept-Language": "en",
    },
  });

  if (!response.ok) {
    throw new Error("Could not determine your address.");
  }

  const data = await response.json();

  if (data.display_name) {
    return data.display_name;
  }

  throw new Error("Address not found for this location.");
}