interface VoiceOrbProps {
  isListening: boolean;
  onClick: () => void;
}

export default function VoiceOrb({ isListening, onClick }: VoiceOrbProps) {
  return (
    <button
      onClick={onClick}
      aria-label={isListening ? "Stop listening" : "Start voice assistant"}
      aria-pressed={isListening}
      className={`
        relative flex items-center justify-center
        w-40 h-40 rounded-full
        transition-all duration-300
        focus-visible:outline focus-visible:outline-4 focus-visible:outline-[var(--color-primary-light)] focus-visible:outline-offset-4
        ${
          isListening
            ? "bg-[var(--color-primary)] shadow-[0_0_0_8px_rgba(37,99,235,0.25)]"
            : "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"
        }
      `}
    >
      {isListening && (
        <span
          className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-primary)] opacity-40 animate-ping"
          aria-hidden="true"
        />
      )}
      <svg
        className="relative w-16 h-16 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
        />
      </svg>
    </button>
  );
}