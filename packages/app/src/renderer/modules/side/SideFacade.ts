import DI_KEYS from "@renderer/constants/di_keys"
import { inject, injectable } from "inversify"
import type SideStore from "./SideStore"
import type SideElements from "./SideElements"

@injectable()
export default class SideFacade {
	constructor(
		@inject(DI_KEYS.SideStore) public readonly state: SideStore,
		@inject(DI_KEYS.SideElements) public readonly elements: SideElements
	) {}

	//
	async syncSession() {
		await window.rendererToMain.syncSideSessionFromRenderer({
			open: this.isSideOpen(),
			width: this.getSideWidth(),
		})
	}

	//
	isSideOpen(): boolean {
		return this.state.isSideOpen()
	}

	setSideOpenState(state: boolean) {
		this.state.setSideOpenState(state)
	}

	getSideWidth() {
		return this.state.getSideWidth()
	}

	setSideWidth(width: number) {
		this.state.setSideWidth(width)
	}
}
