import WindowState from "../modules/state/WindowState";

export default function registerWindowHandlers(windowState: WindowState) {
	const maximizeBtn = document.getElementById("maximizeWindow") as HTMLImageElement;
	const maximizeImg = maximizeBtn?.querySelector("img") as HTMLImageElement;

	window.mainToRenderer.onMaximizeWindow(() => {
		maximizeImg.src = new URL("../assets/icons/unmaximize.png", import.meta.url).toString();
		windowState.setWindowMaximizeState(true);
	});
	window.mainToRenderer.onUnmaximizeWindow(() => {
		maximizeImg.src = new URL("../assets/icons/maximize.png", import.meta.url).toString();
		windowState.setWindowMaximizeState(false);
	});

	maximizeBtn.addEventListener("click", () => {
		if (windowState.isWindowMaximize()) window.rendererToMain.requestUnmaximizeWindow();
		else window.rendererToMain.requestMaximizeWindow();
	});
	document.getElementById("minimizeWindow")!.addEventListener("click", () => {
		window.rendererToMain.requestMinimizeWindow();
	});

	if (windowState.isWindowMaximize()) maximizeImg.src = new URL("../assets/icons/unmaximize.png", import.meta.url).toString();
	else maximizeImg.src = new URL("../assets/icons/maximize.png", import.meta.url).toString();
}
