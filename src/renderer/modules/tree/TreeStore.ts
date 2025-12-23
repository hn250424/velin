import { injectable } from "inversify";
import TreeDto from "@shared/dto/TreeDto";
import TreeViewModel from "../../viewmodels/TreeViewModel";
import ClipboardMode from "@shared/types/ClipboardMode";

@injectable()
export default class TreeStore {
	private _flattenTreeArray: TreeViewModel[] = [];
	private _pathToFlattenArrayIndexMap: Map<string, number> = new Map();

	private _contextTreeIndex = -1;
	private _lastSelectedIndex = -1;
	private _selectedDragIndex = -1;

	// Set of user-selected indices (no children included). For just ui.
	private _selectedIndices = new Set<number>();

	// Set of full paths that have been copied (including all nested children).
	// Unlike selectedIndices, this persists even if folders are collapsed.
	// Used during copy/cut commands to track exactly what to paste later.
	// Always resolved at the time of the command (not tied to UI state).
	private _clipboardPaths = new Set<string>();
	private _clipboardMode: ClipboardMode = "none";

	constructor() {
		// intentionally empty.
	}

	toTreeDto(viewModel: TreeViewModel): TreeDto {
		return {
			path: viewModel.path,
			name: viewModel.name,
			indent: viewModel.indent,
			directory: viewModel.directory,
			expanded: viewModel.expanded,
			children: viewModel.children ? viewModel.children.map((child) => this.toTreeDto(child)) : null,
		};
	}

	toTreeViewModel(dto: TreeDto): TreeViewModel {
		return {
			path: dto.path,
			name: dto.name,
			indent: dto.indent,
			directory: dto.directory,
			expanded: dto.expanded,
			selected: false,
			children: dto.children ? dto.children.map((child) => this.toTreeViewModel(child)) : null,
		};
	}

	flattenTree(tree: TreeViewModel): TreeViewModel[] {
		const result: TreeViewModel[] = [];

		function dfs(node: TreeViewModel) {
			result.push(node);
			if (node.children) {
				for (const child of node.children) {
					dfs(child);
				}
			}
		}

		dfs(tree);
		return result;
	}

	extractTreeViewModel(): TreeViewModel | null {
		if (!this._flattenTreeArray || this._flattenTreeArray.length === 0) return null;

		const pathToNode = new Map<string, TreeViewModel>();
		const root = this._flattenTreeArray[0];
		pathToNode.set(root.path, root);

		for (let i = 1; i < this._flattenTreeArray.length; i++) {
			const node = this._flattenTreeArray[i];
			pathToNode.set(node.path, node);
		}

		for (let i = 1; i < this._flattenTreeArray.length; i++) {
			const node = pathToNode.get(this._flattenTreeArray[i].path);

			for (let j = i - 1; j >= 0; j--) {
				const possibleParent = this._flattenTreeArray[j];

				if (possibleParent.indent === node.indent - 1) {
					const parent = pathToNode.get(possibleParent.path);
					if (!parent.children) parent.children = [];
					parent.children.push(node);
					break;
				}
			}
		}

		return root;
	}

	expandNode(node: TreeViewModel) {
		const index = this._flattenTreeArray.findIndex((dto) => dto.path === node.path);
		if (index === -1) return;

		const childrenToInsert = this.flattenTree(node).slice(1); // Remove the first element (the node itself) using slice(1)
		this._flattenTreeArray.splice(index + 1, 0, ...childrenToInsert);

		this.rebuildPathToFlattenArrayIndexMap();
	}

	collapseNode(node: TreeViewModel) {
		const index = this._flattenTreeArray.findIndex((dto) => dto.path === node.path);
		if (index === -1) return;

		let removeCount = 0;
		for (let i = index + 1; i < this._flattenTreeArray.length; i++) {
			if (this._flattenTreeArray[i].indent <= node.indent) break;
			removeCount++;
		}
		this._flattenTreeArray.splice(index + 1, removeCount);

		this.rebuildPathToFlattenArrayIndexMap();
	}

	spliceFlattenTreeArray(start: number, length: number) {
		this._flattenTreeArray.splice(start, length);
	}

	findParentDirectoryIndex(index: number): number {
		const indent = this._flattenTreeArray[index].indent;
		let i = index - 1;
		while (i >= 0) {
			if (this._flattenTreeArray[i].indent < indent) {
				return i;
			}
			i--;
		}
		return 0;
	}

	get flattenTreeArray(): readonly TreeViewModel[] {
		return this._flattenTreeArray;
	}

	setFlattenTree(arr: TreeViewModel[]) {
		this._flattenTreeArray = arr;
	}

	getTreeViewModelByIndex(index: number) {
		return this._flattenTreeArray[index];
	}

	getTreeViewModelByPath(path: string) {
		const idx = this._pathToFlattenArrayIndexMap.get(path);
		return this._flattenTreeArray[idx];
	}

	rebuildPathToFlattenArrayIndexMap() {
		this._pathToFlattenArrayIndexMap.clear();

		for (let i = 0; i < this._flattenTreeArray.length; i++) {
			const viewModel = this._flattenTreeArray[i];
			const path = viewModel.path;

			this._pathToFlattenArrayIndexMap.set(path, i);
		}
	}

	getFlattenArrayIndexByPath(path: string) {
		return this._pathToFlattenArrayIndexMap.get(path);
	}

	setFlattenArrayIndexByPath(path: string, index: number) {
		this._pathToFlattenArrayIndexMap.set(path, index);
	}

	deleteFlattenArrayIndexByPath(path: string) {
		this._pathToFlattenArrayIndexMap.delete(path);
	}

	get lastSelectedIndex() {
		return this._lastSelectedIndex;
	}

	set lastSelectedIndex(index: number) {
		this._lastSelectedIndex = index;
	}

	removeLastSelectedIndex() {
		this._lastSelectedIndex = -1;
	}

	get contextTreeIndex() {
		return this._contextTreeIndex;
	}

	set contextTreeIndex(index: number) {
		this._contextTreeIndex = index;
	}

	removeContextTreeIndex() {
		this._contextTreeIndex = -1;
	}

	get selectedDragIndex() {
		return this._selectedDragIndex;
	}

	set selectedDragIndex(index: number) {
		this._selectedDragIndex = index;
	}

	addSelectedIndices(index: number) {
		this._selectedIndices.add(index);
	}

	getSelectedIndices(): number[] {
		return [...this._selectedIndices];
	}

	clearSelectedIndices() {
		this._lastSelectedIndex = -1;
		this._selectedIndices.clear();
	}

	addClipboardPaths(path: string) {
		this._clipboardPaths.add(path);
	}

	getClipboardPaths(): string[] {
		return [...this._clipboardPaths];
	}

	clearClipboardPaths() {
		this._clipboardPaths.clear();
	}

	get clipboardMode() {
		return this._clipboardMode;
	}

	set clipboardMode(mode: ClipboardMode) {
		this._clipboardMode = mode;
	}
}
