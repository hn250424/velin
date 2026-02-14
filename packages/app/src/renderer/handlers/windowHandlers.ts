import maximizeSvg from "../assets/icons/maximize.svg?raw"
import unmaximizeSvg from "../assets/icons/unmaximize.svg?raw"
import type WindowFacade from "@renderer/modules/window/WindowFacade"

export default function registerWindowHandlers(windowFacade: WindowFacade) {
	const {
		maximizeBtn,
		minimizeBtn
	} = windowFacade.elements

	window.mainToRenderer.onMaximizeWindow(() => {
		windowFacade.setMaximizeButtonSvg(unmaximizeSvg)
		windowFacade.setWindowMaximizeState(true)
	})
	window.mainToRenderer.onUnmaximizeWindow(() => {
		windowFacade.setMaximizeButtonSvg(maximizeSvg)
		windowFacade.setWindowMaximizeState(false)
	})

	maximizeBtn.addEventListener("click", () => {
		if (windowFacade.isWindowMaximize()) window.rendererToMain.requestUnmaximizeWindow()
		else window.rendererToMain.requestMaximizeWindow()
	})
	minimizeBtn.addEventListener("click", () => {
		window.rendererToMain.requestMinimizeWindow()
	})

	if (windowFacade.isWindowMaximize()) windowFacade.setMaximizeButtonSvg(unmaximizeSvg)
	else windowFacade.setMaximizeButtonSvg(maximizeSvg)
}
