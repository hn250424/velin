import { CUSTOM_EVENTS } from "@renderer/constants"
import type { SideFacade } from "@renderer/modules"
import { EventEmitter } from "events"

export function handleSide(emitter: EventEmitter, sideFacade: SideFacade) {
	const { resizer } = sideFacade.renderer.elements

	resizer.addEventListener("mousedown", (e) => {
		if (!sideFacade.isSideOpen()) return
		sideFacade.initDrag()
	})

	emitter.on(CUSTOM_EVENTS.DRAG.MOUSE_MOVE, (e) => {
		if (!sideFacade.isDragging()) return

		const width = sideFacade.calculateWidth(e.clientX)
		sideFacade.updateSideWidth(width)
	})

	emitter.on(CUSTOM_EVENTS.DRAG.MOUSE_UP, (e) => {
		if (!sideFacade.isDragging()) return

		sideFacade.clearDrag()

		const width = sideFacade.calculateWidth(e.clientX)
		sideFacade.setSideWidth(width)
		sideFacade.syncSession()
	})

	emitter.on(CUSTOM_EVENTS.DRAG.MOUSE_LEAVE, (e) => {
		if (!sideFacade.isDragging()) return
		sideFacade.clearDrag()
	})
}
