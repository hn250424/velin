import type ICommand from "./commands/ICommand";

import type Response from "@shared/types/Response";
import type { TreeViewModel } from "./viewmodels/TreeViewModel";

import type { TreeDto } from "@shared/dto/TreeDto";
import type { TabEditorDto } from "@shared/dto/TabEditorDto";
import type { SettingsViewModel } from "./viewmodels/SettingsViewModel";

import { inject, injectable } from "inversify";

import DI_KEYS from "./constants/di_keys";
import folderSvg from "./assets/icons/folder.svg?raw";
import openedFolderSvg from "./assets/icons/opened_folder.svg?raw";

import FocusManager from "./modules/state/FocusManager";

import TabEditorFacade from "./modules/tab_editor/TabEditorFacade";
import TreeFacade from "./modules/tree/TreeFacade";
import SettingsFacade from "./modules/settings/SettingsFacade";

import RenameCommand from "./commands/RenameCommand";
import DeleteCommand from "./commands/DeleteCommand";
import PasteCommand from "./commands/PasteCommand";
import CreateCommand from "./commands/CreateCommand";

import { debounce } from "./utils/debounce";
import { sleep } from "./utils/sleep";

import {
	CLASS_EXPANDED,
	CLASS_TREE_NODE_CHILDREN,
	CLASS_TREE_NODE_TEXT,
	SELECTOR_TREE_NODE_TEXT,
	DATASET_ATTR_TREE_PATH,
	CLASS_TREE_NODE_INPUT,
	CLASS_SELECTED,
	CLASS_CUT,
	ID_HELP_INFO_OVERLAY,
	SELECTOR_TREE_NODE_TYPE,
	CLASS_FOCUSED,
} from "./constants/dom";

type CommandSource = "shortcut" | "menu" | "element" | "context_menu" | "drag" | "programmatic" | "button";

/**
 * CommandManager centrally manages and executes commands that involve side effects,
 * state changes, or require Undo/Redo support.
 *
 * - Commands triggered via multiple UI input sources (keyboard shortcuts, menus, etc.)
 *   should go through this dispatcher for consistent handling.
 *
 * - Even commands from a single source (e.g., click only) may be dispatched here if they
 *   require Undo/Redo support or are part of a centralized command flow.
 *
 * - Local UI-only operations without side effects can remain in their event handlers.
 */
@injectable()
export default class CommandManager {
	private undoStack: ICommand[] = [];
	private redoStack: ICommand[] = [];

	private helpInfoOverlay: HTMLElement;

	constructor(
		@inject(DI_KEYS.FocusManager) private readonly focusManager: FocusManager,
		@inject(DI_KEYS.SettingsFacade) private readonly settingsFacade: SettingsFacade,
		@inject(DI_KEYS.TabEditorFacade) private readonly tabEditorFacade: TabEditorFacade,
		@inject(DI_KEYS.TreeFacade) private readonly treeFacade: TreeFacade
	) {
		this.helpInfoOverlay = document.getElementById(ID_HELP_INFO_OVERLAY) as HTMLElement;

		this.tabEditorFacade.findInput.addEventListener(
			"input",
			debounce(() => {
				this.performFind("programmatic", this.tabEditorFacade.findDirection);
			}, 300)
		);
	}

	async performNewTab(source: CommandSource) {
		const response: Response<number> = await window.rendererToMain.newTab();
		if (response.result) await this.tabEditorFacade.addTab(response.data);
	}

	async performOpenFile(source: CommandSource, filePath?: string) {
		if (filePath) {
			const tabEditorView = this.tabEditorFacade.getTabEditorViewByPath(filePath);
			if (tabEditorView) {
				this.tabEditorFacade.activateTabEditorById(tabEditorView.getId());
				return;
			}
		}

		const response: Response<TabEditorDto> = await window.rendererToMain.openFile(filePath);
		if (response.result && response.data) {
			const data = response.data;
			await this.tabEditorFacade.addTab(data.id, data.filePath, data.fileName, data.content, data.isBinary);
		}
	}

	/**
	 * Opens or expands a directory in the file tree.
	 *
	 * - If `treeDiv` is not provided, it is assumed that the user is opening a new root directory
	 *   via menu or shortcut, so the tree is initialized by loading that directory.
	 *
	 * - If `treeDiv` is provided, it represents a clicked directory node,
	 *   and this function dynamically loads and expands its child nodes.
	 *
	 * @param treeFacade
	 * @param treeDiv The DOM element of the clicked directory node if omitted, a new root directory is opened
	 * @returns Promise<void>
	 */
	async performOpenDirectory(source: CommandSource, treeDiv?: HTMLElement) {
		// New open when shortcut or file menu.
		if (!treeDiv) {
			const openDirectoryResponse: Response<TreeDto> = await window.rendererToMain.openDirectory();
			if (!openDirectoryResponse.data) return;

			// Close existing tab.
			const tabEditorsDto = this.tabEditorFacade.getAllTabEditorData();
			const closeAllTabsResponse = await window.rendererToMain.closeAllTabs(tabEditorsDto);
			if (closeAllTabsResponse.result) this.tabEditorFacade.removeAllTabs(closeAllTabsResponse.data);

			const responseViewModel = this.treeFacade.toTreeViewModel(openDirectoryResponse.data);
			this.treeFacade.renderTreeData(responseViewModel);
			this.treeFacade.loadFlattenArrayAndMaps(responseViewModel);

			return;
		}

		// When click directory in tree area.
		const dirPath = treeDiv.dataset[DATASET_ATTR_TREE_PATH]!;
		const viewModel = this.treeFacade.getTreeViewModelByPath(dirPath);
		const maybeChildren = treeDiv.nextElementSibling;
		if (!maybeChildren || !maybeChildren.classList.contains(CLASS_TREE_NODE_CHILDREN)) return;

		const nodeType = treeDiv.querySelector(SELECTOR_TREE_NODE_TYPE) as HTMLElement;
		const treeDivChildren = maybeChildren as HTMLElement;

		if (viewModel.expanded) {
			this._updateUI(nodeType, treeDivChildren, viewModel, false);
			this._syncFlattenTreeArray(viewModel, false);
			return;
		}

		if (viewModel.children && viewModel.children.length > 0) {
			if (treeDivChildren.children.length === 0) {
				this.treeFacade.renderTreeData(viewModel, treeDivChildren);
			}
			this._updateUI(nodeType, treeDivChildren, viewModel, true);
			this._syncFlattenTreeArray(viewModel, true);
			return;
		}

		const response: Response<TreeDto> = await window.rendererToMain.openDirectory(viewModel);
		if (!response.data) return;

		const responseTreeData = this.treeFacade.toTreeViewModel(response.data);

		viewModel.children = responseTreeData.children;
		this.treeFacade.renderTreeData(responseTreeData, treeDivChildren);
		this._updateUI(nodeType, treeDivChildren, viewModel, true);
		this._syncFlattenTreeArray(viewModel, true);
	}

	private _updateUI(nodeType: HTMLElement, children: HTMLElement, viewModel: TreeViewModel, expanded: boolean) {
		viewModel.expanded = expanded;

		nodeType.innerHTML = expanded ? openedFolderSvg : folderSvg;

		if (expanded) children.classList.add(CLASS_EXPANDED);
		else children.classList.remove(CLASS_EXPANDED);
	}

	private _syncFlattenTreeArray(viewModel: TreeViewModel, expanded: boolean) {
		if (expanded) this.treeFacade.expandNode(viewModel);
		else this.treeFacade.collapseNode(viewModel);
	}

	async performSave(source: CommandSource) {
		const data = this.tabEditorFacade.getActiveTabEditorData();
		if (!data.isModified) return;
		const response: Response<TabEditorDto> = await window.rendererToMain.save(data);
		if (response.result && !response.data.isModified) this.tabEditorFacade.applySaveResult(response.data);
	}

	async performSaveAs(source: CommandSource) {
		const data: TabEditorDto = this.tabEditorFacade.getActiveTabEditorData();
		const response: Response<TabEditorDto> = await window.rendererToMain.saveAs(data);
		if (response.result && response.data) {
			const wasApplied = this.tabEditorFacade.applySaveResult(response.data);
			if (!wasApplied) {
				await this.tabEditorFacade.addTab(
					response.data.id,
					response.data.filePath,
					response.data.fileName,
					response.data.content,
					response.data.isBinary,
					true
				);
			}
		}
	}

	async performCloseTab(source: CommandSource, id: number) {
		const data = this.tabEditorFacade.getTabEditorDataById(id);
		if (!data) return;

		const response: Response<void> = await window.rendererToMain.closeTab(data);
		if (response.result) this.tabEditorFacade.removeTab(data.id);

		if (this.tabEditorFacade.activeTabId === -1) this.performCloseFindReplaceBox("programmatic");
	}

	async performUndo(source: CommandSource) {
		const focus = this.focusManager.getFocus();

		if (focus === "editor" && source === "shortcut") return;

		if (focus === "editor") {
			this.tabEditorFacade.undo();
			return;
		}

		if (focus === "tree") {
			try {
				window.rendererToMain.setWatchSkipState(true);
				const cmd = this.undoStack.pop();
				if (!cmd) return;
				await cmd.undo();
				this.redoStack.push(cmd);
			} catch (err) {
				// Undo failed (e.g., parent copied into child, or src/dest no longer exists).
				// OS/File system may have ignored the operation; we just skip it to avoid breaking the stack.
			} finally {
				await sleep(300);
				window.rendererToMain.setWatchSkipState(false);
			}

			return;
		}
	}

	async performRedo(source: CommandSource) {
		const focus = this.focusManager.getFocus();

		if (focus === "editor" && source === "shortcut") return;

		if (focus === "editor") {
			this.tabEditorFacade.redo();
			return;
		}

		if (focus === "tree") {
			try {
				window.rendererToMain.setWatchSkipState(true);
				const cmd = this.redoStack.pop();
				if (!cmd) return;
				await cmd.execute();
				this.undoStack.push(cmd);
			} catch (err) {
				// intentionally empty
			} finally {
				await sleep(300);
				window.rendererToMain.setWatchSkipState(false);
			}

			return;
		}
	}

	async performCut(source: CommandSource) {
		const focus = this.focusManager.getFocus();

		if (focus === "editor") {
			if (source !== "shortcut") {
				const sel = window.getSelection();
				const selectedText = sel?.toString();
				if (!sel || !selectedText) return;

				await window.rendererToMain.cutEditor(selectedText);
				sel.deleteFromDocument();
			}

			const view = this.tabEditorFacade.getActiveTabEditorView();
			view.markAsModified();

			return;
		}

		if (focus === "tree") {
			this.treeFacade.clearClipboardPaths();
			this.treeFacade.clipboardMode = "cut";
			const selectedIndices = this.treeFacade.getSelectedIndices();

			for (const idx of selectedIndices) {
				this.treeFacade.getTreeWrapperByIndex(idx)!.classList.add(CLASS_CUT);
				this.treeFacade.addClipboardPaths(this.treeFacade.getTreeViewModelByIndex(idx).path);
				const viewModel = this.treeFacade.getTreeViewModelByIndex(idx);

				if (viewModel.directory) {
					for (let i = idx + 1; i < this.treeFacade.getFlattenTreeArrayLength(); i++) {
						const isChildViewModel = this.treeFacade.getTreeViewModelByIndex(i);

						if (viewModel.indent < isChildViewModel.indent) {
							// note: We skip adding CLASS_CUT to children, as parent visually affects them
							// this.treeFacade.getTreeWrapperByIndex(i).classList.add(CLASS_CUT)
							this.treeFacade.addClipboardPaths(this.treeFacade.getTreeViewModelByIndex(idx).path);
							continue;
						}

						break;
					}
				}
			}

			return;
		}
	}

	async performCopy(source: CommandSource) {
		const focus = this.focusManager.getFocus();

		if (focus === "editor" && source === "shortcut") return;

		if (focus === "editor") {
			const sel = window.getSelection();
			const selectedText = window.getSelection()?.toString();
			if (!sel || !selectedText) return;

			await window.rendererToMain.copyEditor(selectedText);

			return;
		}

		if (focus === "tree") {
			this.treeFacade.clearClipboardPaths();
			this.treeFacade.clipboardMode = "copy";
			const selectedIndices = this.treeFacade.getSelectedIndices();

			for (const idx of selectedIndices) {
				this.treeFacade.addClipboardPaths(this.treeFacade.getTreeViewModelByIndex(idx).path);
				const viewModel = this.treeFacade.getTreeViewModelByIndex(idx);

				if (viewModel.directory) {
					for (let i = idx + 1; i < this.treeFacade.getFlattenTreeArrayLength(); i++) {
						const isChildViewModel = this.treeFacade.getTreeViewModelByIndex(i);

						if (viewModel.indent < isChildViewModel.indent) {
							this.treeFacade.addClipboardPaths(this.treeFacade.getTreeViewModelByIndex(idx).path);
							continue;
						}

						break;
					}
				}
			}

			return;
		}
	}

	async performPaste(source: CommandSource) {
		const focus = this.focusManager.getFocus();

		if (focus === "editor") {
			if (source !== "shortcut") {
				const editable = document.querySelector('#editor_container [contenteditable="true"]') as HTMLElement;
				if (!editable) return;
				editable.focus();

				const sel = window.getSelection();
				if (!sel || !sel.rangeCount) return;
				sel.deleteFromDocument();

				const text = await window.rendererToMain.pasteEditor();
				const textNode = document.createTextNode(text);
				const range = sel.getRangeAt(0);
				range.insertNode(textNode);
				range.setStartAfter(textNode);
				// Defensive code to ensure cursor positioning
				range.collapse(true);
				sel.removeAllRanges();
				sel.addRange(range);
			}

			const view = this.tabEditorFacade.getActiveTabEditorView();
			view.markAsModified();

			return;
		}

		if (focus === "tree") {
			let targetIndex;
			if (source === "context_menu") targetIndex = this.treeFacade.contextTreeIndex;
			else if (source === "shortcut") targetIndex = this.treeFacade.lastSelectedIndex;
			else if (source === "drag") targetIndex = this.treeFacade.selectedDragIndex;

			if (targetIndex === -1) return;

			let targetViewModel = this.treeFacade.getTreeViewModelByIndex(targetIndex!);
			if (!targetViewModel.directory) {
				targetIndex = this.treeFacade.findParentDirectoryIndex(targetIndex!);
				targetViewModel = this.treeFacade.getTreeViewModelByIndex(targetIndex);
			}

			const selectedViewModels = [];
			const clipboardPaths = this.treeFacade.getClipboardPaths() ?? [];

			for (const path of clipboardPaths) {
				selectedViewModels.push(this.treeFacade.getTreeViewModelByPath(path));
			}

			const cmd = new PasteCommand(
				this.treeFacade,
				this.tabEditorFacade,
				targetViewModel,
				selectedViewModels,
				this.treeFacade.clipboardMode
			);

			try {
				window.rendererToMain.setWatchSkipState(true);
				await cmd.execute();
				this.undoStack.push(cmd);
				this.redoStack.length = 0;
			} catch {
				// intentionally empty
			} finally {
				await sleep(300);
				window.rendererToMain.setWatchSkipState(false);
			}

			return;
		}
	}

	async performRename(source: CommandSource) {
		const focus = this.focusManager.getFocus();
		if (focus !== "tree") return;

		const lastSelectedIndex = this.treeFacade.lastSelectedIndex;
		const treeNode = this.treeFacade.getTreeNodeByIndex(lastSelectedIndex);
		const treeSpan = treeNode.querySelector(SELECTOR_TREE_NODE_TEXT);
		if (!treeSpan) return;

		const treeInput = document.createElement("input");
		treeInput.type = "text";
		treeInput.value = treeSpan.textContent ?? "";
		treeInput.classList.add(CLASS_TREE_NODE_INPUT);

		treeNode.classList.remove(CLASS_FOCUSED);
		treeNode.replaceChild(treeInput, treeSpan);
		treeInput.focus();

		// Except ext name.
		const fileName = treeInput.value;
		const lastDotIndex = fileName.lastIndexOf(".");
		if (lastDotIndex > 0) {
			treeInput.setSelectionRange(0, lastDotIndex);
		} else {
			treeInput.select();
		}

		let alreadyFinished = false;

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Enter") finishRename();
			else if (e.key === "Escape") cancelRename();
		};
		const onBlur = () => finishRename();

		treeInput.addEventListener("keydown", onKeyDown);
		treeInput.addEventListener("blur", onBlur);

		const finishRename = async () => {
			if (alreadyFinished) return;
			alreadyFinished = true;

			treeInput.removeEventListener("keydown", onKeyDown);
			treeInput.removeEventListener("blur", onBlur);

			const prePath = treeNode.dataset[DATASET_ATTR_TREE_PATH]!;
			const newName = treeInput.value.trim();
			const dir = window.utils.getDirName(prePath);
			const newPath = window.utils.getJoinedPath(dir, newName);

			// Skip unique name generation for unchanged rename (unlike create or paste)
			if (prePath === newPath) {
				const restoreSpan = document.createElement("span");
				restoreSpan.classList.add(CLASS_TREE_NODE_TEXT, "ellipsis");
				restoreSpan.textContent = window.utils.getBaseName(newPath);
				treeNode.replaceChild(restoreSpan, treeInput);
				return;
			}

			const viewModel = this.treeFacade.getTreeViewModelByPath(treeNode.dataset[DATASET_ATTR_TREE_PATH]!);

			const cmd = new RenameCommand(
				this.treeFacade,
				this.tabEditorFacade,
				treeNode,
				viewModel.directory,
				prePath,
				newPath
			);

			try {
				window.rendererToMain.setWatchSkipState(true);
				await cmd.execute();
				this.undoStack.push(cmd);
				this.redoStack.length = 0;
			} catch {
				treeNode.replaceChild(treeSpan, treeInput);
			} finally {
				await sleep(300);
				window.rendererToMain.setWatchSkipState(false);
			}
		};

		const cancelRename = () => {
			if (alreadyFinished) return;
			alreadyFinished = true;

			treeInput.removeEventListener("keydown", onKeyDown);
			treeInput.removeEventListener("blur", onBlur);

			treeNode.replaceChild(treeSpan, treeInput);
		};
	}

	async performDelete(source: CommandSource) {
		const focus = this.focusManager.getFocus();
		if (focus !== "tree") return;

		const selectedIndices = this.treeFacade.getSelectedIndices();

		const cmd = new DeleteCommand(this.treeFacade, this.tabEditorFacade, selectedIndices);

		try {
			await window.rendererToMain.setWatchSkipState(true);
			await cmd.execute();
			this.undoStack.push(cmd);
			this.redoStack.length = 0;
		} catch {
			// intentionally empty
		} finally {
			await sleep(300);
			window.rendererToMain.setWatchSkipState(false);
		}
	}

	async performCreate(source: CommandSource, treeNodeContainer: HTMLElement, directory: boolean) {
		let idx = Math.max(this.treeFacade.lastSelectedIndex, 0);
		let viewModel = this.treeFacade.getTreeViewModelByIndex(idx);

		if (!viewModel.directory) {
			idx = this.treeFacade.findParentDirectoryIndex(idx);
			viewModel = this.treeFacade.getTreeViewModelByIndex(idx);
		} else {
			if (!viewModel.expanded) await this.performOpenDirectory("programmatic", this.treeFacade.getTreeNodeByIndex(idx));
		}

		let parentContainer: HTMLElement;
		if (idx === 0) {
			parentContainer = treeNodeContainer;
		} else {
			const parentWrapper = this.treeFacade.getTreeWrapperByIndex(idx)!;
			parentContainer = parentWrapper.querySelector(".tree_node_children") as HTMLElement;
		}

		const { wrapper, input } = this.treeFacade.createInputbox(directory, viewModel.indent);
		parentContainer.appendChild(wrapper);
		input.focus();

		let alreadyFinished = false;

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Enter") finalize();
			else if (e.key === "Escape") cancel();
		};
		const onBlur = () => finalize();

		input.addEventListener("keydown", onKeyDown);
		input.addEventListener("blur", onBlur);

		const finalize = async () => {
			if (alreadyFinished) return;
			alreadyFinished = true;

			input.removeEventListener("keydown", onKeyDown);
			input.removeEventListener("blur", onBlur);

			wrapper.remove();

			const name = input.value.trim();
			if (name) {
				const cmd = new CreateCommand(this.treeFacade, this.tabEditorFacade, viewModel.path, name, directory);

				try {
					window.rendererToMain.setWatchSkipState(true);
					await cmd.execute();
					this.undoStack.push(cmd);
					this.redoStack.length = 0;

					this.treeFacade.clearTreeSelected();

					const filePath = window.utils.getJoinedPath(viewModel.path, name);

					const createdIdx = this.treeFacade.getFlattenArrayIndexByPath(filePath)!;
					this.treeFacade.addSelectedIndices(createdIdx);
					this.treeFacade.lastSelectedIndex = createdIdx;

					const createdNode = this.treeFacade.getTreeNodeByIndex(createdIdx);
					createdNode.classList.add(CLASS_FOCUSED);
					createdNode.classList.add(CLASS_SELECTED);

					if (!directory) {
						await this.performOpenFile("programmatic", filePath);
						const createdTabView = this.tabEditorFacade.getTabEditorViewByPath(filePath)!;
						cmd.setOpenedTabId(createdTabView.getId());
					}
				} catch (error) {
					// intentionally empty
				} finally {
					await sleep(300);
					window.rendererToMain.setWatchSkipState(false);
				}
			}
		};

		const cancel = () => {
			if (alreadyFinished) return;
			alreadyFinished = true;

			input.removeEventListener("keydown", onKeyDown);
			input.removeEventListener("blur", onBlur);
			wrapper.remove();
		};
	}

	toggleFindReplaceBox(source: CommandSource, showReplace: boolean) {
		if (this.tabEditorFacade.activeTabId === -1) return;

		this.focusManager.setFocus("find_replace");

		this.tabEditorFacade.findAndReplaceContainer.style.display = "flex";
		this.tabEditorFacade.replaceBox.style.display = showReplace ? "flex" : "none";
		this.tabEditorFacade.findReplaceOpen = true;

		if (showReplace) this.tabEditorFacade.replaceInput.focus();
		else this.tabEditorFacade.findInput.focus();

		this.performFind("programmatic", this.tabEditorFacade.findDirection);
	}

	performFind(source: CommandSource, direction: "up" | "down") {
		this.tabEditorFacade.findAndSelect(direction);
	}

	performReplace(source: CommandSource) {
		const findInput = this.tabEditorFacade.findInput.value;
		const replaceInput = this.tabEditorFacade.replaceInput.value;
		const view = this.tabEditorFacade.getActiveTabEditorView();

		const replaced = view.replaceCurrent(findInput, replaceInput);
		if (!replaced) return;

		this.tabEditorFacade.findAndSelect();
	}

	performReplaceAll(source: CommandSource) {
		const focus = this.focusManager.getFocus();
		if (focus !== "find_replace") return;

		const findInput = this.tabEditorFacade.findInput.value;
		const replaceInput = this.tabEditorFacade.replaceInput.value;

		const view = this.tabEditorFacade.getActiveTabEditorView();
		view.replaceAll(findInput, replaceInput);
	}

	performCloseFindReplaceBox(source: CommandSource) {
		this.focusManager.setFocus(null);
		this.tabEditorFacade.findAndReplaceContainer.style.display = "none";

		const activeView = this.tabEditorFacade.getActiveTabEditorView();
		if (activeView) activeView.clearSearch();

		this.tabEditorFacade.findReplaceOpen = false;
	}

	performOpenSettings(source: CommandSource) {
		this.settingsFacade.openSettings();
	}

	async performApplySettings(source: CommandSource, viewModel: SettingsViewModel) {
		const font = viewModel.settingFontViewModel;

		font.size && this.tabEditorFacade.changeFontSize(font.size);
		font.family && this.tabEditorFacade.changeFontFamily(font.family);

		this.settingsFacade.applyChangeSet();

		if (source === "button") {
			const settingsDto = this.settingsFacade.toSettingsDto(this.settingsFacade.getDraftSettings());
			await window.rendererToMain.syncSettingsSessionFromRenderer(settingsDto);
		}
	}

	performCloseSettings(source: CommandSource) {
		this.settingsFacade.resetChangeSet();
		this.settingsFacade.closeSettings();
	}

	performShowInformation(source: CommandSource) {
		this.helpInfoOverlay.style.display = "flex";
	}

	performHideInformation(source: CommandSource) {
		this.helpInfoOverlay.style.display = "none";
	}

	async performESC(source: CommandSource) {
		const focus = this.focusManager.getFocus();

		if (focus === "editor" || focus === "find_replace") {
			this.performCloseFindReplaceBox(source);
		}
	}

	async performENTER(e: KeyboardEvent, source: CommandSource) {
		const focus = this.focusManager.getFocus();

		if (focus === "find_replace") {
			const activateElement = document.activeElement;

			if (activateElement === this.tabEditorFacade.findInput) {
				this.performFind(source, this.tabEditorFacade.findDirection);
			} else if (activateElement === this.tabEditorFacade.replaceInput) {
				this.performReplace(source);
			}

			return;
		}

		if (focus === "tree") {
			const idx = Math.max(this.treeFacade.lastSelectedIndex, 0);
			const viewModel = this.treeFacade.getTreeViewModelByIndex(idx);

			if (viewModel.directory) {
				const treeNode = this.treeFacade.getTreeNodeByIndex(idx);
				await this.performOpenDirectory("programmatic", treeNode);
			} else {
				await this.performOpenFile("programmatic", viewModel.path);
			}

			// Re-focus the tree node to reclaim focus lost to the editor during the opening process.
			const treeNode = this.treeFacade.getTreeNodeByIndex(idx);
			treeNode.focus();

			return;
		}
	}
}
