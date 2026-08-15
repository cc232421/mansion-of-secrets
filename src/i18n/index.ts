/**
 * i18n — Internationalization setup for Mansion of Secrets
 *
 * Uses react-i18next with:
 * - Browser language detection (auto-detects user's locale)
 * - Namespace separation: common, landing, menu, orders, story, rooms
 * - Lazy-loaded locale files (code-split per language)
 * - localStorage persistence for user-selected language
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// ── Import locale data ────────────────────────────────────────────────────────
import en from './locales/en.json';
import zh from './locales/zh.json';

// ── Supported languages ───────────────────────────────────────────────────────
export const SUPPORTED_LANGUAGES: { code: string; name: string; nativeName: string; flag: string; wip?: boolean }[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', wip: true },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', wip: true },
];

export type SupportedLang = typeof SUPPORTED_LANGUAGES[number]['code'];

// ── i18next initialization ────────────────────────────────────────────────────
i18n
  .use(LanguageDetector)           // Detect browser/OS language
  .use(initReactI18next)           // React bindings
  .init({
    // ── Resources ────────────────────────────────────────────────────────────
    resources: {
      en: { translation: en },
      zh: { translation: zh },
      // Future: ja: { translation: ja }, etc.
    },

    // ── Starting language ────────────────────────────────────────────────────
    fallbackLng: 'en',            // Fallback if detection fails
    defaultNS: 'translation',

    // ── Interpolation ───────────────────────────────────────────────────────
    interpolation: {
      escapeValue: false,         // React already escapes
    },

    // ── Detection ───────────────────────────────────────────────────────────
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],    // Remember user choice
      lookupLocalStorage: 'mansion_language',
    },

    // ── React options ───────────────────────────────────────────────────────
    react: {
      useSuspense: false,         // Simpler, works with Vite
    },
  });

export default i18n;

/**
 * Change the app language programmatically.
 * Persists to localStorage so it survives page reloads.
 */
export function setLanguage(lang: SupportedLang): void {
  i18n.changeLanguage(lang);
  localStorage.setItem('mansion_language', lang);
}

/**
 * Get current language code.
 */
export function getCurrentLanguage(): SupportedLang {
  return (i18n.language || 'en') as SupportedLang;
}

/**
 * Get the native name of a language.
 */
export function getLanguageNativeName(lang: SupportedLang): string {
  const found = SUPPORTED_LANGUAGES.find(l => l.code === lang);
  return found?.nativeName ?? lang;
}
