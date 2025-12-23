import TreeDto from "@shared/dto/TreeDto";
import ClipboardMode from "@shared/types/ClipboardMode";
import Response from "@shared/types/Response";
import { inject, injectable } from "inversify";
import DI_KEYS from "../../constants/di_keys";
import { DATASET_ATTR_TREE_PATH, SELECTOR_TREE_NODE } from "../../constants/dom";
import TreeViewModel from "../../viewmodels/TreeViewModel";
import TreeRenderer from "./TreeRenderer";
import TreeStore from "./TreeStore";
import TreeDragManager from "./TreeDragManager";

@injectable()
export default class TreeFacade {
	constructor(
		@inject(DI_KEYS.TreeRenderer) private readonly renderer: TreeRenderer,
		@inject(DI_KEYS.TreeStore) private readonly store: TreeStore,
		@inject(DI_KEYS.TreeDragManager) private readonly drag: TreeDragManager
	) {}

	toTreeDto(viewModel: TreeViewModel): TreeDto {
		return this.store.toTreeDto(viewModel);
	}

	toTreeViewModel(dto: TreeDto): TreeViewModel {
		return this.store.toTreeViewModel(dto);
	}

	extractTreeViewModel(): TreeViewModel | null {
		return this.store.extractTreeViewModel();
	}

	expandNode(node: TreeViewModel) {
		this.store.expandNode(node);
	}

	collapseNode(node: TreeViewModel) {
		this.store.collapseNode(node);
	}

	getFlattenTreeArrayLength(): number {
		return this.store.flattenTreeArray.length;
	}

	getFlattenArrayIndexByPath(path: string) {
		return this.store.getFlattenArrayIndexByPath(path);
	}

	findParentDirectoryIndex(index: number) {
		return this.store.findParentDirectoryIndex(index);
	}

	getTreeViewModelByIndex(index: number) {
		return this.store.getTreeViewModelByIndex(index);
	}

	getTreeViewModelByPath(path: string) {
		return this.store.getTreeViewModelByPath(path);
	}

	isAnyTreeNodeSelected(): boolean {
		return this.store.lastSelectedIndex > 0;
	}

	get lastSelectedIndex() {
		return this.store.lastSelectedIndex;
	}

	set lastSelectedIndex(index: number) {
		this.store.lastSelectedIndex = index;
	}

	setLastSelectedIndexByPath(path: string) {
		this.store.lastSelectedIndex = this.store.getFlattenArrayIndexByPath(path);
	}

	removeLastSelectedIndex() {
		this.store.lastSelectedIndex = -1;
	}

	get contextTreeIndex() {
		return this.store.contextTreeIndex;
	}

	set contextTreeIndex(index: number) {
		this.store.contextTreeIndex = index;
	}

	setContextTreeIndexByPath(path: string) {
		this.store.contextTreeIndex = this.store.getFlattenArrayIndexByPath(path);
	}

	removeContextTreeIndex() {
		this.store.removeContextTreeIndex();
	}

	get selectedDragIndex() {
		return this.store.selectedDragIndex;
	}

	setSelectedDragIndexByPath(path: string) {
		this.store.selectedDragIndex = this.store.getFlattenArrayIndexByPath(path);
	}

	addSelectedIndices(index: number) {
		this.store.addSelectedIndices(index);
	}

	getSelectedIndices(): number[] {
		return this.store.getSelectedIndices();
	}

	clearSelectedIndices() {
		this.store.clearSelectedIndices();
	}

	addClipboardPaths(path: string) {
		this.store.addClipboardPaths(path);
	}

	getClipboardPaths(): string[] {
		return this.store.getClipboardPaths();
	}

	clearClipboardPaths() {
		this.store.clearClipboardPaths();
	}

	get clipboardMode() {
		return this.store.clipboardMode;
	}

	set clipboardMode(mode: ClipboardMode) {
		this.store.clipboardMode = mode;
	}

	clean(container: HTMLElement) {
		this.renderer.clean(container);
	}

	renderTreeData(viewModel: TreeViewModel, container?: HTMLElement) {
		this.renderer.renderTreeData(viewModel, container);
	}

	createInputbox(directory: boolean, indent: number) {
		return this.renderer.createInputbox(directory, indent);
	}

	createGhostBox(count: number) {
		return this.renderer.createGhostBox(count);
	}

	removeGhostBox() {
		this.renderer.removeGhostBox();
	}

	clearPathToTreeWrapperMap() {
		this.renderer.clearPathToTreeWrapperMap();
	}

	getTreeNodeByPath(path: string) {
		return this.renderer.getTreeNodeByPath(path);
	}

	getTreeWrapperByPath(path: string) {
		return this.renderer.getTreeWrapperByPath(path);
	}

	setTreeWrapperByPath(path: string, wrapper: HTMLElement) {
		this.renderer.setTreeWrapperByPath(path, wrapper);
	}

	getTreeWrapperByIndex(index: number) {
		const viewModel = this.store.getTreeViewModelByIndex(index);
		return this.renderer.getTreeWrapperByPath(viewModel.path);
	}

	getTreeNodeByIndex(index: number) {
		const wrapper = this.getTreeWrapperByIndex(index);
		return wrapper.querySelector(SELECTOR_TREE_NODE) as HTMLElement;
	}

	isMouseDown(): boolean {
		return this.drag.isMouseDown();
	}

	setMouseDown(state: boolean) {
		this.drag.setMouseDown(state);
	}

	isDrag(): boolean {
		return this.drag.isDrag();
	}

	startDrag() {
		this.drag.startDrag();
	}

	endDrag() {
		this.drag.endDrag();
	}

	getStartPosition() {
		return this.drag.getStartPosition();
	}

	setStartPosition(x: number, y: number) {
		this.drag.setStartPosition(x, y);
	}

	getStartPosition_x() {
		return this.drag.getStartPosition_x();
	}

	getStartPosition_y() {
		return this.drag.getStartPosition_y();
	}

	getDragTreeCount() {
		return this.drag.getDragTreeCount();
	}

	setDragTreeCount(count: number) {
		this.drag.setDragTreeCount(count);
	}

	getInsertWrapper() {
		return this.drag.getInsertWrapper();
	}

	setInsertWrapper(wrapper: HTMLElement | null) {
		this.drag.setInsertWrapper(wrapper);
	}

	getInsertPath() {
		return this.drag.getInsertPath();
	}

	setInsertPath(path: string) {
		this.drag.setInsertPath(path);
	}

	loadFlattenArrayAndMaps(json: TreeViewModel) {
		const arr = this.store.flattenTree(json);
		this.store.setFlattenTree(arr);
		this.store.rebuildPathToFlattenArrayIndexMap();
	}

	async rename(preBase: string, newBase: string) {
		const response: Response<string> = await window.rendererToMain.rename(preBase, newBase);
		if (!response.result) return response;
		newBase = response.data;

		const start = this.store.getFlattenArrayIndexByPath(preBase);

		for (let i = start; i < this.store.flattenTreeArray.length; i++) {
			const node = this.getTreeViewModelByIndex(i);
			if (node.path.startsWith(preBase)) {
				const treeWrapper = this.renderer.getTreeWrapperByPath(node.path);
				const idx = this.store.getFlattenArrayIndexByPath(node.path);
				const treeNode = this.renderer.getTreeNodeByPath(node.path);
				this.store.deleteFlattenArrayIndexByPath(node.path);
				this.renderer.deleteTreeWrapperByPath(node.path);
				const relative = window.utils.getRelativePath(preBase, node.path);
				const newPath = window.utils.getJoinedPath(newBase, relative);
				node.path = newPath;
				node.name = window.utils.getBaseName(node.path);
				treeNode.dataset[DATASET_ATTR_TREE_PATH] = newPath;
				treeNode.title = newPath;
				this.store.setFlattenArrayIndexByPath(newPath, idx);
				this.renderer.setTreeWrapperByPath(newPath, treeWrapper);
			} else {
				break;
			}
		}

		return response;
	}

	delete(indices: number[]) {
		indices.sort((a, b) => b - a);

		for (const index of indices) {
			const target = this.store.flattenTreeArray[index];
			const baseIndent = target.indent;

			let parentIndex = -1;
			for (let i = index - 1; i >= 0; i--) {
				if (this.store.flattenTreeArray[i].indent === baseIndent - 1) {
					parentIndex = i;
					break;
				}
			}

			const toDelete: TreeViewModel[] = [];

			// Collects the deletion target: Self + all children
			for (let i = index; i < this.store.flattenTreeArray.length; i++) {
				const node = this.store.getTreeViewModelByIndex(i);
				if (i !== index && node.indent <= baseIndent) break;
				toDelete.push(node);
			}

			if (parentIndex >= 0) {
				const parent = this.store.flattenTreeArray[parentIndex];
				if (parent.children) {
					parent.children = parent.children.filter((child) => !toDelete.some((deleted) => deleted.path === child.path));
				}
			}

			for (const node of toDelete) {
				const path = node.path;

				const wrapper = this.renderer.getTreeWrapperByPath(path);
				wrapper?.remove();

				this.renderer.deleteTreeWrapperByPath(path);
			}

			this.store.spliceFlattenTreeArray(index, toDelete.length);
		}

		this.store.rebuildPathToFlattenArrayIndexMap();
	}
}
