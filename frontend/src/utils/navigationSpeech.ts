import type { AppLanguage } from "../context/LanguageContext";
import { translateInstruction } from "./navigationTranslations";

interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
}

function formatDistanceForSpeech(meters: number, language: AppLanguage): string {
  if (meters < 10) {
    if (language === "hi") return "कुछ कदम";
    if (language === "mr") return "काही पावले";
    return "a few steps";
  }
  if (meters < 1000) {
    const value = Math.round(meters);
    if (language === "hi") return `${value} मीटर`;
    if (language === "mr") return `${value} मीटर`;
    return `${value} meters`;
  }
  const km = (meters / 1000).toFixed(1);
  if (language === "hi") return `${km} किलोमीटर`;
  if (language === "mr") return `${km} किलोमीटर`;
  return `${km} kilometers`;
}

function simplifyInstruction(instruction: string): string {
  const compassPattern = /^Head (north|south|east|west|northeast|northwest|southeast|southwest)/i;

  if (compassPattern.test(instruction)) {
    return "Start walking straight ahead";
  }

  return instruction;
}

const forText: Record<AppLanguage, string> = {
  en: "for",
  hi: "के लिए",
  mr: "साठी",
};

export function buildStepSpeech(step: RouteStep, language: AppLanguage = "en"): string {
  const simplified = simplifyInstruction(step.instruction);
  const translatedInstruction = translateInstruction(simplified, language);
  const distanceText = formatDistanceForSpeech(step.distance, language);

  if (step.distance === 0) {
    return translatedInstruction;
  }

  return `${translatedInstruction}, ${forText[language]} ${distanceText}`;
}