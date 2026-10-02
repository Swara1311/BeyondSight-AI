import { useState, useCallback } from "react";

type LocationStatus = "idle" | "requesting" | "success" | "denied" | "unavailable" | "error";

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface UseLocationResult {
  status: LocationStatus;
  location: LocationData | null;
  errorMessage: string | null;
  getCurrentLocation: () => void;
}

export function useLocation(): UseLocationResult {
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("unavailable");
      setErrorMessage("Location services are not supported on this device.");
      return;
    }

    setStatus("requesting");
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setStatus("success");
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setStatus("denied");
          setErrorMessage("Location permission was denied. Please allow location access.");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setStatus("unavailable");
          setErrorMessage("Your location could not be determined.");
        } else {
          setStatus("error");
          setErrorMessage("Something went wrong while getting your location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  return { status, location, errorMessage, getCurrentLocation };
}