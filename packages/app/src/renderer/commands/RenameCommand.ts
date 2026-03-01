import type Response from "@shared/types/Response"
import type { ICommand } from "./index"

import { CLASS_TREE_NODE_TEXT, SELECTOR_TREE_NODE_TEXT } from "../constants/dom"
import { TabEditorFacade, TreeFacade } from "../modules"

export class RenameCommand implements ICommand {
	private confirmedNewPath = ""

	constructor(
		private treeFacade: TreeFacade,
		private tabEditorFacade: TabEditorFacade,
		private treeNode: HTMLElement,
		private isDir: boolean,
		private prePath: string,
		private newPath: string
	) {}

	async execute() {
		const response: Response<string> = await window.rendererToMain.rename(this.prePath, this.newPath)
		if (!response.result) throw new Error("Rename failed")

		this.confirmedNewPath = response.data
		await this.treeFacade.applyRename(this.prePath, this.confirmedNewPath)

		this._updateDOM(this.confirmedNewPath)
		// const newSpan = document.createElement("span")
		// newSpan.classList.add(CLASS_TREE_NODE_TEXT, "ellipsis")
		// newSpan.textContent = window.utils.getBaseName(this.newPath)

		// this.treeNode.replaceChild(newSpan, this.treeNode.querySelector("input") as HTMLInputElement)

		if (this.isDir) await this.tabEditorFacade.renameDirectory(this.prePath, this.confirmedNewPath)
		else await this.tabEditorFacade.renameFile(this.prePath, this.confirmedNewPath)
	}

	async undo() {
		await window.rendererToMain.rename(this.confirmedNewPath, this.prePath)
		await this.treeFacade.applyRename(this.confirmedNewPath, this.prePath)

		this._updateDOM(this.prePath)
		// const oldSpan = document.createElement("span")
		// oldSpan.classList.add(CLASS_TREE_NODE_TEXT, "ellipsis")
		// oldSpan.textContent = window.utils.getBaseName(this.prePath)

		// const currentText = this.treeNode.querySelector(SELECTOR_TREE_NODE_TEXT)
		// if (currentText) this.treeNode.replaceChild(oldSpan, currentText)

		if (this.isDir) await this.tabEditorFacade.renameDirectory(this.confirmedNewPath, this.prePath)
		else await this.tabEditorFacade.renameFile(this.confirmedNewPath, this.prePath)
	}

	private _updateDOM(path: string) {
		const newSpan = document.createElement("span")
		newSpan.classList.add(CLASS_TREE_NODE_TEXT, "ellipsis")
		newSpan.textContent = window.utils.getBaseName(path)

		const currentText = this.treeNode.querySelector(SELECTOR_TREE_NODE_TEXT) || this.treeNode.querySelector("input")

		if (currentText) {
			this.treeNode.replaceChild(newSpan, currentText)
		}
	}
}
