import { CLASS_TREE_NODE_TEXT, SELECTOR_TREE_NODE_TEXT } from "../constants/dom"
import TreeLayoutManager from "../modules/managers/TreeLayoutManager"
import TabEditorManager from "../modules/managers/TabEditorManager"
import ICommand from "./ICommand"
import Response from "@shared/types/Response"

export default class RenameCommand implements ICommand {
    constructor(
        private treeLayoutManager: TreeLayoutManager,
        private tabEditorManager: TabEditorManager,
        private treeNode: HTMLElement,
        private isDir: boolean,
        private prePath: string,
        private newPath: string,
    ) { }

    async execute() {
        const response: Response<string> = await this.treeLayoutManager.rename(this.prePath, this.newPath)
        if (!response.result) throw new Error('Rename failed')
        this.newPath = response.data

        const newBaseName = window.utils.getBaseName(this.newPath)
        const newSpan = document.createElement('span')
        newSpan.classList.add(CLASS_TREE_NODE_TEXT, 'ellipsis')
        newSpan.textContent = newBaseName
        this.treeNode.replaceChild(newSpan, this.treeNode.querySelector('input')!)

        await this.tabEditorManager.rename(this.prePath, this.newPath, this.isDir)
    }

    async undo() {
        await this.treeLayoutManager.rename(this.newPath, this.prePath)
        const oldSpan = document.createElement('span')
        oldSpan.classList.add(CLASS_TREE_NODE_TEXT, 'ellipsis')
        oldSpan.textContent = window.utils.getBaseName(this.prePath)
        const currentText = this.treeNode.querySelector(SELECTOR_TREE_NODE_TEXT)
        if (currentText) this.treeNode.replaceChild(oldSpan, currentText)

        await this.tabEditorManager.rename(this.newPath, this.prePath, this.isDir)
    }
}