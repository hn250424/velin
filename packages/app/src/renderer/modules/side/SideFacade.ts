import DI_KEYS from "@renderer/constants/di_keys"
import { inject, injectable } from "inversify"
import { SideStore } from "./SideStore"
import { SideRenderer } from "./SideRenderer"
import { SideDragManager } from "./SideDragManager"

@injectable()
export class SideFacade {
	constructor(
		@inject(DI_KEYS.SideStore) public readonly store: SideStore,
		@inject(DI_KEYS.SideRenderer) public readonly renderer: SideRenderer,
		@inject(DI_KEYS.SideDragManager) public readonly drag: SideDragManager
	) {}

	// orchestra

	async syncSession() {
		await window.rendererToMain.syncSideSessionFromRenderer({
			open: this.isSideOpen(),
			width: this.getSideWidth(),
		})
	}

	// store

	isSideOpen(): boolean {
		return this.store.isSideOpen()
	}

	setSideOpenState(state: boolean) {
		this.store.setSideOpenState(state)
	}

	getSideWidth() {
		return this.store.getSideWidth()
	}

	setSideWidth(width: number) {
		this.store.setSideWidth(width)
	}

	// renderer

	updateSideWidth(width: number) {
		this.renderer.updateSideWidth(width)
	}

	// drag

	initDrag() {
		this.startDrag()
		this.renderer.setResizingCursor(true)
	}

	calculateWidth(clientX: number) {
		const sideLeft = this.renderer.elements.side.getBoundingClientRect().left
		const offsetX = clientX - sideLeft
    return Math.min(Math.max(offsetX, this.dragMinWidth), this.dragMaxWidth)
	}

	clearDrag() {
		this.endDrag()
		this.renderer.setResizingCursor(false)
	}

	//

	isDragging(): boolean {
		return this.drag.isDragging()
	}

	startDrag() {
		this.drag.startDrag()
	}

	endDrag() {
		this.drag.endDrag()
	}

	//

	get dragAnimationFrameId() {
		return this.drag.animationFrameId
	}

	set dragAnimationFrameId(id: number | null) {
		this.drag.animationFrameId = id
	}

	get dragMinWidth() {
		return this.drag.minWidth
	}

	get dragMaxWidth() {
		return this.drag.maxWidth
	}
}
