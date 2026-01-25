import "@milkdown/theme-nord/style.css";

import type Response from "@shared/types/Response";
import type { TabEditorsDto } from "@shared/dto/TabEditorDto";
import CommandManager from "../CommandManager";
import ShortcutRegistry from "../modules/input/ShortcutRegistry";
import TabEditorFacade from "../modules/tab_editor/TabEditorFacade";

export default function registerFileHandlers(
	commandManager: CommandManager,
	tabEditorFacade: TabEditorFacade,
	shortcutRegistry: ShortcutRegistry
) {
	bindCommandWithmenu(commandManager, tabEditorFacade);
	bindCommandWithShortcut(commandManager, shortcutRegistry);
}

function bindCommandWithmenu(commandManager: CommandManager, tabEditorFacade: TabEditorFacade) {
	document.getElementById("file_menu_new_tab")!.addEventListener("click", async () => {
		await commandManager.performNewTab("menu");
	});

	document.getElementById("file_menu_open_file")!.addEventListener("click", async () => {
		await commandManager.performOpenFile("menu");
	});

	document.getElementById("file_menu_open_directory")!.addEventListener("click", async () => {
		await commandManager.performOpenDirectory("menu");
	});

	document.getElementById("file_menu_save")!.addEventListener("click", async () => {
		await commandManager.performSave("menu");
	});

	document.getElementById("file_menu_save_as")!.addEventListener("click", async () => {
		await commandManager.performSaveAs("menu");
	});

	document.getElementById("file_menu_save_all")!.addEventListener("click", async () => {
		const tabsData: TabEditorsDto = tabEditorFacade.getAllTabEditorData();
		const response: Response<TabEditorsDto> = await window.rendererToMain.saveAll(tabsData);
		if (response.result) tabEditorFacade.applySaveAllResults(response.data);
	});
}

function bindCommandWithShortcut(commandManager: CommandManager, shortcutRegistry: ShortcutRegistry) {
	shortcutRegistry.register("Ctrl+T", async (e: KeyboardEvent) => await commandManager.performNewTab("shortcut"));
	shortcutRegistry.register("Ctrl+O", async (e: KeyboardEvent) => await commandManager.performOpenFile("shortcut"));
	shortcutRegistry.register("Ctrl+Shift+O", async (e: KeyboardEvent) => await commandManager.performOpenDirectory("shortcut"));
	shortcutRegistry.register("Ctrl+S", async (e: KeyboardEvent) => await commandManager.performSave("shortcut"));
	shortcutRegistry.register("Ctrl+Shift+S", async (e: KeyboardEvent) => await commandManager.performSaveAs("shortcut"));
}
