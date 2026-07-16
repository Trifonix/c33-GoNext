import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { en, ru } from '@/src/i18n/resources';

void i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    en: { translation: en },
  },
  lng: 'ru',
  fallbackLng: 'ru',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  initAsync: false,
});

export default i18n;
