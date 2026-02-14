import type WindowFacade from "@renderer/modules/window/WindowFacade"

export default function registerWindowHandlers(windowFacade: WindowFacade) {
	const {
		maximizeBtn,
		minimizeBtn
	} = windowFacade.renderer.elements

	window.mainToRenderer.onMaximizeWindow(() => {
		windowFacade.renderUnMaximizeButtonSvg()
		windowFacade.setWindowMaximizeState(true)
	})
	window.mainToRenderer.onUnmaximizeWindow(() => {
		windowFacade.renderMaximizeButtonSvg()
		windowFacade.setWindowMaximizeState(false)
	})

	maximizeBtn.addEventListener("click", () => {
		if (windowFacade.isWindowMaximize()) window.rendererToMain.requestUnmaximizeWindow()
		else window.rendererToMain.requestMaximizeWindow()
	})
	minimizeBtn.addEventListener("click", () => {
		window.rendererToMain.requestMinimizeWindow()
	})
}
