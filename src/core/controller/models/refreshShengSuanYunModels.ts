import { Controller } from ".."
import { EmptyRequest } from "../../../shared/proto/common"
import { OpenRouterCompatibleModelInfo, ShengSuanYunModelInfo } from "../../../shared/proto/models"
import axios from "axios"
import path from "path"
import fs from "fs/promises"
import { fileExistsAtPath } from "@utils/fs"
import { GlobalFileNames } from "@core/storage/disk"

/**
 * Refreshes the ShengSuanYun models and returns the updated model list
 * @param controller The controller instance
 * @param request Empty request object
 * @returns Response containing the ShengSuanYun models
 */

export async function refreshShengSuanYunModels(
	controller: Controller,
	request: EmptyRequest,
): Promise<OpenRouterCompatibleModelInfo> {
	const shengSuanYunModelsFilePath = path.join(await ensureCacheDirectoryExists(controller), GlobalFileNames.shengSuanYunModels)

	let models: Record<string, Partial<ShengSuanYunModelInfo>> = {}
	try {
		const response = await axios.get("https://router.shengsuanyun.com/api/v1/models/")
		if (response.data?.data && Array.isArray(response.data?.data)) {
			const rawModels = response.data.data
			const parsePrice = (price: any) => {
				if (price) {
					return parseInt(price) / 10000
				}
				return undefined
			}
			for (const model of rawModels) {
				const modelInfo: Partial<ShengSuanYunModelInfo> = {
					maxTokens: model.max_tokens || undefined,
					contextWindow: model.context_window,
					supportsImages: model.architecture?.input?.includes("image"),
					supportsPromptCache: model.supports_prompt_cache,
					inputPrice: parsePrice(model.pricing?.prompt),
					outputPrice: parsePrice(model.pricing?.completion),
					description: model.description,
					cacheWritesPrice: 0,
					cacheReadsPrice: parsePrice(model.pricing?.cache),
				}
				models[model.api_name] = modelInfo
			}
		} else {
			console.error("Invalid response from ShengSuanYun API")
		}
		await fs.writeFile(shengSuanYunModelsFilePath, JSON.stringify(models))
		console.log("ShengSuanYun models fetched and saved", models)
	} catch (error) {
		console.error("Error fetching ShengSuanYun models:", error)
		// If we failed to fetch models, try to read cached models
		const cachedModels = await readShengSuanYunModels(controller)
		if (cachedModels) {
			models = cachedModels
		}
	}

	const typedModels: Record<string, ShengSuanYunModelInfo> = {}
	for (const [key, model] of Object.entries(models)) {
		typedModels[key] = {
			maxTokens: model.maxTokens ?? 0,
			contextWindow: model.contextWindow ?? 0,
			supportsImages: model.supportsImages ?? false,
			supportsPromptCache: model.supportsPromptCache ?? false,
			inputPrice: model.inputPrice ?? 0,
			outputPrice: model.outputPrice ?? 0,
			cacheWritesPrice: model.cacheWritesPrice ?? 0,
			cacheReadsPrice: model.cacheReadsPrice ?? 0,
			description: model.description ?? "",
		}
	}

	controller.postMessageToWebview({
		type: "shengSuanYunModels",
		shengSuanYunModels: typedModels,
	})

	return OpenRouterCompatibleModelInfo.create({ models: typedModels })
}

/**
 * Reads cached ShengSuanYun models from disk
 */
async function readShengSuanYunModels(
	controller: Controller,
): Promise<Record<string, Partial<ShengSuanYunModelInfo>> | undefined> {
	const shengSuanYunModelsFilePath = path.join(await ensureCacheDirectoryExists(controller), GlobalFileNames.shengSuanYunModels)
	const fileExists = await fileExistsAtPath(shengSuanYunModelsFilePath)
	if (fileExists) {
		try {
			const fileContents = await fs.readFile(shengSuanYunModelsFilePath, "utf8")
			return JSON.parse(fileContents)
		} catch (error) {
			console.error("Error reading cached ShengSuanYun models:", error)
			return undefined
		}
	}
	return undefined
}

/**
 * Ensures the cache directory exists and returns its path
 */
async function ensureCacheDirectoryExists(controller: Controller): Promise<string> {
	const cacheDir = path.join(controller.context.globalStorageUri.fsPath, "cache")
	await fs.mkdir(cacheDir, { recursive: true })
	return cacheDir
}
