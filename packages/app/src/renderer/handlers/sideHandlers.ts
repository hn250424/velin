import type SideFacade from "@renderer/modules/side/SideFacade"
import type MenuElements from "@renderer/modules/menu/MenuElements"
import { CLASS_SELECTED } from "@renderer/constants/dom"

export default function registerSideHandlers(sideFacade: SideFacade, menuElements: MenuElements) {
	bindSideToggleEvent(sideFacade, menuElements)
	bindDragEvents(sideFacade)

	processSideOpenState(menuElements, sideFacade)
}

function bindSideToggleEvent(sideFacade: SideFacade, menuElements: MenuElements) {
	const { fileTree } = menuElements

	fileTree.addEventListener("click", () => {
		const isOpen = sideFacade.isSideOpen()
		sideFacade.setSideOpenState(!isOpen)
		sideFacade.syncSession()
		processSideOpenState(menuElements, sideFacade)
	})
}

function bindDragEvents(sideFacade: SideFacade) {
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

function processSideOpenState(menuElements: MenuElements, sideFacade: SideFacade) {
	const { fileTree } = menuElements
	const { tree } = sideFacade.elements

	const isOpen = sideFacade.isSideOpen()

	if (isOpen) {
		tree.style.width = `${sideFacade.getSideWidth()}px`
		fileTree.classList.add(CLASS_SELECTED)
	} else {
		tree.style.width = "0px"
		fileTree.classList.remove(CLASS_SELECTED)
	}
}
