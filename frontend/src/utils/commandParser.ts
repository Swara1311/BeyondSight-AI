export type CommandType =
  | "start_assistant"
  | "detect_surroundings"
  | "read_text"
  | "start_navigation"
  | "where_am_i"
  | "sos"
  | "saved_places"
  | "how_to_use"
  | "change_language"
  | "unknown";

interface ParsedCommand {
  type: CommandType;
  raw: string;
  language?: "en" | "hi" | "mr";
}

export function parseCommand(text: string): ParsedCommand {
  const normalized = text.toLowerCase().trim();

  const isHindiRequest =
    normalized.includes("speak in hindi") ||
    normalized.includes("hindi mein") ||
    normalized.includes("हिंदी में") ||
    normalized.includes("हिंदी");

  const isMarathiRequest =
    normalized.includes("speak in marathi") ||
    normalized.includes("marathi mein") ||
    normalized.includes("मराठी में") ||
    normalized.includes("मराठीत") ||
    normalized.includes("मराठी");

  const isEnglishRequest =
    normalized.includes("speak in english") ||
    normalized.includes("english mein") ||
    normalized.includes("अंग्रेजी में") ||
    normalized.includes("इंग्रजीत") ||
    normalized.includes("अंग्रेजी") ||
    normalized.includes("इंग्रजी");

  if (isHindiRequest) {
    return { type: "change_language", raw: text, language: "hi" };
  }

  if (isMarathiRequest) {
    return { type: "change_language", raw: text, language: "mr" };
  }

  if (isEnglishRequest) {
    return { type: "change_language", raw: text, language: "en" };
  }

  // How to use — English, Hindi, Marathi
  if (
    normalized.includes("how to use") ||
    normalized.includes("help") ||
    normalized.includes("कैसे इस्तेमाल") ||
    normalized.includes("मदद चाहिए") ||
    normalized.includes("कसे वापरायचे") ||
    normalized.includes("मदत हवी")
  ) {
    return { type: "how_to_use", raw: text };
  }

  // Detect Surroundings — English, Hindi, Marathi
  if (
    normalized.includes("what is ahead") ||
    normalized.includes("detect") ||
    normalized.includes("आसपास") ||
    normalized.includes("सामने क्या है") ||
    normalized.includes("पता लगा") ||
    normalized.includes("सभोवताल") ||
    normalized.includes("शोध घ्या")
  ) {
    return { type: "detect_surroundings", raw: text };
  }

  // Read Text — English, Hindi, Marathi
  if (
    normalized.includes("read this") ||
    normalized.includes("read text") ||
    normalized.includes("पढ़ो") ||
    normalized.includes("पढ़ें") ||
    normalized.includes("टेक्स्ट पढ़") ||
    normalized.includes("वाचा") ||
    normalized.includes("मजकूर वाच")
  ) {
    return { type: "read_text", raw: text };
  }

  // Where Am I — English, Hindi, Marathi
  if (
    normalized.includes("where am i") ||
    normalized.includes("मैं कहाँ हूँ") ||
    normalized.includes("कहाँ हूँ") ||
    normalized.includes("मी कुठे आहे") ||
    normalized.includes("कुठे आहे")
  ) {
    return { type: "where_am_i", raw: text };
  }

  // Saved Places — English, Hindi, Marathi
  if (
    normalized.includes("saved place") ||
    normalized.includes("my places") ||
    normalized.includes("सहेजे गए स्थान") ||
    normalized.includes("सेव्ड प्लेस") ||
    normalized.includes("मेरी जगह") ||
    normalized.includes("स्थान") ||
    normalized.includes("जगह") ||
    normalized.includes("जतन केलेली ठिकाणे") ||
    normalized.includes("माझी ठिकाणे") ||
    normalized.includes("ठिकाणे") ||
    normalized.includes("ठिकाण")
  ) {
    return { type: "saved_places", raw: text };
  }

  // Navigation — English, Hindi, Marathi
  if (
    normalized.includes("take me to") ||
    normalized.includes("navigate") ||
    normalized.includes("navigation") ||
    normalized.includes("go to") ||
    normalized.includes("ले चलो") ||
    normalized.includes("जाना है") ||
    normalized.includes("रास्ता") ||
    normalized.includes("नेविगेशन") ||
    normalized.includes("घेऊन चला") ||
    normalized.includes("जायचे आहे") ||
    normalized.includes("नेव्हिगेशन")
  ) {
    return { type: "start_navigation", raw: text };
  }

  // SOS / Emergency — English, Hindi, Marathi
  if (
    normalized.includes("emergency") ||
    normalized.includes("sos") ||
    normalized.includes("आपातकाल") ||
    normalized.includes("मदद") ||
    normalized.includes("आपत्काल") ||
    normalized.includes("मदत")
  ) {
    return { type: "sos", raw: text };
  }

  // Start Assistant — English, Hindi, Marathi
  if (
    normalized.includes("start assistant") ||
    normalized.includes("hello") ||
    normalized.includes("नमस्ते") ||
    normalized.includes("शुरू करो") ||
    normalized.includes("सुरू करा")
  ) {
    return { type: "start_assistant", raw: text };
  }

  return { type: "unknown", raw: text };
}