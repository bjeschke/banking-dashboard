export interface LocaleConfig {
  locale: string;
  currency: string;
  dateFormat: Intl.DateTimeFormatOptions;
}

// default to german since thats our main market
export const DEFAULT_LOCALE: LocaleConfig = {
  locale: 'de-DE',
  currency: 'EUR',
  dateFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
};

export const SUPPORTED_LOCALES: Record<string, LocaleConfig> = {
  'de-DE': DEFAULT_LOCALE,
  'en-US': {
    locale: 'en-US',
    currency: 'USD',
    dateFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
  },
  'en-GB': {
    locale: 'en-GB',
    currency: 'GBP',
    dateFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
  },
  'fr-FR': {
    locale: 'fr-FR',
    currency: 'EUR',
    dateFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
  },
  // TODO: add more locales as needed
};

let currentLocale = DEFAULT_LOCALE;

export function setLocale(key: string) {
  const loc = SUPPORTED_LOCALES[key];
  if (loc) {
    currentLocale = loc;
  } else {
    console.warn(`Locale "${key}" not supported. Using default.`);
    currentLocale = DEFAULT_LOCALE;
  }
}

export function getLocale(): LocaleConfig {
  return currentLocale;
}

// for custom locale configs not in our predefined list
export function setCustomLocale(config: LocaleConfig) {
  currentLocale = config;
}
