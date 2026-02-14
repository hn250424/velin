import DI_KEYS from "@renderer/constants/di_keys"
import { inject, injectable } from "inversify"
import type WindowState from "./WindowState"
import type WindowElements from "./WindowElements"

@injectable()
export default class WindowFacade {
	constructor(
		@inject(DI_KEYS.WindowState) public readonly state: WindowState,
		@inject(DI_KEYS.WindowElements) public readonly elements: WindowElements
	) {}

	isWindowMaximize(): boolean {
		return this.state.isWindowMaximize()
	}

	setWindowMaximizeState(state: boolean) {
		this.state.setWindowMaximizeState(state)
	}

	setMaximizeButtonSvg(svg: string) {
		this.elements.maximizeBtn.querySelector("svg")!.outerHTML = svg
	}
}
