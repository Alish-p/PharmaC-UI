export const fallbackLng = 'en';
export const languages = ['en', 'hi'];
export const defaultNS = 'common';
export const cookieName = 'i18next';

// ----------------------------------------------------------------------

export function i18nOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    // debug: true,
    lng,
    fallbackLng,
    ns,
    defaultNS,
    fallbackNS: defaultNS,
    supportedLngs: languages,
  };
}

// ----------------------------------------------------------------------

export const changeLangMessages = {
  en: {
    success: 'Language has been changed!',
    error: 'Error changing language!',
    loading: 'Loading...',
  },
  hi: {
    success: 'भाषा बदल दी गई है!',
    error: 'भाषा बदलने में त्रुटि!',
    loading: 'लोड हो रहा है...',
  },
};
