import type { SideDto } from "@shared/dto/SideDto"
import SideState from "../modules/state/SideState"
import { CLASS_SELECTED } from "../constants/dom"

export default function registerSideHandlers(sideState: SideState) {
	let isDragging = false
	let animationFrameId: number | null = null

	const minWidth = 100
	const maxWidth = 500

	const side = document.querySelector("#side") as HTMLElement

	const treeToggle = document.querySelector("#view-menu-file-tree") as HTMLElement
	const tree = document.querySelector("#tree") as HTMLElement
	const resizer = document.querySelector("#side-resizer") as HTMLElement

	const settingsBtn = document.querySelector("#settingsBtn") as HTMLElement

	processTreeOpenState()

	// open & close file tree.
	treeToggle.addEventListener("click", async () => {
		const isOpen = sideState.isTreeOpen()
		sideState.setTreeOpenState(!isOpen)
		syncSession()
		processTreeOpenState()
	})

	function processTreeOpenState() {
		const isOpen = sideState.isTreeOpen()
		if (isOpen) {
			tree.style.width = `${sideState.getTreeWidth()}px`
			treeToggle.classList.add(CLASS_SELECTED)
		} else {
			tree.style.width = "0px"
			treeToggle.classList.remove(CLASS_SELECTED)
		}
	}

	async function syncSession() {
		const sideDto: SideDto = {
			open: sideState.isTreeOpen(),
			width: sideState.getTreeWidth(),
		}
		const result = await window.rendererToMain.syncSideSessionFromRenderer(sideDto)
	}

	// resize.
	resizer.addEventListener("mousedown", (e) => {
		if (!sideState.isTreeOpen()) return

		isDragging = true
		document.body.style.cursor = "ew-resize"
		document.body.style.userSelect = "none"
	})

	document.addEventListener("mousemove", (e) => {
		if (!isDragging) return

		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId)
		}

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

		sideState.setTreeWidth(newWidth)
		syncSession()
	})
}
