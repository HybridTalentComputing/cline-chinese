// Public PostHog key (safe for open source)
export const posthogProdConfig = {
	apiKey: "phc_w0aKP8eb3nGOd9sluhNYjwqZckp1PW3SaAJ2R0an1Ye",
	host: "https://us.i.posthog.com",
	uiHost: "https://us.posthog.com",
}

// Public PostHog key for Development Environment project
const posthogDevEnvConfig = {
	apiKey: "phc_uY24EJXNBcc9kwO1K8TJUl5hPQntGM6LL1Mtrz0CBD4",
	host: "https://data.cline.bot",
	uiHost: "https://us.i.posthog.com",
}

export const posthogConfig = process.env.IS_DEV === "true" ? posthogDevEnvConfig : posthogProdConfig
