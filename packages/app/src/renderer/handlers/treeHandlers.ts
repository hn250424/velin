import "@milkdown/theme-nord/style.css"
import TreeFacade from "../modules/tree/TreeFacade"
import {
	DATASET_ATTR_TREE_PATH,
	CLASS_FOCUSED,
	CLASS_SELECTED,
	SELECTOR_TREE_NODE,
	SELECTOR_TREE_NODE_WRAPPER,
	CLASS_DEACTIVE,
	SELECTOR_TREE_NODE_CONTAINER,
	CLASS_TREE_DRAG_OVERLAY,
} from "../constants/dom"
import ShortcutRegistry from "../core/ShortcutRegistry"
import FocusManager from "../core/FocusManager"
import CommandManager from "../CommandManager"

export function handleTree(
	commandManager: CommandManager,
	focusManager: FocusManager,
	treeFacade: TreeFacade,
	shortcutRegistry: ShortcutRegistry
) {
	bindTreeClickEvents(commandManager, treeFacade)
	bindTreeContextmenuEvents(treeFacade)
	bindCommandsWithContextmenu(commandManager, treeFacade)
	bindCommandsWithShortcut(commandManager, shortcutRegistry, focusManager, treeFacade)
	bindTreeMenuEvents(commandManager, treeFacade)

	// Drag.
	bindMouseDownEvents(treeFacade)
	bindMouseMoveEvents(treeFacade)
	bindMouseUpEvents(treeFacade, commandManager)
}

function bindMouseDownEvents(treeFacade: TreeFacade) {
	const { treeNodeContainer } = treeFacade.renderer.elements

	treeNodeContainer.addEventListener("mousedown", (e) => {
		let count = treeFacade.getSelectedIndices().length
		if (count === 0) {
			const target = e.target as HTMLElement
			const node = target.closest(SELECTOR_TREE_NODE) as HTMLElement
			if (!node) return

			const path = node.dataset[DATASET_ATTR_TREE_PATH]!
			const idx = treeFacade.getFlattenArrayIndexByPath(path)!
			treeFacade.lastSelectedIndex = idx
			treeFacade.addSelectedIndices(idx)
			count = 1
		}

		treeFacade.setDragTreeCount(count)
		treeFacade.setMouseDown(true)
		treeFacade.setStartPosition(e.clientX, e.clientY)
	})
}

function bindMouseMoveEvents(treeFacade: TreeFacade) {
	document.addEventListener("mousemove", (e: MouseEvent) => {
		if (!treeFacade.isMouseDown()) return

		if (!treeFacade.isDrag()) {
			const dx = Math.abs(e.clientX - treeFacade.getStartPosition_x())
			const dy = Math.abs(e.clientY - treeFacade.getStartPosition_y())
			if (dx > 5 || dy > 5) {
				treeFacade.startDrag()
			} else {
				return
			}
		}

		const div = treeFacade.createGhostBox(treeFacade.getDragTreeCount())
		div.style.left = `${e.clientX + 5}px`
		div.style.top = `${e.clientY + 5}px`

		const target = e.target as HTMLElement
		let wrapper = target.closest(SELECTOR_TREE_NODE_WRAPPER) as HTMLElement
		let isContainer = false

		const previousInsertWrapper = treeFacade.getInsertWrapper()

		if (!wrapper) {
			const _container = target.closest(SELECTOR_TREE_NODE_CONTAINER) as HTMLElement
			if (!_container) {
				if (previousInsertWrapper) previousInsertWrapper.classList.remove(CLASS_TREE_DRAG_OVERLAY)

				treeFacade.setInsertWrapper(null)
				treeFacade.setInsertPath("") // Set falsy empty string as flag since path-based logic must run if mouse up event completes properly.
				return
			}

			wrapper = _container
			isContainer = true
		}

		if (previousInsertWrapper === wrapper) return // Wrapper comparison faster than Path
		if (previousInsertWrapper) previousInsertWrapper.classList.remove(CLASS_TREE_DRAG_OVERLAY)

		let viewModel
		if (!isContainer) {
			const node = wrapper.querySelector(SELECTOR_TREE_NODE) as HTMLElement
			viewModel = treeFacade.getTreeViewModelByPath(node.dataset[DATASET_ATTR_TREE_PATH]!)
		} else {
			viewModel = treeFacade.getTreeViewModelByPath(wrapper.dataset[DATASET_ATTR_TREE_PATH]!)
		}

		if (!viewModel || !viewModel.directory) {
			treeFacade.setInsertWrapper(null)
			treeFacade.setInsertPath("")
			return
		}
		treeFacade.setInsertPath(viewModel.path)

		wrapper.classList.add(CLASS_TREE_DRAG_OVERLAY)
		treeFacade.setInsertWrapper(wrapper)
	})
}

function bindMouseUpEvents(treeFacade: TreeFacade, commandManager: CommandManager) {
	document.addEventListener("mouseup", async (e: MouseEvent) => {
		if (!treeFacade.isDrag()) {
			treeFacade.setMouseDown(false)
			return
		}

		let isRight = true

		const path = treeFacade.getInsertPath()
		if (path === "") isRight = false

		treeFacade.endDrag()
		treeFacade.removeGhostBox()

		if (isRight) {
			treeFacade.setSelectedDragIndexByPath(path)
			await commandManager.performCut("drag")
			await commandManager.performPaste("drag")
		}
	})
}

function bindTreeMenuEvents(commandManager: CommandManager, treeFacade: TreeFacade) {
	const { treeNodeContainer, treeTopAddFile, treeTopAddDirectory } = treeFacade.renderer.elements

	treeTopAddFile.addEventListener("click", () => {
		commandManager.performCreate("element", treeNodeContainer, false)
	})

	treeTopAddDirectory.addEventListener("click", () => {
		commandManager.performCreate("element", treeNodeContainer, true)
	})
}

function bindTreeClickEvents(commandManager: CommandManager, treeFacade: TreeFacade) {
	const { treeNodeContainer } = treeFacade.renderer.elements

	treeNodeContainer.addEventListener("click", async (e) => {
		if (treeFacade.lastSelectedIndex > 0) {
			const _idx = treeFacade.lastSelectedIndex
			const _treeNode = treeFacade.getTreeNodeByIndex(_idx)
			_treeNode.classList.remove(CLASS_FOCUSED)
		}

		const target = e.target as HTMLElement
		const treeNode = target.closest(SELECTOR_TREE_NODE) as HTMLElement

		if (!treeNode) {
			const isTreeNodeContainer = target.closest(SELECTOR_TREE_NODE_CONTAINER) as HTMLElement

			if (isTreeNodeContainer) {
				treeFacade.clearTreeSelected()
				treeNodeContainer.classList.add(CLASS_FOCUSED)
				treeFacade.lastSelectedIndex = 0
			}

			return
		}

		treeNodeContainer.classList.remove(CLASS_FOCUSED)

		treeNode.classList.add(CLASS_FOCUSED)
		const path = treeNode.dataset[DATASET_ATTR_TREE_PATH]!

		if (e.shiftKey && treeFacade.lastSelectedIndex > 0) {
			const startIndex = treeFacade.lastSelectedIndex!
			const endIndex = treeFacade.getFlattenArrayIndexByPath(path)!
			treeFacade.setLastSelectedIndexByPath(path)
			const [start, end] = [startIndex, endIndex].sort((a, b) => a - b)

			for (let i = start; i <= end; i++) {
				treeFacade.addSelectedIndices(i)
				const div = treeFacade.getTreeNodeByIndex(i)
				div.classList.add(CLASS_SELECTED)
			}
		} else if (e.ctrlKey) {
			treeNode.classList.add(CLASS_SELECTED)
			const index = treeFacade.getFlattenArrayIndexByPath(path)!
			treeFacade.setLastSelectedIndexByPath(path)
			treeFacade.addSelectedIndices(index)
		} else {
			treeFacade.clearTreeSelected()

			const viewModel = treeFacade.getTreeViewModelByPath(path)
			if (viewModel.directory) {
				await commandManager.performOpenDirectory("element", treeNode)
			} else {
				await commandManager.performOpenFile("element", path)
			}

			treeNode.classList.add(CLASS_SELECTED)
			treeFacade.setLastSelectedIndexByPath(path)
			treeFacade.addSelectedIndices(treeFacade.getFlattenArrayIndexByPath(path)!)
		}
	})
}

function bindTreeContextmenuEvents(treeFacade: TreeFacade) {
	const { treeContextMenu, treeContextPaste, treeNodeContainer } = treeFacade.renderer.elements

	treeNodeContainer.addEventListener("contextmenu", (e) => {
		const contextTreeIndex = treeFacade.contextTreeIndex
		if (contextTreeIndex !== -1) {
			const _treeNode = treeFacade.getTreeNodeByIndex(contextTreeIndex)
			_treeNode.classList.remove(CLASS_FOCUSED)
		}

		const treeNode = (e.target as HTMLElement).closest(SELECTOR_TREE_NODE) as HTMLElement
		if (!treeNode) {
			treeFacade.contextTreeIndex = -1
			return
		}

		treeContextMenu.classList.add(CLASS_SELECTED)
		treeContextMenu.style.left = `${e.clientX}px`
		treeContextMenu.style.top = `${e.clientY}px`

		const path = treeNode.dataset[DATASET_ATTR_TREE_PATH]!
		const viewModel = treeFacade.getTreeViewModelByPath(path)

		const isPasteDisabled =
			treeFacade.clipboardMode === "none" || !viewModel.directory || treeFacade.getSelectedIndices().length === 0

		treeContextPaste.classList.toggle(CLASS_DEACTIVE, isPasteDisabled)

		treeFacade.setContextTreeIndexByPath(path)
		treeNode.classList.add(CLASS_FOCUSED)
	})
}

function bindCommandsWithContextmenu(commandManager: CommandManager, treeFacade: TreeFacade) {
	const { treeContextCut, treeContextCopy, treeContextPaste, treeContextRename, treeContextDelete } =
		treeFacade.renderer.elements

	treeContextCut.addEventListener("click", async () => {
		await commandManager.performCut("context-menu")
	})

	treeContextCopy.addEventListener("click", async () => {
		await commandManager.performCopy("context-menu")
	})

	treeContextPaste.addEventListener("click", async () => {
		await commandManager.performPaste("context-menu")
	})

	treeContextRename.addEventListener("click", async () => {
		await commandManager.performRename("context-menu")
	})

	treeContextDelete.addEventListener("click", async () => {
		await commandManager.performDelete("context-menu")
	})
}

function bindCommandsWithShortcut(
	commandManager: CommandManager,
	shortcutRegistry: ShortcutRegistry,
	focusManager: FocusManager,
	treeFacade: TreeFacade
) {
	shortcutRegistry.register("ARROWUP", (e: KeyboardEvent) => moveUpFocus(e, focusManager, treeFacade))
	shortcutRegistry.register("ARROWDOWN", (e: KeyboardEvent) => moveDownFocus(e, focusManager, treeFacade))
	shortcutRegistry.register("Shift+ARROWUP", (e: KeyboardEvent) => moveUpFocus(e, focusManager, treeFacade))
	shortcutRegistry.register("Shift+ARROWDOWN", (e: KeyboardEvent) => moveDownFocus(e, focusManager, treeFacade))

	shortcutRegistry.register("Ctrl+X", async (e: KeyboardEvent) => await commandManager.performCut("shortcut"))
	shortcutRegistry.register("Ctrl+C", async (e: KeyboardEvent) => await commandManager.performCopy("shortcut"))
	shortcutRegistry.register("Ctrl+V", async (e: KeyboardEvent) => await commandManager.performPaste("shortcut"))
	shortcutRegistry.register("F2", async (e: KeyboardEvent) => await commandManager.performRename("shortcut"))
	shortcutRegistry.register("DELETE", async (e: KeyboardEvent) => await commandManager.performDelete("shortcut"))
}

function moveUpFocus(e: KeyboardEvent, focusManager: FocusManager, treeFacade: TreeFacade) {
	if (focusManager.getFocus() !== "tree") return

	let lastIdx = treeFacade.lastSelectedIndex
	if (lastIdx <= 0) return

	const preTreeNode = treeFacade.getTreeNodeByIndex(lastIdx)
	preTreeNode.classList.remove(CLASS_FOCUSED)

	lastIdx--
	treeFacade.lastSelectedIndex = lastIdx
	const newTreeNode = treeFacade.getTreeNodeByIndex(lastIdx)
	newTreeNode.classList.add(CLASS_FOCUSED)

	if (e.shiftKey) {
		newTreeNode.classList.add(CLASS_SELECTED)
		treeFacade.addSelectedIndices(lastIdx)
		treeFacade.lastSelectedIndex = lastIdx
	} else {
		treeFacade.clearTreeSelected()
		newTreeNode.classList.add(CLASS_SELECTED)
		treeFacade.addSelectedIndices(lastIdx)
		treeFacade.lastSelectedIndex = lastIdx
	}
}

function moveDownFocus(e: KeyboardEvent, focusManager: FocusManager, treeFacade: TreeFacade) {
	if (focusManager.getFocus() !== "tree") return

	let lastIdx = treeFacade.lastSelectedIndex
	const totalLength = treeFacade.getFlattenTreeArrayLength()
	if (lastIdx >= totalLength) return

	const preTreeNode = treeFacade.getTreeNodeByIndex(lastIdx)
	preTreeNode.classList.remove(CLASS_FOCUSED)

	lastIdx++
	treeFacade.lastSelectedIndex = lastIdx
	const newTreeNode = treeFacade.getTreeNodeByIndex(lastIdx)
	newTreeNode.classList.add(CLASS_FOCUSED)

	if (e.shiftKey) {
		newTreeNode.classList.add(CLASS_SELECTED)
		treeFacade.addSelectedIndices(lastIdx)
		treeFacade.lastSelectedIndex = lastIdx
	} else {
		treeFacade.clearTreeSelected()
		newTreeNode.classList.add(CLASS_SELECTED)
		treeFacade.addSelectedIndices(lastIdx)
		treeFacade.lastSelectedIndex = lastIdx
	}
}
