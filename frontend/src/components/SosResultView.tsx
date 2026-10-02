import { useEffect, useState, useCallback } from "react";
import Button from "./Button";
import VoiceOrb from "./VoiceOrb";
import type { EmergencyContact } from "../services/api";
import { useTextToSpeech } from "../hooks/useTextToSpeech";
import { useLanguage } from "../context/LanguageContext";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

interface SosResultViewProps {
  latitude: number;
  longitude: number;
  contacts: EmergencyContact[];
  onClose: () => void;
}

export default function SosResultView({ latitude, longitude, contacts, onClose }: SosResultViewProps) {
  const { speak, stop } = useTextToSpeech();
  const { language, speechLang } = useLanguage();
  const [sentIndex, setSentIndex] = useState(-1);
  const [pendingIndex, setPendingIndex] = useState(0);

  const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
  const shareMessage = `EMERGENCY: I need help. My current location is: ${mapLink}`;

  const sendToContact = useCallback(
    (index: number) => {
      if (index >= contacts.length || index < 0) return;

      const contact = contacts[index];
      setSentIndex(index);

      const smsUrl = `sms:${contact.phone}?body=${encodeURIComponent(shareMessage)}`;
      window.location.href = smsUrl;
    },
    [contacts, shareMessage]
  );

  useEffect(() => {
    if (contacts.length === 0) {
      speak(
        "You have no emergency contacts saved. Please ask someone nearby for help.",
        language
      );
      return;
    }

    speak(`Sending your location to ${contacts[0].name}, your ${contacts[0].relationship}.`, language);
    sendToContact(0);
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const handleClose = useCallback(() => {
    stop();
    onClose();
  }, [stop, onClose]);

  const handleVoiceResult = useCallback(
    (text: string) => {
      const normalized = text.toLowerCase();

      if (
        normalized.includes("next") ||
        normalized.includes("another") ||
        normalized.includes("agla") ||
        normalized.includes("अगला") ||
        normalized.includes("पुढचा")
      ) {
        const nextIdx = pendingIndex + 1;
        if (nextIdx >= contacts.length) {
          speak("You have already contacted everyone on your list.", language);
          return;
        }
        setPendingIndex(nextIdx);
        speak(
          `Ready to send to ${contacts[nextIdx].name}, your ${contacts[nextIdx].relationship}. Tap the highlighted button now.`,
          language
        );
        return;
      }

      if (normalized.includes("send") || normalized.includes("confirm") || normalized.includes("bhejo")) {
        speak(
          `Please tap the button on screen to send to ${contacts[pendingIndex]?.name}, since your browser requires a tap to send a message.`,
          language
        );
        return;
      }

      if (
        normalized.includes("close") ||
        normalized.includes("done") ||
        normalized.includes("stop") ||
        normalized.includes("बंद") ||
        normalized.includes("बंद करा") ||
        normalized.includes("बंद करो")
      ) {
        handleClose();
      }
    },
    [pendingIndex, contacts, speak, language, handleClose]
  );

  const { isListening, startListening } = useSpeechRecognition(handleVoiceResult);

  function handleVoiceOrbClick() {
    stop();
    startListening(speechLang);
  }

  function handleShareWhatsapp() {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, "_blank");
  }

  return (
    <div
      className="fixed inset-0 bg-[var(--color-background)] z-50 flex flex-col"
      role="alert"
      aria-live="assertive"
    >
      <header className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-sos)]">
        <span className="text-lg font-bold text-[var(--color-sos)]">🚨 SOS Activated</span>
        <Button variant="ghost" size="md" onClick={handleClose}>
          Close
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col items-center gap-5">
        <VoiceOrb isListening={isListening} onClick={handleVoiceOrbClick} />

        <p className="text-xs text-[var(--color-text-secondary)] text-center max-w-xs">
          Say "next contact" to prepare the next message, then tap the button to send it
        </p>

        <p className="text-[var(--color-text-primary)] text-center" role="status" aria-live="polite">
          {sentIndex >= 0
            ? `Message opened for ${contacts[sentIndex]?.name}.`
            : "No emergency contacts found."}
        </p>

        <p className="text-sm text-[var(--color-text-secondary)]">
          Location: {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </p>

        {contacts.length > 0 && (
          <div className="flex flex-col gap-3 w-full max-w-xs">
            {contacts.map((contact, index) => (
              <Button
                key={contact.id}
                variant={index === pendingIndex ? "primary" : "secondary"}
                size="xl"
                onClick={() => sendToContact(index)}
              >
                📱 Send to {contact.name}
                {index === sentIndex ? " ✓ Sent" : ""}
              </Button>
            ))}
          </div>
        )}

        <Button variant="secondary" size="lg" onClick={handleShareWhatsapp}>
          💬 Share via WhatsApp
        </Button>
      </div>
    </div>
  );
}