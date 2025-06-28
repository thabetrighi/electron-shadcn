import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { translations } from "./translations";

// Initialize i18n instance
i18n
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: true,
    react: {
      useSuspense: false,
    },
    interpolation: {
      escapeValue: false,
    },
    resources: translations, // Load all translations initially
    // Add these options for better language handling
    load: 'languageOnly', // Ignore region code
    returnNull: false, // Return key instead of null when translation is missing
    returnEmptyString: false, // Return key instead of empty string when translation is missing
    saveMissing: true, // Save missing translations (helpful for debugging)
    missingKeyHandler: (lng, ns, key) => {
      console.warn(`Missing translation: ${key} for language: ${lng} in namespace: ${ns}`);
    }
  });

export default i18n;
