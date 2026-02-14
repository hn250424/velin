import WindowState from "../modules/state/WindowState"

import maximizeSvg from "../assets/icons/maximize.svg?raw"
import unmaximizeSvg from "../assets/icons/unmaximize.svg?raw"

export default function registerWindowHandlers(windowState: WindowState) {
	const maximizeBtn = document.getElementById("maximizeWindow") as HTMLElement
	const minimizeBtn = document.getElementById("minimizeWindow") as HTMLElement

	window.mainToRenderer.onMaximizeWindow(() => {
		maximizeBtn.querySelector("svg")!.outerHTML = unmaximizeSvg
		windowState.setWindowMaximizeState(true)
	})
	window.mainToRenderer.onUnmaximizeWindow(() => {
		maximizeBtn.querySelector("svg")!.outerHTML = maximizeSvg
		windowState.setWindowMaximizeState(false)
	})

	maximizeBtn.addEventListener("click", () => {
		if (windowState.isWindowMaximize()) window.rendererToMain.requestUnmaximizeWindow()
		else window.rendererToMain.requestMaximizeWindow()
	})
	minimizeBtn.addEventListener("click", () => {
		window.rendererToMain.requestMinimizeWindow()
	})

	if (windowState.isWindowMaximize()) maximizeBtn.querySelector("svg")!.outerHTML = unmaximizeSvg
	else maximizeBtn.querySelector("svg")!.outerHTML = maximizeSvg
}
