import DI_KEYS from "@renderer/constants/di_keys"
import { inject, injectable } from "inversify"
import type WindowStore from "./WindowStore"

import type WindowRenderer from "./WindowRenderer"

@injectable()
export default class WindowFacade {
	constructor(
		@inject(DI_KEYS.WindowStore) public readonly store: WindowStore,
		@inject(DI_KEYS.WindowRenderer) public readonly renderer: WindowRenderer
	) {}

	isWindowMaximize(): boolean {
		return this.store.isWindowMaximize()
	}

	setWindowMaximizeState(state: boolean) {
		this.store.setWindowMaximizeState(state)
	}

	renderMaximizeButtonSvg() {
		this.renderer.renderMaximizeButtonSvg()
	}

	renderUnMaximizeButtonSvg() {
		this.renderer.renderUnMaximizeButtonSvg()
	}
}
