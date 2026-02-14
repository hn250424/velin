import "@milkdown/theme-nord/style.css"

import type Response from "@shared/types/Response"
import type { TabEditorsDto } from "@shared/dto/TabEditorDto"
import CommandManager from "../CommandManager"
import ShortcutRegistry from "../modules/input/ShortcutRegistry"
import TabEditorFacade from "../modules/tab_editor/TabEditorFacade"

export default function registerFileHandlers(
	commandManager: CommandManager,
	tabEditorFacade: TabEditorFacade,
	shortcutRegistry: ShortcutRegistry
) {
	bindCommandWithmenu(commandManager, tabEditorFacade)
	bindCommandWithShortcut(commandManager, shortcutRegistry)
}

function bindCommandWithmenu(commandManager: CommandManager, tabEditorFacade: TabEditorFacade) {
	document.querySelector("#file-menu-new-tab")!.addEventListener("click", async () => {
		await commandManager.performNewTab("menu")
	})

	document.querySelector("#file-menu-open-file")!.addEventListener("click", async () => {
		await commandManager.performOpenFile("menu")
	})

	document.querySelector("#file-menu-open-directory")!.addEventListener("click", async () => {
		await commandManager.performOpenDirectory("menu")
	})

	document.querySelector("#file-menu-save")!.addEventListener("click", async () => {
		await commandManager.performSave("menu")
	})

	document.querySelector("#file-menu-save-as")!.addEventListener("click", async () => {
		await commandManager.performSaveAs("menu")
	})

	document.querySelector("#file-menu-save-all")!.addEventListener("click", async () => {
		const tabsData: TabEditorsDto = tabEditorFacade.getAllTabEditorData()
		const response: Response<TabEditorsDto> = await window.rendererToMain.saveAll(tabsData)
		if (response.result) tabEditorFacade.applySaveAllResults(response.data)
	})
}

function bindCommandWithShortcut(commandManager: CommandManager, shortcutRegistry: ShortcutRegistry) {
	shortcutRegistry.register("Ctrl+T", async (e: KeyboardEvent) => await commandManager.performNewTab("shortcut"))
	shortcutRegistry.register("Ctrl+O", async (e: KeyboardEvent) => await commandManager.performOpenFile("shortcut"))
	shortcutRegistry.register(
		"Ctrl+Shift+O",
		async (e: KeyboardEvent) => await commandManager.performOpenDirectory("shortcut")
	)
	shortcutRegistry.register("Ctrl+S", async (e: KeyboardEvent) => await commandManager.performSave("shortcut"))
	shortcutRegistry.register("Ctrl+Shift+S", async (e: KeyboardEvent) => await commandManager.performSaveAs("shortcut"))
}
