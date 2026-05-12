export const locales = ['zh-CN', 'en', 'ru', 'ja'] as const;
export const defaultLocale = 'zh-CN' as const;

export type Locale = (typeof locales)[number];
