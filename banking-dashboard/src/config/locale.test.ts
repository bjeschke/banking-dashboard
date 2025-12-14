import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  setLocale,
  getLocale,
  setCustomLocale,
  LocaleConfig,
} from './locale';

describe('locale configuration', () => {
  beforeEach(() => {
    setLocale('de-DE');
  });

  describe('DEFAULT_LOCALE', () => {
    it('should have German locale settings', () => {
      expect(DEFAULT_LOCALE.locale).toBe('de-DE');
      expect(DEFAULT_LOCALE.currency).toBe('EUR');
      expect(DEFAULT_LOCALE.dateFormat).toBeDefined();
    });
  });

  describe('SUPPORTED_LOCALES', () => {
    it('should contain de-DE locale', () => {
      expect(SUPPORTED_LOCALES['de-DE']).toBeDefined();
      expect(SUPPORTED_LOCALES['de-DE'].currency).toBe('EUR');
    });

    it('should contain en-US locale', () => {
      expect(SUPPORTED_LOCALES['en-US']).toBeDefined();
      expect(SUPPORTED_LOCALES['en-US'].currency).toBe('USD');
    });

    it('should contain en-GB locale', () => {
      expect(SUPPORTED_LOCALES['en-GB']).toBeDefined();
      expect(SUPPORTED_LOCALES['en-GB'].currency).toBe('GBP');
    });

    it('should contain fr-FR locale', () => {
      expect(SUPPORTED_LOCALES['fr-FR']).toBeDefined();
      expect(SUPPORTED_LOCALES['fr-FR'].currency).toBe('EUR');
    });
  });

  describe('setLocale', () => {
    it('should set locale to supported locale', () => {
      setLocale('en-US');
      const locale = getLocale();
      expect(locale.locale).toBe('en-US');
      expect(locale.currency).toBe('USD');
    });

    it('should fall back to default for unsupported locale', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      setLocale('invalid-locale');
      const locale = getLocale();

      expect(locale.locale).toBe('de-DE');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Locale "invalid-locale" not supported. Using default.'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('getLocale', () => {
    it('should return current locale', () => {
      const locale = getLocale();
      expect(locale).toBeDefined();
      expect(locale.locale).toBe('de-DE');
    });

    it('should return updated locale after setLocale', () => {
      setLocale('en-GB');
      const locale = getLocale();
      expect(locale.locale).toBe('en-GB');
      expect(locale.currency).toBe('GBP');
    });
  });

  describe('setCustomLocale', () => {
    it('should set a custom locale configuration', () => {
      const customLocale: LocaleConfig = {
        locale: 'ja-JP',
        currency: 'JPY',
        dateFormat: { year: 'numeric', month: 'long', day: 'numeric' },
      };

      setCustomLocale(customLocale);
      const locale = getLocale();

      expect(locale.locale).toBe('ja-JP');
      expect(locale.currency).toBe('JPY');
    });
  });
});
