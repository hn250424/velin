import "@milkdown/theme-nord/style.css";

import type Response from "@shared/types/Response";
import type { TabEditorsDto } from "@shared/dto/TabEditorDto";
import CommandDispatcher from "../CommandDispatcher";
import ShortcutRegistry from "../modules/input/ShortcutRegistry";
import TabEditorFacade from "../modules/tab_editor/TabEditorFacade";

export default function registerFileHandlers(
	commandDispatcher: CommandDispatcher,
	tabEditorFacade: TabEditorFacade,
	shortcutRegistry: ShortcutRegistry
) {
	bindCommandWithmenu(commandDispatcher, tabEditorFacade);
	bindCommandWithShortcut(commandDispatcher, shortcutRegistry);
}

function bindCommandWithmenu(commandDispatcher: CommandDispatcher, tabEditorFacade: TabEditorFacade) {
	document.getElementById("file_menu_new_tab")!.addEventListener("click", async () => {
		await commandDispatcher.performNewTab("menu");
	});

	document.getElementById("file_menu_open_file")!.addEventListener("click", async () => {
		await commandDispatcher.performOpenFile("menu");
	});

	document.getElementById("file_menu_open_directory")!.addEventListener("click", async () => {
		await commandDispatcher.performOpenDirectory("menu");
	});

	document.getElementById("file_menu_save")!.addEventListener("click", async () => {
		await commandDispatcher.performSave("menu");
	});

	document.getElementById("file_menu_save_as")!.addEventListener("click", async () => {
		await commandDispatcher.performSaveAs("menu");
	});

	document.getElementById("file_menu_save_all")!.addEventListener("click", async () => {
		const tabsData: TabEditorsDto = tabEditorFacade.getAllTabEditorData();
		const response: Response<TabEditorsDto> = await window.rendererToMain.saveAll(tabsData);
		if (response.result) tabEditorFacade.applySaveAllResults(response.data);
	});
}

function bindCommandWithShortcut(commandDispatcher: CommandDispatcher, shortcutRegistry: ShortcutRegistry) {
	shortcutRegistry.register("Ctrl+T", async (e: KeyboardEvent) => await commandDispatcher.performNewTab("shortcut"));
	shortcutRegistry.register("Ctrl+O", async (e: KeyboardEvent) => await commandDispatcher.performOpenFile("shortcut"));
	shortcutRegistry.register("Ctrl+Shift+O", async (e: KeyboardEvent) => await commandDispatcher.performOpenDirectory("shortcut"));
	shortcutRegistry.register("Ctrl+S", async (e: KeyboardEvent) => await commandDispatcher.performSave("shortcut"));
	shortcutRegistry.register("Ctrl+Shift+S", async (e: KeyboardEvent) => await commandDispatcher.performSaveAs("shortcut"));
}
