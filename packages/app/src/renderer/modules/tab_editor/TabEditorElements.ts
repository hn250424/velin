import { injectable } from "inversify"

@injectable()
export default class TabEditorElements {
	public readonly tabContextMenu: HTMLElement

	public readonly tabContextClose: HTMLElement
	public readonly tabContextCloseOthers: HTMLElement
	public readonly tabContextCloseRight: HTMLElement
	public readonly tabContextCloseAll: HTMLElement

	public readonly tabContainer: HTMLElement
	public readonly editorContainer: HTMLElement

	public readonly findAndReplaceContainer: HTMLElement
	public readonly findBox: HTMLElement
	public readonly replaceBox: HTMLElement
	public readonly findInput: HTMLInputElement
	public readonly replaceInput: HTMLInputElement
	public readonly findInfo: HTMLElement
	public readonly findUp: HTMLElement
	public readonly findDown: HTMLElement
	public readonly findClose: HTMLElement
	public readonly replaceCurrent: HTMLElement
	public readonly replaceAll: HTMLElement

	constructor() {
		this.tabContextMenu = document.querySelector("#tab-context-menu") as HTMLElement

		this.tabContextClose = document.querySelector("#tab-context-close") as HTMLElement
		this.tabContextCloseOthers = document.querySelector("#tab-context-close-others") as HTMLElement
		this.tabContextCloseRight = document.querySelector("#tab-context-close-right") as HTMLElement
		this.tabContextCloseAll = document.querySelector("#tab-context-close-all") as HTMLElement

		this.tabContainer = document.querySelector("#tab-container") as HTMLElement
		this.editorContainer = document.querySelector("#editor-container") as HTMLElement

		this.findAndReplaceContainer = document.querySelector("#find-replace-container") as HTMLElement
		this.findBox = document.querySelector("#find") as HTMLElement
		this.replaceBox = document.querySelector("#replace") as HTMLElement
		this.findInput = document.querySelector("#find-input") as HTMLInputElement
		this.replaceInput = document.querySelector("#replace-input") as HTMLInputElement
		this.findInfo = document.querySelector("#find-info") as HTMLElement
		this.findUp = document.querySelector("#find-up") as HTMLElement
		this.findDown = document.querySelector("#find-down") as HTMLElement
		this.findClose = document.querySelector("#find-close") as HTMLElement
		this.replaceCurrent = document.querySelector("#replace-current") as HTMLElement
		this.replaceAll = document.querySelector("#replace-all") as HTMLElement
	}
}
