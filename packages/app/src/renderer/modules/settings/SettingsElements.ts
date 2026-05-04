import { injectable } from "inversify"
import * as aero from "@taren250424/aero"

@injectable()
export class SettingsElements {
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

	public readonly themeDiv: HTMLElement
	public readonly themeSelect: aero.AeroSelect
	public readonly themeOptions: NodeListOf<aero.AeroOption>

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

		this.themeDiv = document.querySelector("#settings-node-theme") as HTMLElement
		this.themeSelect = document.querySelector("#settings-node-theme aero-select") as aero.AeroSelect
		this.themeOptions = this.themeSelect.querySelectorAll("aero-option") as NodeListOf<aero.AeroOption>
	}
}
