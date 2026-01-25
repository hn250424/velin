import CommandManager from "../CommandManager";
import ShortcutRegistry from "../modules/input/ShortcutRegistry";

export default function registerEditHandlers(commandManager: CommandManager, shortcutRegistry: ShortcutRegistry) {
	bindCommandWithmenu(commandManager);
	bindCommandWithShortcut(commandManager, shortcutRegistry);
}

function bindCommandWithmenu(commandManager: CommandManager) {
	document.getElementById("edit_menu_undo")!.addEventListener("click", async () => {
		await commandManager.performUndo("menu");
	});

	document.getElementById("edit_menu_redo")!.addEventListener("click", async () => {
		await commandManager.performRedo("menu");
	});

	document.getElementById("edit_menu_cut")!.addEventListener("click", async () => {
		await commandManager.performCut("menu");
	});

	document.getElementById("edit_menu_copy")!.addEventListener("click", async () => {
		await commandManager.performCopy("menu");
	});

	document.getElementById("edit_menu_paste")!.addEventListener("click", async () => {
		await commandManager.performPaste("menu");
	});

	document.getElementById("edit_menu_find")!.addEventListener("click", async () => {
		commandManager.toggleFindReplaceBox("menu", false);
	});

	document.getElementById("edit_menu_replace")!.addEventListener("click", async () => {
		commandManager.toggleFindReplaceBox("menu", true);
	});

	document.getElementById("find_up")!.addEventListener("click", async () => {
		commandManager.performFind("menu", "up");
	});

	document.getElementById("find_down")!.addEventListener("click", async () => {
		commandManager.performFind("menu", "down");
	});

	document.getElementById("find_close")!.addEventListener("click", async () => {
		commandManager.performCloseFindReplaceBox("menu");
	});

	document.getElementById("replace_current")!.addEventListener("click", async () => {
		commandManager.performReplace("menu");
	});

	document.getElementById("replace_all")!.addEventListener("click", async () => {
		commandManager.performReplaceAll("menu");
	});
}

function bindCommandWithShortcut(commandManager: CommandManager, shortcutRegistry: ShortcutRegistry) {
	shortcutRegistry.register("Ctrl+Z", async (e: KeyboardEvent) => await commandManager.performUndo("shortcut"));
	shortcutRegistry.register("Ctrl+Shift+Z", async (e: KeyboardEvent) => await commandManager.performRedo("shortcut"));
	shortcutRegistry.register("Ctrl+X", async (e: KeyboardEvent) => await commandManager.performCut("shortcut"));
	shortcutRegistry.register("Ctrl+C", async (e: KeyboardEvent) => await commandManager.performCopy("shortcut"));
	shortcutRegistry.register("Ctrl+V", async (e: KeyboardEvent) => await commandManager.performPaste("shortcut"));
	shortcutRegistry.register("Ctrl+F", (e: KeyboardEvent) => commandManager.toggleFindReplaceBox("shortcut", false));
	shortcutRegistry.register("Ctrl+R", (e: KeyboardEvent) => commandManager.toggleFindReplaceBox("shortcut", true));
	shortcutRegistry.register("Ctrl+Alt+ENTER", (e: KeyboardEvent) => commandManager.performReplaceAll("shortcut"));
}
