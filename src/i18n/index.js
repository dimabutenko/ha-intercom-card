import en from "./en.js";
import ru from "./ru.js";

// Register new languages here: import the file and add it to this map.
export const LANGUAGES = { en, ru };
export const DEFAULT_LANGUAGE = "en";

// Explicit `language` in the card config wins; otherwise the Home Assistant UI
// language (if translated); otherwise English.
export function resolveLanguage(configLang, hass) {
  const pick = (code) => {
    if (!code) return null;
    const short = String(code).toLowerCase().split(/[-_]/)[0];
    return LANGUAGES[short] ? short : null;
  };
  return pick(configLang) || pick(hass && (hass.locale?.language || hass.language)) || DEFAULT_LANGUAGE;
}

function lookup(dict, path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), dict);
}

// t("group.name", {n: 5}) with {n} placeholders; falls back to English, then to the path itself.
export function makeTranslator(lang) {
  const dict = LANGUAGES[lang] || LANGUAGES[DEFAULT_LANGUAGE];
  const fallback = LANGUAGES[DEFAULT_LANGUAGE];
  return (path, vars) => {
    const s = lookup(dict, path) ?? lookup(fallback, path) ?? path;
    return vars ? s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "") : s;
  };
}
