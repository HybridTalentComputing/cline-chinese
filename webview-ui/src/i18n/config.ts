import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import enCommon from "../locales/en/common.json"
import enMisc from "../locales/en/common-misc.json"
import enSettings from "../locales/en/settings.json"
import zhCommon from "../locales/zh-CN/common.json"
import zhMisc from "../locales/zh-CN/common-misc.json"
import zhSettings from "../locales/zh-CN/settings.json"

const resources = {
	en: {
		common: enCommon,
		settings: enSettings,
		misc: enMisc,
	},
	"zh-CN": {
		common: zhCommon,
		settings: zhSettings,
		misc: zhMisc,
	},
}

i18n.use(initReactI18next).init({
	resources,
	lng: "zh-CN",
	fallbackLng: "en",
	defaultNS: "common",
	interpolation: {
		escapeValue: false,
	},
})

export default i18n
