import type { SideFacade } from "@renderer/modules"

export function handleSide(sideFacade: SideFacade) {
	const { resizer } = sideFacade.renderer.elements

	resizer.addEventListener("mousedown", (e) => {
		if (!sideFacade.isSideOpen()) return
		sideFacade.initDrag()
	})

	document.addEventListener("mousemove", (e) => {
		if (!sideFacade.isDragging()) return
		if (sideFacade.dragAnimationFrameId) return

		sideFacade.dragAnimationFrameId = requestAnimationFrame(() => {
			const width = sideFacade.calculateWidth(e.clientX)
			sideFacade.updateSideWidth(width)
			sideFacade.dragAnimationFrameId = null
		})
	})

	document.addEventListener("mouseup", async (e) => {
		if (!sideFacade.isDragging()) return

		sideFacade.clearDrag()

		const width = sideFacade.calculateWidth(e.clientX)
		sideFacade.setSideWidth(width)
		sideFacade.syncSession()
	})

	document.addEventListener("mouseleave", async () => {
		if (!sideFacade.isDragging()) return
		sideFacade.clearDrag()
	})
}
