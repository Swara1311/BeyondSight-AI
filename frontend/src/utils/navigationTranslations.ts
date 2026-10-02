import type { AppLanguage } from "../context/LanguageContext";

const phraseMap: Record<string, Record<AppLanguage, string>> = {
  "turn left": { en: "Turn left", hi: "बाएं मुड़ें", mr: "डावीकडे वळा" },
  "turn right": { en: "Turn right", hi: "दाएं मुड़ें", mr: "उजवीकडे वळा" },
  "turn sharp left": { en: "Turn sharp left", hi: "तेज़ी से बाएं मुड़ें", mr: "तीव्र डावीकडे वळा" },
  "turn sharp right": { en: "Turn sharp right", hi: "तेज़ी से दाएं मुड़ें", mr: "तीव्र उजवीकडे वळा" },
  "turn slight left": { en: "Turn slightly left", hi: "हल्के से बाएं मुड़ें", mr: "किंचित डावीकडे वळा" },
  "turn slight right": { en: "Turn slightly right", hi: "हल्के से दाएं मुड़ें", mr: "किंचित उजवीकडे वळा" },
  "continue straight": { en: "Continue straight", hi: "सीधे चलते रहें", mr: "सरळ चालत रहा" },
  "keep left": { en: "Keep left", hi: "बाईं ओर रहें", mr: "डावीकडे रहा" },
  "keep right": { en: "Keep right", hi: "दाईं ओर रहें", mr: "उजवीकडे रहा" },
  "start walking straight ahead": {
    en: "Start walking straight ahead",
    hi: "सीधे चलना शुरू करें",
    mr: "सरळ चालायला सुरुवात करा",
  },
  "arrive at your destination": {
    en: "Arrive at your destination",
    hi: "आप अपने गंतव्य पर पहुँच गए हैं",
    mr: "तुम्ही तुमच्या गंतव्यस्थानी पोहोचला आहात",
  },
};

export function translateInstruction(instruction: string, language: AppLanguage): string {
  if (language === "en") return instruction;

  const lower = instruction.toLowerCase().trim();

  for (const key in phraseMap) {
    if (lower.startsWith(key)) {
      const translatedPrefix = phraseMap[key][language];
      const remainder = instruction.slice(key.length);
      return translatedPrefix + remainder;
    }
  }

  return instruction;
}