/**
 * Select text based on locale. Falls back to English if locale is not supported or not provided.
 */
export function getLocaleText<T>(locale: string | undefined, texts: { en: T; "zh-CN"?: T }): T {
	if (locale === "zh-CN" && texts["zh-CN"]) {
		return texts["zh-CN"]
	}
	return texts.en
}

/**
 * Check if the locale is Chinese
 */
export function isZhCN(locale: string | undefined): boolean {
	return locale === "zh-CN"
}
