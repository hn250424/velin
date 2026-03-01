import "@milkdown/theme-nord/style.css"
import { TreeFacade } from "../modules"
import { DOM, CUSTOM_EVENTS } from "../constants"
import { FocusManager, ShortcutRegistry } from "../core"
import { Dispatcher } from "@renderer/dispatch"
import { EventEmitter } from "events"
import { throttle } from "@renderer/utils"

export function handleTree(
	dispatcher: Dispatcher,
	emitter: EventEmitter,
	focusManager: FocusManager,
	treeFacade: TreeFacade,
	shortcutRegistry: ShortcutRegistry
) {
	bindTreeTopMenuEvents(dispatcher, treeFacade)

	bindTreeClickEvents(dispatcher, emitter, treeFacade)

	bindTreeContextmenuToggleEvents(treeFacade)
	bindTreeContextmenuClickEvents(dispatcher, treeFacade)

	bindShortcutEvents(dispatcher, shortcutRegistry, focusManager, treeFacade)

	bindMouseDownEventsForDrag(treeFacade)
	bindMouseMoveEventsForDrag(treeFacade)
	bindMouseUpEventsForDrag(dispatcher, treeFacade)
	bindMouseLeaveEventsForDrag(treeFacade)
}

//

function bindTreeTopMenuEvents(dispatcher: Dispatcher, treeFacade: TreeFacade) {
	const { treeTopAddFile, treeTopAddDirectory } = treeFacade.renderer.elements

	treeTopAddFile.addEventListener("click", async () => {
		await dispatcher.dispatch("create", "element", false)
	})

	treeTopAddDirectory.addEventListener("click", async () => {
		await dispatcher.dispatch("create", "element", true)
	})
}

//

function bindTreeClickEvents(dispatcher: Dispatcher, emitter: EventEmitter, treeFacade: TreeFacade) {
	const { treeNodeContainer } = treeFacade.renderer.elements

	// treeNodeContainer.addEventListener("click", async (e) => {
	emitter.on(CUSTOM_EVENTS.CLICK.IN.TREE_NODE_CONTAINER, async (e: MouseEvent) => {
		const contextIndex = treeFacade.contextTreeIndex
		const lastSelectedIndex = treeFacade.lastSelectedIndex
		if (contextIndex !== -1) treeFacade.blur(contextIndex)
		if (lastSelectedIndex !== -1) treeFacade.blur(lastSelectedIndex)

		const target = e.target as HTMLElement
		const treeNode = target.closest(DOM.SELECTOR_TREE_NODE) as HTMLElement

		if (!treeNode) {
			if (target.closest(DOM.SELECTOR_TREE_NODE_CONTAINER)) {
				treeNodeContainer.classList.add(DOM.CLASS_FOCUSED)
				treeFacade.clearTreeSelected()
				treeFacade.lastSelectedIndex = 0
			}
			return
		}

		treeNodeContainer.classList.remove(DOM.CLASS_FOCUSED)
		treeNode.classList.add(DOM.CLASS_FOCUSED)

		const path = treeNode.dataset[DOM.DATASET_ATTR_TREE_PATH]!

		if (e.shiftKey && treeFacade.lastSelectedIndex > 0) {
			const startIndex = treeFacade.lastSelectedIndex
			const endIndex = treeFacade.getFlattenIndexByPath(path)!
			treeFacade.setLastSelectedIndexByPath(path)
			const [start, end] = [startIndex, endIndex].sort((a, b) => a - b)

			for (let i = start; i <= end; i++) {
				treeFacade.addSelectedIndices(i)
				treeFacade.getTreeNodeByIndex(i).classList.add(DOM.CLASS_SELECTED)
			}
		} else if (e.ctrlKey) {
			treeNode.classList.add(DOM.CLASS_SELECTED)
			const index = treeFacade.getFlattenIndexByPath(path)!
			treeFacade.setLastSelectedIndexByPath(path)
			treeFacade.addSelectedIndices(index)
		} else {
			treeFacade.clearTreeSelected()

			const viewModel = treeFacade.getTreeViewModelByPath(path)
			if (viewModel.directory) {
				await dispatcher.dispatch("openDirectory", "element", treeNode)
			} else {
				await dispatcher.dispatch("openFile", "element", path)
			}

			treeNode.classList.add(DOM.CLASS_SELECTED)
			treeFacade.setLastSelectedIndexByPath(path)
			treeFacade.addSelectedIndices(treeFacade.getFlattenIndexByPath(path)!)
		}
	})
}

//

function bindTreeContextmenuToggleEvents(treeFacade: TreeFacade) {
	const { treeNodeContainer } = treeFacade.renderer.elements

	treeNodeContainer.addEventListener("contextmenu", (e) => {
		const contextIndex = treeFacade.contextTreeIndex
		const lastSelectedIndex = treeFacade.lastSelectedIndex
		if (contextIndex !== -1) treeFacade.blur(contextIndex)
		if (lastSelectedIndex !== -1) treeFacade.blur(lastSelectedIndex)

		const treeNode = (e.target as HTMLElement).closest(DOM.SELECTOR_TREE_NODE) as HTMLElement
		if (!treeNode) {
			treeFacade.contextTreeIndex = -1
			return
		}

		treeNode.classList.add(DOM.CLASS_FOCUSED)
		const path = treeNode.dataset[DOM.DATASET_ATTR_TREE_PATH]!

		treeFacade.setContextTreeIndexByPath(path)
		treeFacade.showContextmenu(treeNode, e.clientX, e.clientY)
	})
}

function bindTreeContextmenuClickEvents(dispatcher: Dispatcher, treeFacade: TreeFacade) {
	const { treeContextCut, treeContextCopy, treeContextPaste, treeContextRename, treeContextDelete } =
		treeFacade.renderer.elements

	treeContextCut.addEventListener("click", async () => {
		await dispatcher.dispatch("cut", "context-menu")
	})

	treeContextCopy.addEventListener("click", async () => {
		await dispatcher.dispatch("copy", "context-menu")
	})

	treeContextPaste.addEventListener("click", async () => {
		await dispatcher.dispatch("paste", "context-menu")
	})

	treeContextRename.addEventListener("click", async () => {
		await dispatcher.dispatch("rename", "context-menu")
	})

	treeContextDelete.addEventListener("click", async () => {
		await dispatcher.dispatch("delete", "context-menu")
	})
}

//

function bindShortcutEvents(
	dispatcher: Dispatcher,
	shortcutRegistry: ShortcutRegistry,
	focusManager: FocusManager,
	treeFacade: TreeFacade
) {
	shortcutRegistry.register("ARROWUP", (e: KeyboardEvent) => moveUpFocus(e, focusManager, treeFacade))
	shortcutRegistry.register("ARROWDOWN", (e: KeyboardEvent) => moveDownFocus(e, focusManager, treeFacade))
	shortcutRegistry.register("Shift+ARROWUP", (e: KeyboardEvent) => moveUpFocus(e, focusManager, treeFacade))
	shortcutRegistry.register("Shift+ARROWDOWN", (e: KeyboardEvent) => moveDownFocus(e, focusManager, treeFacade))

	shortcutRegistry.register("Ctrl+X", async () => await dispatcher.dispatch("cut", "shortcut"))
	shortcutRegistry.register("Ctrl+C", async () => await dispatcher.dispatch("copy", "shortcut"))
	shortcutRegistry.register("Ctrl+V", async () => await dispatcher.dispatch("paste", "shortcut"))
	shortcutRegistry.register("F2", async () => await dispatcher.dispatch("rename", "shortcut"))
	shortcutRegistry.register("DELETE", async () => await dispatcher.dispatch("delete", "shortcut"))
}

//

function moveUpFocus(e: KeyboardEvent, focusManager: FocusManager, treeFacade: TreeFacade) {
	if (focusManager.getFocus() !== "tree") return
	if (treeFacade.lastSelectedIndex <= 0) return
	_moveFocus(e, treeFacade, treeFacade.lastSelectedIndex, -1)
}

function moveDownFocus(e: KeyboardEvent, focusManager: FocusManager, treeFacade: TreeFacade) {
	if (focusManager.getFocus() !== "tree") return
	if (treeFacade.lastSelectedIndex >= treeFacade.flattenTree.length - 1) return
	_moveFocus(e, treeFacade, treeFacade.lastSelectedIndex, 1)
}

function _moveFocus(e: KeyboardEvent, treeFacade: TreeFacade, lastIndex: number, delta: number) {
	const preNode = treeFacade.getTreeNodeByIndex(lastIndex)
	preNode.classList.remove(DOM.CLASS_FOCUSED)

	lastIndex = lastIndex += delta
	treeFacade.lastSelectedIndex = lastIndex

	const newTreeNode = treeFacade.getTreeNodeByIndex(lastIndex)
	newTreeNode.classList.add(DOM.CLASS_FOCUSED)

	if (e.shiftKey) {
		newTreeNode.classList.add(DOM.CLASS_SELECTED)
		treeFacade.addSelectedIndices(lastIndex)
		treeFacade.lastSelectedIndex = lastIndex
	} else {
		treeFacade.clearTreeSelected()
		newTreeNode.classList.add(DOM.CLASS_SELECTED)
		treeFacade.addSelectedIndices(lastIndex)
		treeFacade.lastSelectedIndex = lastIndex
	}
}

//

function bindMouseDownEventsForDrag(treeFacade: TreeFacade) {
	const { treeNodeContainer } = treeFacade.renderer.elements

	treeNodeContainer.addEventListener("mousedown", (e) => {
		let count = treeFacade.getSelectedIndices().length
		if (count === 0) {
			const target = e.target as HTMLElement
			const node = target.closest(DOM.SELECTOR_TREE_NODE) as HTMLElement
			if (!node) return

			const path = node.dataset[DOM.DATASET_ATTR_TREE_PATH]!
			const idx = treeFacade.getFlattenIndexByPath(path)!
			treeFacade.lastSelectedIndex = idx
			treeFacade.addSelectedIndices(idx)
			count = 1
		}

		treeFacade.initDrag(count, e.clientX, e.clientY)
	})
}

function bindMouseMoveEventsForDrag(treeFacade: TreeFacade) {
	const updateOverStatus = throttle((target: HTMLElement) => {
		if (!treeFacade.isDrag()) return
		treeFacade.updateDragOverStatus(target)
	}, 100)

	document.addEventListener("mousemove", (e: MouseEvent) => {
		if (!treeFacade.isMouseDown()) return

		if (!treeFacade.isDrag()) {
			const { x, y } = treeFacade.getStartPosition()
			if (Math.abs(e.clientX - x) > 5 || Math.abs(e.clientY - y) > 5) {
				treeFacade.startDrag()
			} else {
				return
			}
		}

		treeFacade.moveGhost(e.clientX, e.clientY)
		updateOverStatus(e.target as HTMLElement)
	})
}

function bindMouseUpEventsForDrag(dispatcher: Dispatcher, treeFacade: TreeFacade) {
	document.addEventListener("mouseup", async () => {
		if (!treeFacade.isDrag()) {
			treeFacade.setMouseDown(false)
			return
		}

		const dropPath = treeFacade.getInsertPath()
		const canDrop = dropPath !== ""

		treeFacade.clearDrag()

		if (canDrop) {
			treeFacade.setSelectedDragIndexByPath(dropPath)
			await dispatcher.dispatch("cut", "drag")
			await dispatcher.dispatch("paste", "drag")
		}
	})
}

function bindMouseLeaveEventsForDrag(treeFacade: TreeFacade) {
	document.addEventListener("mouseleave", () => {
		if (treeFacade.isDrag()) {
			treeFacade.clearDrag()
		}
	})
}
