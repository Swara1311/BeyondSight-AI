import { useState, useEffect, useCallback, useRef } from "react";
import StatusIndicator from "./components/StatusIndicator";
import VoiceOrb from "./components/VoiceOrb";
import Card from "./components/Card";
import Button from "./components/Button";
import CameraView from "./components/CameraView";
import OcrResultView from "./components/OcrResultView";
import FileUpload from "./components/FileUpload";
import NavigationView from "./components/NavigationView";
import SavedPlacesView from "./components/SavedPlacesView";
import EmergencyContactsView from "./components/EmergencyContactsView";
import SosButton from "./components/SosButton";
import SosResultView from "./components/SosResultView";
import Login from "./screens/Login";
import Register from "./screens/Register";
import {
  checkBackendHealth,
  summarizeText,
  getNavigationRoute,
  getNavigationRouteByCoords,
  listSavedPlaces,
  triggerSos,
} from "./services/api";
import type { SavedPlace, EmergencyContact } from "./services/api";
import { reverseGeocode } from "./services/geocoding";
import { useAuth } from "./context/AuthContext";
import { useLanguage, LANGUAGES } from "./context/LanguageContext";
import type { AppLanguage } from "./context/LanguageContext";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";
import { useTextToSpeech } from "./hooks/useTextToSpeech";
import { useOcr } from "./hooks/useOcr";
import { useLocation } from "./hooks/useLocation";
import { parseCommand } from "./utils/commandParser";
import { extractTextFromPdf } from "./utils/pdfExtractor";
import { buildStepSpeech } from "./utils/navigationSpeech";
import { translations } from "./utils/translations";

type AssistantStatus =
  | "idle"
  | "listening"
  | "processing"
  | "speaking"
  | "error"
  | "permission_required";

type CameraMode = "detect" | "capture" | null;
type ReadTextMode = "choose" | "upload" | null;
type ReadingStatus = "idle" | "processing" | "success" | "error";
type NavStatus = "idle" | "locating" | "routing" | "active" | "error";

interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
}

function HomeScreen() {
  const { user, token, logout } = useAuth();
  const { language, setLanguage, speechLang } = useLanguage();
  const t = translations[language];

  const [status, setStatus] = useState<AssistantStatus>("idle");
  const [lastCommand, setLastCommand] = useState("");
  const [cameraMode, setCameraMode] = useState<CameraMode>(null);
  const [readTextMode, setReadTextMode] = useState<ReadTextMode>(null);
  const [showOcrResult, setShowOcrResult] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summarizeError, setSummarizeError] = useState<string | null>(null);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);

  const [readingStatus, setReadingStatus] = useState<ReadingStatus>("idle");
  const [readingText, setReadingText] = useState("");
  const [readingError, setReadingError] = useState<string | null>(null);

  const [showNavInput, setShowNavInput] = useState(false);
  const [destinationInput, setDestinationInput] = useState("");
  const [showNavigation, setShowNavigation] = useState(false);
  const [navStatus, setNavStatus] = useState<NavStatus>("idle");
  const [navDestination, setNavDestination] = useState("");
  const [navSteps, setNavSteps] = useState<RouteStep[]>([]);
  const [navStepIndex, setNavStepIndex] = useState(0);
  const [navTotalDistance, setNavTotalDistance] = useState(0);
  const [navError, setNavError] = useState<string | null>(null);
  const [showSavedPlaces, setShowSavedPlaces] = useState(false);

  const [isTriggeringSos, setIsTriggeringSos] = useState(false);
  const [showSosResult, setShowSosResult] = useState(false);
  const [sosLocation, setSosLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [sosContacts, setSosContacts] = useState<EmergencyContact[]>([]);
  const [awaitingSosConfirmation, setAwaitingSosConfirmation] = useState(false);

  const showNavigationRef = useRef(showNavigation);
  const navStepIndexRef = useRef(navStepIndex);
  const navStepsRef = useRef(navSteps);
  const awaitingSosConfirmationRef = useRef(awaitingSosConfirmation);

  useEffect(() => {
    showNavigationRef.current = showNavigation;
  }, [showNavigation]);

  useEffect(() => {
    navStepIndexRef.current = navStepIndex;
  }, [navStepIndex]);

  useEffect(() => {
    navStepsRef.current = navSteps;
  }, [navSteps]);

  useEffect(() => {
    awaitingSosConfirmationRef.current = awaitingSosConfirmation;
  }, [awaitingSosConfirmation]);

  const { speak, stop, isSpeaking } = useTextToSpeech();
  const { status: ocrStatus, extractedText, errorMessage: ocrError, runOcr, reset: resetOcr } = useOcr();
  const { status: locationStatus, location, errorMessage: locationError, getCurrentLocation } = useLocation();

  const handleSpeechResult = useCallback(
    (text: string) => {
      setLastCommand(text);
      setStatus("processing");

      const normalized = text.toLowerCase().trim();

      if (awaitingSosConfirmationRef.current) {
        setAwaitingSosConfirmation(false);
        if (
          normalized.includes("confirm emergency") ||
          normalized.includes("confirm sos") ||
          normalized.includes("confirm") ||
          text.includes("हाँ") ||
          text.includes("हां") ||
          text.includes("हा") ||
          text.includes("पुष्टि") ||
          text.includes("पक्का") ||
          text.includes("होय") ||
          text.includes("पक्के") ||
          text.includes("कन्फर्म")
        ) {
          handleSosTrigger();
          setStatus("idle");
        } else {
          speak(t.sosCancelled, language);
          setStatus("speaking");
        }
        return;
      }

      if (showNavigationRef.current) {
        if (normalized.includes("next")) {
          handleNextStep();
          setStatus("idle");
          return;
        }
        if (normalized.includes("repeat")) {
          handleRepeatStep();
          setStatus("idle");
          return;
        }
        if (
          normalized.includes("obstacle") ||
          normalized.includes("detect") ||
          normalized.includes("बाधा") ||
          normalized.includes("अडथळा")
        ) {
          setCameraMode("detect");
          setStatus("idle");
          return;
        }
        if (
          normalized.includes("stop") ||
          normalized.includes("close") ||
          normalized.includes("cancel") ||
          normalized.includes("बंद") ||
          normalized.includes("वापस") ||
          normalized.includes("मागे")
        ) {
          handleCloseNavigation();
          setStatus("idle");
          return;
        }
      }

      const command = parseCommand(text);
      let response = "";

      switch (command.type) {
        case "change_language":
          if (command.language) {
            setLanguage(command.language);
            response = translations[command.language].languageChanged;
          }
          break;
        case "how_to_use":
          response = t.howToUseGuide;
          break;
        case "detect_surroundings":
          setCameraMode("detect");
          response = t.openingCamera;
          break;
        case "read_text":
          setReadTextMode("choose");
          response = t.openingCameraOcr;
          break;
        case "where_am_i":
          response = t.gettingLocation;
          getCurrentLocation();
          break;
        case "saved_places":
          setShowSavedPlaces(true);
          response = t.savedPlaces;
          break;
        case "start_navigation": {
          const match = text.toLowerCase().match(/take me to (.+)|navigate to (.+)/);
          const destination = match ? (match[1] || match[2]).trim() : "";
          if (destination) {
            startNavigation(destination);
            response = `Starting navigation to ${destination}.`;
          } else {
            setShowNavInput(true);
            response = t.navigationSoon;
          }
          break;
        }
        case "sos":
          setAwaitingSosConfirmation(true);
          response = t.sosConfirmPrompt;
          break;
        case "start_assistant":
          response = t.imListening;
          break;
        default:
          response = t.didNotUnderstand;
      }

      if (response) {
        setStatus("speaking");
        speak(response, language);
      } else {
        setStatus("idle");
      }
    },
    [speak, getCurrentLocation, language, t, setLanguage]
  );

  const { isListening, isSupported, startListening, error } =
    useSpeechRecognition(handleSpeechResult);

  useEffect(() => {
    checkBackendHealth().catch(() => {
      console.warn("Backend not reachable.");
    });
  }, []);

  useEffect(() => {
    if (isListening) setStatus("listening");
  }, [isListening]);

  useEffect(() => {
    if (error) setStatus("error");
  }, [error]);

  useEffect(() => {
    if (ocrStatus === "success") {
      setReadingStatus("success");
      setReadingText(extractedText);
    } else if (ocrStatus === "error") {
      setReadingStatus("error");
      setReadingError(ocrError);
    } else if (ocrStatus === "processing") {
      setReadingStatus("processing");
    }
  }, [ocrStatus, extractedText, ocrError]);

  useEffect(() => {
    if (locationStatus === "success" && location) {
      reverseGeocode(location.latitude, location.longitude)
        .then((address) => speak(`You are near ${address}`, language))
        .catch(() =>
          speak(`Your coordinates are ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`, language)
        );
    } else if (locationStatus === "denied" || locationStatus === "unavailable" || locationStatus === "error") {
      if (locationError) speak(locationError, language);
    }
  }, [locationStatus, location, locationError, speak, language]);

  function handleVoiceOrbClick() {
    if (!isSupported) {
      setStatus("error");
      return;
    }
    stop();
    startListening(speechLang);
  }

  async function handleFrameCapture(imageData: string) {
    setCameraMode(null);
    setReadTextMode(null);
    setSummary(null);
    setSummarizeError(null);
    setShowOcrResult(true);
    await runOcr(imageData);
  }

  async function handleFileSelected(file: File) {
    setReadTextMode(null);
    setSummary(null);
    setSummarizeError(null);
    setShowOcrResult(true);
    setReadingStatus("processing");

    try {
      if (file.type === "application/pdf") {
        const result = await extractTextFromPdf(file);
        if (!result.needsOcr) {
          setReadingStatus("success");
          setReadingText(result.text);
        } else if (result.firstPageImage) {
          await runOcr(result.firstPageImage);
        } else {
          setReadingStatus("error");
          setReadingError("Could not read text from this PDF.");
          speak("Could not read text from this PDF.", language);
        }
      } else {
        const reader = new FileReader();
        reader.onload = async () => {
          const dataUrl = reader.result as string;
          await runOcr(dataUrl);
        };
        reader.readAsDataURL(file);
      }
    } catch {
      setReadingStatus("error");
      setReadingError("Something went wrong while reading this file.");
      speak("Something went wrong while reading this file.", language);
    }
  }

  function handleReadAloud(text: string) {
    speak(text, language);
  }

  async function handleSummarize() {
    setIsSummarizing(true);
    setSummarizeError(null);
    try {
      const result = await summarizeText(readingText, token);
      setSummary(result.summary);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Summarization failed";
      setSummarizeError(message);
      speak(message, language);
    } finally {
      setIsSummarizing(false);
    }
  }

  function handleCloseOcrResult() {
    setShowOcrResult(false);
    resetOcr();
    setReadingStatus("idle");
    setReadingText("");
    setReadingError(null);
    setSummary(null);
    setSummarizeError(null);
  }

  async function startNavigationToCoords(name: string, latitude: number, longitude: number) {
    setShowNavigation(true);
    setNavDestination(name);
    setNavStatus("locating");
    setNavStepIndex(0);
    setNavError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setNavStatus("routing");
        try {
          const result = await getNavigationRouteByCoords(
            position.coords.latitude,
            position.coords.longitude,
            latitude,
            longitude
          );
          setNavSteps(result.steps);
          setNavTotalDistance(result.totalDistance);
          setNavStatus("active");
          if (result.steps.length > 0) {
            speak(buildStepSpeech(result.steps[0], language), language);
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : "Could not calculate route.";
          setNavStatus("error");
          setNavError(message);
          speak(message, language);
        }
      },
      () => {
        const message = "Could not get your current location.";
        setNavStatus("error");
        setNavError(message);
        speak(message, language);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function startNavigation(destination: string) {
    setShowNavInput(false);
    setDestinationInput("");

    if (token) {
      try {
        const result = await listSavedPlaces(token);
        const match = result.places.find(
          (p) => p.name.toLowerCase() === destination.toLowerCase()
        );
        if (match) {
          await startNavigationToCoords(match.name, match.latitude, match.longitude);
          return;
        }
      } catch {
        // ignore, fall through to normal geocoding
      }
    }

    setShowNavigation(true);
    setNavDestination(destination);
    setNavStatus("locating");
    setNavStepIndex(0);
    setNavError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setNavStatus("routing");
        try {
          const result = await getNavigationRoute(
            destination,
            position.coords.latitude,
            position.coords.longitude
          );
          setNavSteps(result.route.steps);
          setNavTotalDistance(result.route.totalDistance);
          setNavStatus("active");
          if (result.route.steps.length > 0) {
            speak(buildStepSpeech(result.route.steps[0], language), language);
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : "Could not calculate route.";
          setNavStatus("error");
          setNavError(message);
          speak(message, language);
        }
      },
      () => {
        const message = "Could not get your current location.";
        setNavStatus("error");
        setNavError(message);
        speak(message, language);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handleNextStep() {
    const nextIndex = navStepIndexRef.current + 1;
    const steps = navStepsRef.current;
    if (nextIndex >= steps.length) {
      speak(t.youHaveArrived, language);
      setShowNavigation(false);
      return;
    }
    setNavStepIndex(nextIndex);
    speak(buildStepSpeech(steps[nextIndex], language), language);
  }

  function handleRepeatStep() {
    const step = navStepsRef.current[navStepIndexRef.current];
    if (step) speak(buildStepSpeech(step, language), language);
  }

  function handleCloseNavigation() {
    stop();
    setShowNavigation(false);
    setNavStatus("idle");
    setNavSteps([]);
    setNavStepIndex(0);
  }

  function handleNavigateToSavedPlace(place: SavedPlace) {
    setShowSavedPlaces(false);
    startNavigationToCoords(place.name, place.latitude, place.longitude);
  }

  function handleLanguageSelect(lang: AppLanguage) {
    stop();
    setLanguage(lang);
    setShowLanguageMenu(false);
    speak(translations[lang].languageChanged, lang);
  }

  function handleSosTrigger() {
    if (!token) return;

    stop();
    setIsTriggeringSos(true);
    speak("Activating emergency S O S. Getting your location.", language);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const result = await triggerSos(latitude, longitude, token);
          setSosLocation({ latitude, longitude });
          setSosContacts(result.contacts);
          setShowSosResult(true);
        } catch (err) {
          speak("Could not activate SOS. Please try again.", language);
        } finally {
          setIsTriggeringSos(false);
        }
      },
      () => {
        speak("Could not get your location for SOS. Please try again.", language);
        setIsTriggeringSos(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-5 py-4">
        <span className="text-xl font-bold text-[var(--color-primary-light)]">
          BeyondSight AI
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLanguageMenu(true)}
            className="px-3 py-1.5 rounded-full bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-[var(--color-primary-light)]"
            aria-label="Change language"
          >
            🌐 {LANGUAGES[language].label}
          </button>
          <button
            onClick={() => setShowEmergencyContacts(true)}
            className="px-3 py-1.5 rounded-full bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-[var(--color-primary-light)]"
            aria-label="Emergency contacts"
          >
            📞
          </button>
          <Button variant="ghost" size="md" onClick={logout}>
            Log Out
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-5 px-5 py-6">
        <VoiceOrb isListening={isListening} onClick={handleVoiceOrbClick} />
        <StatusIndicator status={status} />

        <div className="flex flex-col items-center gap-2">
          <p className="text-[var(--color-text-secondary)] text-center max-w-xs">
            {!isSupported
              ? "Voice recognition is not supported in this browser. Please use Chrome."
              : isListening
              ? t.listening
              : t.tapToStart}
          </p>

          <p className="text-xs text-[var(--color-text-secondary)]/70 text-center max-w-xs">
            Say "how to use" to hear all available commands
          </p>
        </div>

        {error && (
          <p role="alert" className="text-[var(--color-error)] text-sm text-center max-w-xs">
            {error}
          </p>
        )}

        {lastCommand && (
          <p className="text-sm text-[var(--color-text-secondary)] text-center max-w-xs">
            You said: "{lastCommand}"
          </p>
        )}

        {location && (
          <p className="text-sm text-[var(--color-text-secondary)] text-center max-w-xs">
            📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </p>
        )}
      </main>

      <section className="px-5 pt-2 pb-5" aria-label="Emergency SOS">
        <SosButton onTrigger={handleSosTrigger} isTriggering={isTriggeringSos} />
      </section>

      <section className="px-5 pb-8" aria-label="Quick actions">
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <Card
            className="flex flex-col items-center gap-2 text-center cursor-pointer hover:border-[var(--color-primary)]"
            onClick={() => setCameraMode("detect")}
          >
            <span className="text-2xl" aria-hidden="true">👁️</span>
            <span className="font-medium">{t.detectSurroundings}</span>
          </Card>
          <Card
            className="flex flex-col items-center gap-2 text-center cursor-pointer hover:border-[var(--color-primary)]"
            onClick={() => setReadTextMode("choose")}
          >
            <span className="text-2xl" aria-hidden="true">📖</span>
            <span className="font-medium">{t.readText}</span>
          </Card>
          <Card
            className="flex flex-col items-center gap-2 text-center cursor-pointer hover:border-[var(--color-primary)]"
            onClick={() => setShowNavInput(true)}
          >
            <span className="text-2xl" aria-hidden="true">🗺️</span>
            <span className="font-medium">{t.navigation}</span>
          </Card>
          <Card
            className="flex flex-col items-center gap-2 text-center cursor-pointer hover:border-[var(--color-primary)]"
            onClick={() => setShowSavedPlaces(true)}
          >
            <span className="text-2xl" aria-hidden="true">📍</span>
            <span className="font-medium">{t.savedPlaces}</span>
          </Card>
        </div>
      </section>

      {showLanguageMenu && (
        <div
          className="fixed inset-0 bg-[var(--color-background)] z-50 flex flex-col items-center justify-center gap-4 px-6"
          role="dialog"
          aria-label="Choose language"
        >
          <p className="text-[var(--color-text-primary)] text-center mb-2">Choose a language</p>
          {(Object.keys(LANGUAGES) as AppLanguage[]).map((lang) => (
            <Button
              key={lang}
              variant={language === lang ? "primary" : "secondary"}
              size="lg"
              onClick={() => handleLanguageSelect(lang)}
            >
              {LANGUAGES[lang].label}
            </Button>
          ))}
          <Button variant="ghost" size="lg" onClick={() => setShowLanguageMenu(false)}>
            Cancel
          </Button>
        </div>
      )}

      {readTextMode === "choose" && (
        <div
          className="fixed inset-0 bg-[var(--color-background)] z-50 flex flex-col items-center justify-center gap-4 px-6"
          role="dialog"
          aria-label="Choose how to read text"
        >
          <p className="text-[var(--color-text-primary)] text-center mb-2">
            How would you like to read text?
          </p>
          <Button variant="primary" size="lg" onClick={() => setCameraMode("capture")}>
            📷 Use Camera
          </Button>
          <Button variant="secondary" size="lg" onClick={() => setReadTextMode("upload")}>
            📁 Upload File (Image or PDF)
          </Button>
          <Button variant="ghost" size="lg" onClick={() => setReadTextMode(null)}>
            Cancel
          </Button>
        </div>
      )}

      {readTextMode === "upload" && (
        <FileUpload onFileSelected={handleFileSelected} onClose={() => setReadTextMode(null)} />
      )}

      {cameraMode && (
        <CameraView
          mode={cameraMode}
          onCapture={handleFrameCapture}
          onClose={() => setCameraMode(null)}
        />
      )}

      {showOcrResult && (
        <OcrResultView
          status={readingStatus === "idle" ? "processing" : readingStatus}
          extractedText={readingText}
          summary={summary}
          isSummarizing={isSummarizing}
          summarizeError={summarizeError}
          errorMessage={readingError}
          onReadAloud={handleReadAloud}
          onSummarize={handleSummarize}
          onClose={handleCloseOcrResult}
          isSpeaking={isSpeaking}
        />
      )}

      {showNavInput && (
        <div
          className="fixed inset-0 bg-[var(--color-background)] z-50 flex flex-col items-center justify-center gap-4 px-6"
          role="dialog"
          aria-label="Enter destination"
        >
          <p className="text-[var(--color-text-primary)] text-center mb-2">
            Where would you like to go?
          </p>
          <input
            type="text"
            value={destinationInput}
            onChange={(e) => setDestinationInput(e.target.value)}
            placeholder="e.g. railway station, or a saved place name"
            className="w-full max-w-xs min-h-[48px] px-4 py-2.5 rounded-xl bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-surface-light)]"
            aria-label="Destination"
          />
          <Button
            variant="primary"
            size="lg"
            onClick={() => destinationInput.trim() && startNavigation(destinationInput.trim())}
          >
            Start Navigation
          </Button>
          <Button variant="ghost" size="lg" onClick={() => setShowNavInput(false)}>
            Cancel
          </Button>
        </div>
      )}

      {showNavigation && !cameraMode && (
        <NavigationView
          status={navStatus}
          destination={navDestination}
          steps={navSteps}
          currentStepIndex={navStepIndex}
          totalDistance={navTotalDistance}
          errorMessage={navError}
          isListening={isListening}
          onVoiceCommand={handleVoiceOrbClick}
          onNextStep={handleNextStep}
          onRepeatStep={handleRepeatStep}
          onCheckObstacles={() => setCameraMode("detect")}
          onClose={handleCloseNavigation}
        />
      )}

      {showSavedPlaces && token && (
        <SavedPlacesView
          token={token}
          onNavigateToPlace={handleNavigateToSavedPlace}
          onClose={() => setShowSavedPlaces(false)}
        />
      )}

      {showEmergencyContacts && token && (
        <EmergencyContactsView
          token={token}
          onClose={() => setShowEmergencyContacts(false)}
        />
      )}

      {showSosResult && sosLocation && (
        <SosResultView
          latitude={sosLocation.latitude}
          longitude={sosLocation.longitude}
          contacts={sosContacts}
          onClose={() => setShowSosResult(false)}
        />
      )}
    </div>
  );
}

function App() {
  const { user, isLoading } = useAuth();
  const [authScreen, setAuthScreen] = useState<"login" | "register">("login");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--color-text-secondary)]">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return authScreen === "login" ? (
      <Login onSwitchToRegister={() => setAuthScreen("register")} />
    ) : (
      <Register onSwitchToLogin={() => setAuthScreen("login")} />
    );
  }

  return <HomeScreen />;
}

export default App;