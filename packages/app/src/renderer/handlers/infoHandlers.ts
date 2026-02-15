import type InfoFacade from "@renderer/modules/info/InfoFacade";

export function handleInfo(infoFacade: InfoFacade) {
	const { close } = infoFacade.elements

	close.addEventListener("click", () => {
		infoFacade.hideInformation()
	})
}
