import { createI18n } from "vue-i18n";

import zh from "./locales/zh.json";
import en from "./locales/en.json";

const i18n = createI18n({
  legacy: false,
  locale: "zh",
  fallbackLocale: "zh",
  messages: {
    zh,
    en,
  },
});

export function setI18nLanguage(lang: string) {
  i18n.global.locale.value = lang as any;
}

export default i18n;
