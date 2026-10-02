import type { AppLanguage } from "../context/LanguageContext";

const objectNameTranslations: Record<string, Record<AppLanguage, string>> = {
  person: { en: "person", hi: "व्यक्ति", mr: "व्यक्ती" },
  car: { en: "car", hi: "कार", mr: "कार" },
  bicycle: { en: "bicycle", hi: "साइकिल", mr: "सायकल" },
  motorcycle: { en: "motorcycle", hi: "मोटरसाइकिल", mr: "मोटरसायकल" },
  bus: { en: "bus", hi: "बस", mr: "बस" },
  truck: { en: "truck", hi: "ट्रक", mr: "ट्रक" },
  chair: { en: "chair", hi: "कुर्सी", mr: "खुर्ची" },
  "dining table": { en: "table", hi: "मेज", mr: "टेबल" },
  dog: { en: "dog", hi: "कुत्ता", mr: "कुत्रा" },
  cat: { en: "cat", hi: "बिल्ली", mr: "मांजर" },
  bottle: { en: "bottle", hi: "बोतल", mr: "बाटली" },
  backpack: { en: "backpack", hi: "बैग", mr: "बॅग" },
  handbag: { en: "bag", hi: "बैग", mr: "बॅग" },
  suitcase: { en: "suitcase", hi: "सूटकेस", mr: "सूटकेस" },
  door: { en: "door", hi: "दरवाजा", mr: "दरवाजा" },
  bench: { en: "bench", hi: "बेंच", mr: "बाकडे" },
  "traffic light": { en: "traffic light", hi: "ट्रैफिक लाइट", mr: "वाहतूक दिवा" },
  "fire hydrant": { en: "fire hydrant", hi: "फायर हाइड्रेंट", mr: "फायर हायड्रंट" },
  "stop sign": { en: "stop sign", hi: "स्टॉप साइन", mr: "स्टॉप चिन्ह" },
};

const announcementPhrase: Record<AppLanguage, (names: string) => string> = {
  en: (names) => `${names} detected ahead.`,
  hi: (names) => `आगे ${names} है।`,
  mr: (names) => `पुढे ${names} आहे.`,
};

export function translateObjectName(className: string, language: AppLanguage): string {
  const entry = objectNameTranslations[className];
  if (entry) return entry[language];
  return className;
}

export function buildDetectionAnnouncement(classNames: string[], language: AppLanguage): string {
  const translatedNames = classNames.map((name) => translateObjectName(name, language));
  const joined = translatedNames.join(", ");
  return announcementPhrase[language](joined);
}