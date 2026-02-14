import type CommandManager from "@renderer/CommandManager";
import type InfoFacade from "@renderer/modules/info/InfoFacade";

export default function registerInfoHandlers(commandManager: CommandManager, infoFacade: InfoFacade) {
	const { close } = infoFacade.elements

	close.addEventListener("click", () => {
		commandManager.performHideInformation("menu")
	})
}
