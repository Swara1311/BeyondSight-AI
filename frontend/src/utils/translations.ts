import type { AppLanguage } from "../context/LanguageContext";

interface Translations {
  readyToListen: string;
  listening: string;
  tapToStart: string;
  detectSurroundings: string;
  readText: string;
  navigation: string;
  savedPlaces: string;
  openingCamera: string;
  openingCameraOcr: string;
  gettingLocation: string;
  navigationSoon: string;
  emergencySoon: string;
  imListening: string;
  didNotUnderstand: string;
  languageChanged: string;
  youHaveArrived: string;
  howToUseGuide: string;
  sosConfirmPrompt: string;
  sosCancelled: string;
}

export const translations: Record<AppLanguage, Translations> = {
  en: {
    readyToListen: "Ready to listen",
    listening: "Listening...",
    tapToStart: "Tap the button and say a command",
    detectSurroundings: "Detect Surroundings",
    readText: "Read Text",
    navigation: "Navigation",
    savedPlaces: "Saved Places",
    openingCamera: "Opening camera to detect surroundings.",
    openingCameraOcr: "Would you like to use the camera or upload a file?",
    gettingLocation: "Getting your location.",
    navigationSoon: "Where would you like to go?",
    emergencySoon: "Emergency SOS will be available soon.",
    imListening: "I'm listening. How can I help you?",
    didNotUnderstand: "Sorry, I didn't understand that command.",
    languageChanged: "Language changed to English.",
    youHaveArrived: "You have arrived at your destination.",
    howToUseGuide:
      "Here are the things you can say. Say 'what is ahead' to detect objects around you. Say 'read text' to read a document or sign. Say 'navigate' followed by a place to get directions. Say 'saved places' to manage your favorite locations. Say 'where am I' to hear your current location. Press and hold the red button for two seconds to send an emergency alert. Say 'speak in hindi' or 'speak in marathi' to change the language.",
    sosConfirmPrompt:
      "Did you say emergency? Say the word confirm to send an alert, or say anything else to cancel.",
    sosCancelled: "Emergency cancelled.",
  },
  hi: {
    readyToListen: "सुनने के लिए तैयार",
    listening: "सुन रहा हूँ...",
    tapToStart: "बटन दबाएं और कमांड बोलें",
    detectSurroundings: "आसपास का पता लगाएं",
    readText: "टेक्स्ट पढ़ें",
    navigation: "नेविगेशन",
    savedPlaces: "सहेजे गए स्थान",
    openingCamera: "आसपास का पता लगाने के लिए कैमरा खोल रहा हूँ।",
    openingCameraOcr: "क्या आप कैमरा उपयोग करना चाहेंगे या फ़ाइल अपलोड करना चाहेंगे?",
    gettingLocation: "आपका स्थान प्राप्त कर रहा हूँ।",
    navigationSoon: "आप कहाँ जाना चाहेंगे?",
    emergencySoon: "आपातकालीन SOS जल्द ही उपलब्ध होगा।",
    imListening: "मैं सुन रहा हूँ। मैं आपकी कैसे मदद कर सकता हूँ?",
    didNotUnderstand: "क्षमा करें, मुझे वह कमांड समझ नहीं आया।",
    languageChanged: "भाषा हिंदी में बदल दी गई है।",
    youHaveArrived: "आप अपने गंतव्य पर पहुँच गए हैं।",
    howToUseGuide:
      "आप ये चीज़ें बोल सकते हैं। आसपास की वस्तुओं का पता लगाने के लिए 'आसपास का पता लगाओ' बोलें। कोई दस्तावेज़ या साइन पढ़ने के लिए 'टेक्स्ट पढ़ो' बोलें। दिशा-निर्देश पाने के लिए 'नेविगेट करो' के साथ जगह का नाम बोलें। अपनी पसंदीदा जगहें प्रबंधित करने के लिए 'सहेजे गए स्थान' बोलें। अपना वर्तमान स्थान सुनने के लिए 'मैं कहाँ हूँ' बोलें। आपातकालीन अलर्ट भेजने के लिए लाल बटन को दो सेकंड तक दबाए रखें। भाषा बदलने के लिए 'हिंदी में बोलो' या 'मराठी में बोलो' बोलें।",
    sosConfirmPrompt:
      "क्या आपने इमरजेंसी बोला? अलर्ट भेजने के लिए साफ़ शब्दों में पक्का बोलें, या कुछ और बोलें रद्द करने के लिए।",
    sosCancelled: "इमरजेंसी रद्द की गई।",
  },
  mr: {
    readyToListen: "ऐकण्यासाठी तयार",
    listening: "ऐकत आहे...",
    tapToStart: "बटण दाबा आणि आदेश बोला",
    detectSurroundings: "सभोवतालचा शोध घ्या",
    readText: "मजकूर वाचा",
    navigation: "नेव्हिगेशन",
    savedPlaces: "जतन केलेली ठिकाणे",
    openingCamera: "सभोवताल शोधण्यासाठी कॅमेरा उघडत आहे.",
    openingCameraOcr: "तुम्हाला कॅमेरा वापरायचा आहे की फाइल अपलोड करायची आहे?",
    gettingLocation: "तुमचे स्थान मिळवत आहे.",
    navigationSoon: "तुम्हाला कुठे जायचे आहे?",
    emergencySoon: "आपत्कालीन SOS लवकरच उपलब्ध होईल.",
    imListening: "मी ऐकत आहे. मी तुम्हाला कशी मदत करू शकतो?",
    didNotUnderstand: "माफ करा, मला ती आज्ञा समजली नाही.",
    languageChanged: "भाषा मराठीत बदलली आहे.",
    youHaveArrived: "तुम्ही तुमच्या गंतव्यस्थानी पोहोचला आहात.",
    howToUseGuide:
      "तुम्ही या गोष्टी बोलू शकता. आजूबाजूच्या वस्तू शोधण्यासाठी 'सभोवताल शोधा' म्हणा. एखादा दस्तऐवज किंवा फलक वाचण्यासाठी 'मजकूर वाचा' म्हणा. दिशानिर्देश मिळवण्यासाठी 'नेव्हिगेट करा' आणि ठिकाणाचे नाव म्हणा. तुमची आवडती ठिकाणे व्यवस्थापित करण्यासाठी 'जतन केलेली ठिकाणे' म्हणा. तुमचे सध्याचे स्थान ऐकण्यासाठी 'मी कुठे आहे' म्हणा. आपत्कालीन इशारा पाठवण्यासाठी लाल बटण दोन सेकंद दाबून ठेवा. भाषा बदलण्यासाठी 'हिंदीत बोला' किंवा 'इंग्रजीत बोला' म्हणा.",
    sosConfirmPrompt:
      "तुम्ही इमर्जन्सी म्हणालात का? इशारा पाठवण्यासाठी स्पष्टपणे पक्का म्हणा, किंवा रद्द करण्यासाठी काहीही म्हणा.",
    sosCancelled: "आणीबाणी रद्द केली.",
  },
};