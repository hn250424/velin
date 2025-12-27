import CommandDispatcher from "../CommandDispatcher";
import ShortcutRegistry from "../modules/input/ShortcutRegistry";

export default function registerHelpHandlers(commandDispatcher: CommandDispatcher, shortcutRegistry: ShortcutRegistry) {
	bindCommandWithmenu(commandDispatcher);
	bindCommandWithShortcut(commandDispatcher, shortcutRegistry);
}

function bindCommandWithmenu(commandDispatcher: CommandDispatcher) {
	document.getElementById("help-information")!.addEventListener("click", async () => {
		commandDispatcher.performShowInformation("menu");
	});

	document.getElementById("info-button")!.addEventListener("click", () => {
		commandDispatcher.performHideInformation("menu");
	});
}

function bindCommandWithShortcut(commandDispatcher: CommandDispatcher, shortcutRegistry: ShortcutRegistry) {
	shortcutRegistry.register("F1", async (e: KeyboardEvent) => commandDispatcher.performShowInformation("shortcut"));
}
