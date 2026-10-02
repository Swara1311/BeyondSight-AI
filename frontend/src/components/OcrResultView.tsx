import { useEffect, useCallback } from "react";
import Button from "./Button";
import VoiceOrb from "./VoiceOrb";
import { useTextToSpeech } from "../hooks/useTextToSpeech";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useLanguage } from "../context/LanguageContext";

interface OcrResultViewProps {
  status: "processing" | "success" | "error";
  extractedText: string;
  summary: string | null;
  isSummarizing: boolean;
  summarizeError: string | null;
  errorMessage: string | null;
  onReadAloud: (text: string) => void;
  onSummarize: () => void;
  onClose: () => void;
  isSpeaking: boolean;
}

export default function OcrResultView({
  status,
  extractedText,
  summary,
  isSummarizing,
  summarizeError,
  errorMessage,
  onReadAloud,
  onSummarize,
  onClose,
  isSpeaking,
}: OcrResultViewProps) {
  const { stop, speak } = useTextToSpeech();
  const { language, speechLang } = useLanguage();

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
        normalized.includes("read") ||
        normalized.includes("पढ़") ||
        normalized.includes("वाच")
      ) {
        onReadAloud(summary || extractedText);
        return;
      }

      if (normalized.includes("summarize") || normalized.includes("सारांश")) {
        if (!summary && extractedText.length >= 200) {
          onSummarize();
        }
        return;
      }

      if (normalized.includes("stop")) {
        stop();
        return;
      }

      speak("Say read, summarize, or close.", language);
    },
    [handleClose, onReadAloud, onSummarize, summary, extractedText, stop, speak, language]
  );

  const { isListening, startListening } = useSpeechRecognition(handleVoiceResult);

  function handleVoiceOrbClick() {
    stop();
    startListening(speechLang);
  }

  return (
    <div
      className="fixed inset-0 bg-[var(--color-background)] z-50 flex flex-col"
      role="dialog"
      aria-label="Text reading result"
    >
      <header className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-surface-light)]">
        <span className="text-lg font-bold text-[var(--color-primary-light)]">
          Read Text
        </span>
        <Button variant="ghost" size="md" onClick={handleClose}>
          Close
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        {status === "processing" && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <span
              className="w-10 h-10 border-4 border-[var(--color-surface-light)] border-t-[var(--color-primary)] rounded-full animate-spin"
              aria-hidden="true"
            />
            <p className="text-[var(--color-text-secondary)]" role="status" aria-live="polite">
              Reading text...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <p role="alert" className="text-[var(--color-error)]">
              {errorMessage}
            </p>
            <Button variant="secondary" size="lg" onClick={handleClose}>
              Close
            </Button>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-5">
            <VoiceOrb isListening={isListening} onClick={handleVoiceOrbClick} />
            <p className="text-xs text-[var(--color-text-secondary)] text-center max-w-xs">
              Say "read", "summarize", or "close"
            </p>

            {summary && (
              <div className="flex flex-col gap-2 bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-primary)] w-full">
                <p className="text-sm font-semibold text-[var(--color-primary-light)]">
                  Summary:
                </p>
                <p className="text-[var(--color-text-primary)] leading-relaxed">{summary}</p>
              </div>
            )}

            {summarizeError && (
              <p role="alert" className="text-sm text-[var(--color-error)]">
                {summarizeError}
              </p>
            )}

            <div className="flex flex-col gap-2 w-full">
              <p className="text-sm text-[var(--color-text-secondary)]">Full extracted text:</p>
              <p className="text-[var(--color-text-primary)] whitespace-pre-wrap leading-relaxed">
                {extractedText}
              </p>
            </div>
          </div>
        )}
      </div>

      {status === "success" && (
        <div className="flex-shrink-0 flex flex-col gap-3 p-5 border-t border-[var(--color-surface-light)]">
          <Button
            variant="primary"
            size="lg"
            onClick={() => onReadAloud(summary || extractedText)}
            isLoading={isSpeaking}
          >
            {isSpeaking ? "Reading Aloud..." : summary ? "Read Summary Aloud" : "Read Aloud"}
          </Button>
          {!summary && extractedText.length >= 200 && (
            <Button variant="secondary" size="lg" onClick={onSummarize} isLoading={isSummarizing}>
              {isSummarizing ? "Summarizing..." : "Summarize"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}