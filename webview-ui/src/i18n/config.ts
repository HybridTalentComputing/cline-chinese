import i18n from "i18next"
import { initReactI18next } from "react-i18next"

// 导入基础资源（后续可以改为异步加载以优化性能）
import enCommon from "../locales/en/common.json"
import zhCommon from "../locales/zh-CN/common.json"

const resources = {
	en: {
		common: enCommon,
	},
	"zh-CN": {
		common: zhCommon,
	},
}

i18n.use(initReactI18next).init({
	resources,
	lng: "zh-CN", // 默认设为中文
	fallbackLng: "en",
	defaultNS: "common",
	interpolation: {
		escapeValue: false, // react already safes from xss
	},
})

export default i18n

