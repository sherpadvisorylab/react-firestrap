
export const COUNTRIES = {
    "US": "United States",
    "CN": "中国",
    "IT": "Italia",
    "FR": "France",
    "DE": "Deutschland",
    "ES": "España",
    "PT": "Portugal",
    "RU": "Россия",
    "JP": "日本"
};

export const LANGS = {
    "it": "Italiano",
    "en": "English",
    "fr": "Français",
    "de": "Deutsch",
    "es": "Español",
    "pt": "Português",
    "ru": "Русский",
    "ja": "日本語",
    "ko": "한국어"
};


export const currentCountry = (code: boolean = false) => {
    const country = localStorage.getItem("user.country") || navigator.language.split("-")[1] || "US"
    return code ? country : COUNTRIES[country as keyof typeof COUNTRIES]
}
export const currentLang = (code: boolean = false) => {
    const lang = localStorage.getItem("user.lang") || navigator.language.split("-")[0] || "en"
    return code ? lang : LANGS[lang as keyof typeof LANGS]
}
