import "intl-pluralrules";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import tr from "./locales/tr.json";

// US-primary launch. TR resources are bundled but not user-selectable in v1.
// Dev/QA can flip via i18next.changeLanguage("tr") at runtime.
const SUPPORTED = ["en", "tr"] as const;
type Lang = (typeof SUPPORTED)[number];

void i18next.use(initReactI18next).init({
  compatibilityJSON: "v4",
  resources: {
    en: { translation: en },
    tr: { translation: tr },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  returnNull: false,
});

export { i18next };
export type { Lang };
