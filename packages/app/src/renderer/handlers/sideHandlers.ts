import type { SideFacade } from "@renderer/modules"

export function handleSide(sideFacade: SideFacade) {
	const { side, tree, resizer } = sideFacade.elements

	let isDragging = false
	let animationFrameId: number | null = null

	const minWidth = 100
	const maxWidth = 500

	resizer.addEventListener("mousedown", (e) => {
		if (!sideFacade.isSideOpen()) return
		isDragging = true
		document.body.style.cursor = "ew-resize"
		document.body.style.userSelect = "none"
	})

	document.addEventListener("mousemove", (e) => {
		if (!isDragging) return

		if (animationFrameId) cancelAnimationFrame(animationFrameId)

		animationFrameId = requestAnimationFrame(() => {
			const sideRect = side.getBoundingClientRect()
			const offsetX = e.clientX - sideRect.left
			const newWidth = Math.min(Math.max(offsetX, minWidth), maxWidth)
			tree.style.width = `${newWidth}px`
		})
	})

	document.addEventListener("mouseup", async (e) => {
		if (!isDragging) return

		isDragging = false
		document.body.style.cursor = ""
		document.body.style.userSelect = ""

		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId)
			animationFrameId = null
		}

		const sideRect = side.getBoundingClientRect()
		const offsetX = e.clientX - sideRect.left
		const newWidth = Math.min(Math.max(offsetX, minWidth), maxWidth)

		sideFacade.setSideWidth(newWidth)
		sideFacade.syncSession()
	})
}
