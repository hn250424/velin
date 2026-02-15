import type MenuElements from "@renderer/modules/menu/MenuElements"
import ShortcutRegistry from "../../core/ShortcutRegistry"
import type InfoFacade from "@renderer/modules/info/InfoFacade"

export function handleHelpMenu(
	shortcutRegistry: ShortcutRegistry,
	menuElements: MenuElements,
	infoFacade: InfoFacade
) {
	bindCommandWithMenu(menuElements, infoFacade)
	bindCommandWithShortcut(shortcutRegistry, infoFacade)
}

function bindCommandWithMenu(menuElements: MenuElements, infoFacade: InfoFacade) {
	const { information } = menuElements

	information.addEventListener("click", async () => {
		infoFacade.showInformation()
	})
}

function bindCommandWithShortcut(
	shortcutRegistry: ShortcutRegistry,
	infoFacade: InfoFacade
) {
	shortcutRegistry.register("F1", async () => infoFacade.showInformation())
}
