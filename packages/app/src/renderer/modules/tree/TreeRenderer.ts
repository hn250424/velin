import type { TreeViewModel } from "../../viewmodels/TreeViewModel";

import { injectable } from "inversify";

import fileSvg from "../../assets/icons/file.svg?raw";
import folderSvg from "../../assets/icons/folder.svg?raw";
import openedFolderSvg from "../../assets/icons/opened_folder.svg?raw";
import {
	CLASS_FOCUSED,
	CLASS_EXPANDED,
	CLASS_TREE_GHOST,
	CLASS_TREE_NODE,
	CLASS_TREE_NODE_CHILDREN,
	CLASS_TREE_NODE_TYPE,
	CLASS_TREE_NODE_INPUT,
	CLASS_TREE_NODE_TEXT,
	CLASS_TREE_NODE_WRAPPER,
	DATASET_ATTR_TREE_PATH,
	SELECTOR_TREE_NODE,
} from "../../constants/dom";

@injectable()
export default class TreeRenderer {
	private _tree_top_name: HTMLElement;
	private _tree_node_container: HTMLElement;

	private ghostBox: HTMLElement | null = null;

	private _pathToTreeWrapperMap: Map<string, HTMLElement> = new Map();

	constructor() {
		this._tree_node_container = document.getElementById("tree_node_container") as HTMLElement;
		this._tree_top_name = document.getElementById("tree_top_name") as HTMLElement;
	}

	clean(container: HTMLElement) {
		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}
	}

	removeContainerFocus() {
		this._tree_node_container.classList.remove(CLASS_FOCUSED);
	}

	// Each DOM element with class `tree_node` has a dataset attribute for its path.
	// The root node uses the container `tree_node_container` to hold its path in the dataset.
	renderTreeData(viewModel: TreeViewModel, container?: HTMLElement) {
		if (!container) {
			this._tree_top_name.textContent = viewModel.name;
			container = this._tree_node_container;

			this._pathToTreeWrapperMap.set(viewModel.path, container);
			container.dataset[DATASET_ATTR_TREE_PATH] = viewModel.path;
		}

		this.clean(container);

		if (viewModel.children) {
			for (const child of viewModel.children) {
				this._renderNode(container, child);
			}
		}
	}

	private _renderNode(container: HTMLElement, viewModel: TreeViewModel) {
		const box = document.createElement("div");
		box.classList.add(CLASS_TREE_NODE);
		box.style.paddingLeft = `${(viewModel.indent - 1) * 16}px`;
		box.dataset[DATASET_ATTR_TREE_PATH] = viewModel.path;
		box.title = viewModel.path;

		const nodeType = document.createElement("div");
		nodeType.classList.add(CLASS_TREE_NODE_TYPE);

		if (!viewModel.directory) {
			nodeType.classList.add("file");
			nodeType.innerHTML = fileSvg
		} else {
			nodeType.classList.add("folder");

			if (viewModel.expanded) {
				nodeType.innerHTML = openedFolderSvg
			} else {
				nodeType.innerHTML = folderSvg
			}
		}

		const text = document.createElement("span");
		text.classList.add(CLASS_TREE_NODE_TEXT, "ellipsis");
		text.textContent = viewModel.name;

		const childrenContainer = document.createElement("div");
		childrenContainer.classList.add(CLASS_TREE_NODE_CHILDREN);
		if (viewModel.expanded) childrenContainer.classList.add(CLASS_EXPANDED);
		else childrenContainer.classList.remove(CLASS_EXPANDED);

		box.appendChild(nodeType);
		box.appendChild(text);

		const wrapper = document.createElement("div");
		wrapper.classList.add(CLASS_TREE_NODE_WRAPPER);
		wrapper.appendChild(box);
		wrapper.appendChild(childrenContainer);

		this._pathToTreeWrapperMap.set(viewModel.path, wrapper);
		container.appendChild(wrapper);

		if (viewModel.expanded && viewModel.children && viewModel.children.length > 0) {
			for (const child of viewModel.children) {
				this._renderNode(childrenContainer, child);
			}
		}
	}

	createInputbox(directory: boolean, indent: number) {
		const box = document.createElement("div");
		box.classList.add("tree_node_temp");
		box.style.paddingLeft = `${indent * 16}px`;

		const nodeType = document.createElement("div");
		nodeType.classList.add(CLASS_TREE_NODE_TYPE);

		if(directory) {
			nodeType.classList.add("folder");
			nodeType.innerHTML = folderSvg;
		} else {
			nodeType.classList.add("file");
			nodeType.innerHTML = fileSvg;
		}

		const input = document.createElement("input");
		input.type = "text";
		input.value = "";
		input.classList.add(CLASS_TREE_NODE_INPUT);

		box.appendChild(nodeType);
		box.appendChild(input);

		const wrapper = document.createElement("div");
		wrapper.classList.add(CLASS_TREE_NODE_WRAPPER);
		wrapper.appendChild(box);

		return { wrapper, input };
	}

	createGhostBox(count: number) {
		if (this.ghostBox) return this.ghostBox;

		const div = document.createElement("div");
		div.classList.add(CLASS_TREE_GHOST);
		div.textContent = `${count} items`;

		this.ghostBox = div;
		document.body.appendChild(div);

		return this.ghostBox;
	}

	removeGhostBox() {
		if (this.ghostBox) {
			this.ghostBox.remove();
			this.ghostBox = null;
		}
	}

	clearPathToTreeWrapperMap() {
		this._pathToTreeWrapperMap.clear();
	}

	getTreeNodeByPath(path: string) {
		const wrapper = this._pathToTreeWrapperMap.get(path)!;
		return wrapper.querySelector(SELECTOR_TREE_NODE) as HTMLElement;
	}

	getTreeWrapperByPath(path: string) {
		return this._pathToTreeWrapperMap.get(path);
	}

	setTreeWrapperByPath(path: string, wrapper: HTMLElement) {
		this._pathToTreeWrapperMap.set(path, wrapper);
	}

	deleteTreeWrapperByPath(path: string) {
		this._pathToTreeWrapperMap.delete(path);
	}
}
