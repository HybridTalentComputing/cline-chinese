import { copyFileSync, existsSync, mkdirSync } from "node:fs"
import { resolve } from "node:path"

const FONTS = [
	{
		source: "node_modules/@fontsource/azeret-mono/files/azeret-mono-latin-300-normal.woff",
		dest: "public/fonts/azeret-mono-300.woff",
	},
	{
		source: "node_modules/@fontsource/azeret-mono/files/azeret-mono-latin-300-normal.woff2",
		dest: "public/fonts/azeret-mono-300.woff2",
	},
	{
		source: "node_modules/@fontsource/azeret-mono/files/azeret-mono-latin-400-normal.woff",
		dest: "public/fonts/azeret-mono-400.woff",
	},
	{
		source: "node_modules/@fontsource/azeret-mono/files/azeret-mono-latin-400-normal.woff2",
		dest: "public/fonts/azeret-mono-400.woff2",
	},
	{
		source: "node_modules/@fontsource/azeret-mono/files/azeret-mono-latin-700-normal.woff",
		dest: "public/fonts/azeret-mono-700.woff",
	},
	{
		source: "node_modules/@fontsource/azeret-mono/files/azeret-mono-latin-700-normal.woff2",
		dest: "public/fonts/azeret-mono-700.woff2",
	},
]

// Create fonts directory if it doesn't exist
const fontsDir = resolve("public/fonts")
if (!existsSync(fontsDir)) {
	mkdirSync(fontsDir, { recursive: true })
}

// Copy each font file
FONTS.forEach((font) => {
	try {
		copyFileSync(resolve(font.source), resolve(font.dest))
		console.log(`Copied ${font.source} to ${font.dest}`)
	} catch (err) {
		console.error(`Error copying ${font.source}:`, err)
	}
})

// Generate CSS files that reference the local fonts
const CSS_TEMPLATE_300 = `
@font-face {
	font-family: "Azeret Mono";
	font-style: normal;
	font-display: swap;
	font-weight: 300;
	src: url(/fonts/azeret-mono-300.woff2) format("woff2"),
		url(/fonts/azeret-mono-300.woff) format("woff");
}
`

const CSS_TEMPLATE_400 = `
@font-face {
	font-family: "Azeret Mono";
	font-style: normal;
	font-display: swap;
	font-weight: 400;
	src: url(/fonts/azeret-mono-400.woff2) format("woff2"),
		url(/fonts/azeret-mono-400.woff) format("woff");
}
`

const CSS_TEMPLATE_700 = `
@font-face {
	font-family: "Azeret Mono";
	font-style: normal;
	font-display: swap;
	font-weight: 700;
	src: url(/fonts/azeret-mono-700.woff2) format("woff2"),
		url(/fonts/azeret-mono-700.woff) format("woff");
}
`

import { writeFileSync } from "node:fs"

writeFileSync(resolve("public/fonts/azeret-mono-300.css"), CSS_TEMPLATE_300)
writeFileSync(resolve("public/fonts/azeret-mono-400.css"), CSS_TEMPLATE_400)
writeFileSync(resolve("public/fonts/azeret-mono-700.css"), CSS_TEMPLATE_700)
