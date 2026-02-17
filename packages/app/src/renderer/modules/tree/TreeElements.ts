import { injectable } from "inversify"

@injectable()
export class TreeElements {
	public readonly treeContextMenu: HTMLElement

	public readonly treeContextCut: HTMLElement
	public readonly treeContextCopy: HTMLElement
	public readonly treeContextPaste: HTMLElement
	public readonly treeContextRename: HTMLElement
	public readonly treeContextDelete: HTMLElement

	public readonly treeNodeContainer: HTMLElement
	public readonly treeTopName: HTMLElement
	public readonly treeTopAddFile: HTMLElement
	public readonly treeTopAddDirectory: HTMLElement

	constructor() {
		this.treeContextMenu = document.querySelector("#tree-context-menu") as HTMLElement

		this.treeContextCut = document.querySelector("#tree-context-cut") as HTMLElement
		this.treeContextCopy = document.querySelector("#tree-context-copy") as HTMLElement
		this.treeContextPaste = document.querySelector("#tree-context-paste") as HTMLElement
		this.treeContextRename = document.querySelector("#tree-context-rename") as HTMLElement
		this.treeContextDelete = document.querySelector("#tree-context-delete") as HTMLElement

		this.treeNodeContainer = document.querySelector("#tree-node-container") as HTMLElement
		this.treeTopName = document.querySelector("#tree-top-name") as HTMLElement
		this.treeTopAddFile = document.querySelector("#tree-top-add-file") as HTMLElement
		this.treeTopAddDirectory = document.querySelector("#tree-top-add-directory") as HTMLElement
	}
}
