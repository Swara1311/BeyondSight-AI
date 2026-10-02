import { useState, useEffect, useCallback, useRef } from "react";
import Button from "./Button";
import Card from "./Card";
import VoiceOrb from "./VoiceOrb";
import { listSavedPlaces, deleteSavedPlace, createSavedPlace } from "../services/api";
import type { SavedPlace } from "../services/api";
import { useTextToSpeech } from "../hooks/useTextToSpeech";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useLanguage } from "../context/LanguageContext";

interface SavedPlacesViewProps {
  token: string;
  onNavigateToPlace: (place: SavedPlace) => void;
  onClose: () => void;
}

export default function SavedPlacesView({ token, onNavigateToPlace, onClose }: SavedPlacesViewProps) {
  const [places, setPlaces] = useState<SavedPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastHeardText, setLastHeardText] = useState("");
  const [awaitingPlaceName, setAwaitingPlaceName] = useState(false);

  const { speak, stop } = useTextToSpeech();
  const { language, speechLang } = useLanguage();
  const awaitingPlaceNameRef = useRef(awaitingPlaceName);

  useEffect(() => {
    awaitingPlaceNameRef.current = awaitingPlaceName;
  }, [awaitingPlaceName]);

  useEffect(() => {
    loadPlaces();
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  async function loadPlaces() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listSavedPlaces(token);
      setPlaces(result.places);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load saved places");
    } finally {
      setIsLoading(false);
    }
  }

  const saveCurrentLocationAs = useCallback(
    (placeName: string) => {
      if (!placeName.trim()) return;

      setIsSaving(true);
      setSaveError(null);
      setAwaitingPlaceName(false);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await createSavedPlace(
              placeName.trim(),
              position.coords.latitude,
              position.coords.longitude,
              token
            );
            setNewPlaceName("");
            setShowAddForm(false);
            speak(`Saved this location as ${placeName}.`, language);
            await loadPlaces();
          } catch (err) {
            setSaveError(err instanceof Error ? err.message : "Could not save this place");
            speak("Sorry, I could not save this place.", language);
          } finally {
            setIsSaving(false);
          }
        },
        () => {
          setSaveError("Could not get your current location.");
          setIsSaving(false);
          speak("Sorry, I could not get your location.", language);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    },
    [token, speak, language]
  );

  function handleSaveCurrentLocation() {
    saveCurrentLocationAs(newPlaceName);
  }

  async function handleDelete(id: string) {
    try {
      await deleteSavedPlace(id, token);
      setPlaces((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete this place");
    }
  }

  const handleClose = useCallback(() => {
    stop();
    onClose();
  }, [stop, onClose]);

  const handleVoiceResult = useCallback(
    (text: string) => {
      setLastHeardText(text);
      const normalized = text.toLowerCase();

      if (awaitingPlaceNameRef.current) {
        const cleanedName = text.trim();
        if (cleanedName) {
          saveCurrentLocationAs(cleanedName);
        } else {
          speak("I did not catch that name. Please try again.", language);
        }
        return;
      }

      if (
        normalized.includes("close") ||
        normalized.includes("back") ||
        normalized.includes("बंद") ||
        normalized.includes("वापस") ||
        normalized.includes("मागे")
      ) {
        handleClose();
        return;
      }

      if (
        normalized.includes("add place") ||
        normalized.includes("save this place") ||
        normalized.includes("नई जगह") ||
        normalized.includes("नई जागा") ||
        normalized.includes("जगह जोड़") ||
        normalized.includes("ठिकाण जोडा") ||
        normalized.includes("नवीन ठिकाण")
      ) {
        setAwaitingPlaceName(true);
        speak("What would you like to name this place?", language);
        return;
      }

      const place = places.find((p) => normalized.includes(p.name.toLowerCase()));
      if (place) {
        onNavigateToPlace(place);
        return;
      }

      speak("Say 'add place' to save your current location, or say a saved place's name.", language);
    },
    [handleClose, places, onNavigateToPlace, saveCurrentLocationAs, speak, language]
  );

  const { isListening, startListening } = useSpeechRecognition(handleVoiceResult);

  function handleVoiceOrbClick() {
    stop();
    startListening(speechLang);
  }

  function handleShareWhatsapp() {}

  return (
    <div
      className="fixed inset-0 bg-[var(--color-background)] z-50 flex flex-col"
      role="dialog"
      aria-label="Saved places"
    >
      <header className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-surface-light)]">
        <span className="text-lg font-bold text-[var(--color-primary-light)]">
          Saved Places
        </span>
        <Button variant="ghost" size="md" onClick={handleClose}>
          Close
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="flex flex-col items-center gap-4 mb-6">
          <VoiceOrb isListening={isListening} onClick={handleVoiceOrbClick} />
          <p className="text-xs text-[var(--color-text-secondary)] text-center max-w-xs">
            {awaitingPlaceName
              ? "Now say the name for this place"
              : "Say \"add place\" to save where you are, a saved place's name to navigate there, or \"close\" to go back"}
          </p>
          {lastHeardText && (
            <p className="text-sm text-[var(--color-primary-light)] text-center">
              You said: "{lastHeardText}"
            </p>
          )}
        </div>

        {isLoading && (
          <p className="text-[var(--color-text-secondary)]" role="status">
            Loading saved places...
          </p>
        )}

        {error && (
          <p role="alert" className="text-[var(--color-error)] mb-4">
            {error}
          </p>
        )}

        {!isLoading && places.length === 0 && !showAddForm && (
          <p className="text-[var(--color-text-secondary)] text-center mt-8">
            No saved places yet. Add a place you visit often, like home, school, or a relative's house.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {places.map((place) => (
            <Card key={place.id} className="flex items-center justify-between">
              <button
                className="flex-1 text-left font-medium text-[var(--color-text-primary)]"
                onClick={() => onNavigateToPlace(place)}
              >
                📍 {place.name}
              </button>
              <Button variant="ghost" size="md" onClick={() => handleDelete(place.id)}>
                Delete
              </Button>
            </Card>
          ))}
        </div>

        {showAddForm && (
          <div className="mt-6 flex flex-col gap-3">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Make sure you are standing at the location you want to save.
            </p>
            <input
              type="text"
              value={newPlaceName}
              onChange={(e) => setNewPlaceName(e.target.value)}
              placeholder="e.g. Home, School, Grandma's house"
              className="min-h-[48px] px-4 py-2.5 rounded-xl bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-surface-light)]"
              aria-label="Place name"
            />
            {saveError && (
              <p role="alert" className="text-sm text-[var(--color-error)]">
                {saveError}
              </p>
            )}
            <Button
              variant="primary"
              size="lg"
              onClick={handleSaveCurrentLocation}
              isLoading={isSaving}
            >
              Save This Location
            </Button>
          </div>
        )}
      </div>

      {!showAddForm && (
        <div className="flex-shrink-0 p-5 border-t border-[var(--color-surface-light)]">
          <Button variant="primary" size="lg" onClick={() => setShowAddForm(true)}>
            + Save Current Location
          </Button>
        </div>
      )}
    </div>
  );
}