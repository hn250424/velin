import type Response from "@shared/types/Response"
import type { ICommand } from "./index"

import { CLASS_TREE_NODE_TEXT, SELECTOR_TREE_NODE_TEXT } from "../constants/dom"
import { TabEditorFacade, TreeFacade } from "../modules"

export class RenameCommand implements ICommand {
	constructor(
		private treeFacade: TreeFacade,
		private tabEditorFacade: TabEditorFacade,
		private treeNode: HTMLElement,
		private isDir: boolean,
		private prePath: string,
		private newPath: string
	) {}

	async execute() {
		const response: Response<string> = await this.treeFacade.rename(this.prePath, this.newPath)
		if (!response.result) throw new Error("Rename failed")
		this.newPath = response.data

		const newSpan = document.createElement("span")
		newSpan.classList.add(CLASS_TREE_NODE_TEXT, "ellipsis")
		newSpan.textContent = window.utils.getBaseName(this.newPath)

		this.treeNode.replaceChild(newSpan, this.treeNode.querySelector("input") as HTMLInputElement)

		await this.tabEditorFacade.rename(this.prePath, this.newPath, this.isDir)
	}

	async undo() {
		await this.treeFacade.rename(this.newPath, this.prePath)

		const oldSpan = document.createElement("span")
		oldSpan.classList.add(CLASS_TREE_NODE_TEXT, "ellipsis")
		oldSpan.textContent = window.utils.getBaseName(this.prePath)

		const currentText = this.treeNode.querySelector(SELECTOR_TREE_NODE_TEXT)
		if (currentText) this.treeNode.replaceChild(oldSpan, currentText)

		await this.tabEditorFacade.rename(this.newPath, this.prePath, this.isDir)
	}
}
