import { injectable } from "inversify"

@injectable()
export default class SettingsElements {
	public readonly exit: HTMLElement
	public readonly apply: HTMLElement
	public readonly close: HTMLElement

	public readonly menus: NodeListOf<HTMLElement>
	public readonly contents: NodeListOf<HTMLElement>

	public readonly overlay: HTMLElement
	public readonly fontSizeDiv: HTMLElement
	public readonly fontSizeInput: HTMLInputElement
	public readonly fontFamilyDiv: HTMLElement
	public readonly fontFamilyInput: HTMLInputElement

	constructor() {
		this.exit = document.querySelector("#settings-exit") as HTMLElement
		this.apply = document.querySelector("#settings-apply-btn") as HTMLElement
		this.close = document.querySelector("#settings-close-btn") as HTMLElement

		this.menus = document.querySelectorAll("#settings-menus > button")
		this.contents = document.querySelectorAll("#settings-contents > div")

		this.overlay = document.querySelector("#settings-overlay") as HTMLElement

		this.fontSizeDiv = document.querySelector("#setting-node-font-size") as HTMLElement
		this.fontSizeInput = document.querySelector("#setting-node-font-size input") as HTMLInputElement

		this.fontFamilyDiv = document.querySelector("#setting-node-font-family") as HTMLElement
		this.fontFamilyInput = document.querySelector("#setting-node-font-family input") as HTMLInputElement
	}
}
