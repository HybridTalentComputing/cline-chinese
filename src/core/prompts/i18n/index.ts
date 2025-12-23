import { SystemPromptContext } from "../system-prompt/types"
import { enTranslations } from "./en"
import { zhCnTranslations } from "./zh-cn"

/**
 * 获取提示词翻译资源
 * @param context 系统提示词上下文
 * @returns 根据语言偏好返回对应的翻译资源对象
 */
export function getPromptTranslation(context: SystemPromptContext) {
	const isChinese = context.preferredLanguage === "zh-CN" || context.preferredLanguage === "zh-TW"
	return isChinese ? zhCnTranslations : enTranslations
}

/**
 * 通用的本地化翻译辅助函数
 * @param context 系统提示词上下文
 * @param translations 包含英文和可选中文的翻译对象
 * @returns 选定的翻译字符串
 */
export function translate(context: SystemPromptContext, translations: { en: string; zh?: string }): string {
	const isChinese = context.preferredLanguage === "zh-CN" || context.preferredLanguage === "zh-TW"
	if (isChinese && translations.zh) {
		return translations.zh
	}
	return translations.en
}
