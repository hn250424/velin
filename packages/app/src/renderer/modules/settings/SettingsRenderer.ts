import { DI } from "@renderer/constants"
import type {
	SettingsViewModel,
	SettingFontViewModel,
	SettingThemeViewModel,
} from "@renderer/viewmodels/SettingsViewModel"
import { inject, injectable } from "inversify"
import type { SettingsElements } from "./SettingsElements"
import type { AeroOption } from "@hn250424/aero"

@injectable()
export class SettingsRenderer {
	constructor(@inject(DI.SettingsElements) readonly elements: SettingsElements) {}

	//

	openSettings() {
		this.elements.overlay.style.display = "flex"
	}

	closeSettings() {
		this.elements.overlay.style.display = "none"
	}

	//

	render(viewModel: SettingsViewModel) {
		this._renderSettingFont(viewModel.settingFontViewModel)
		this._renderSettingTheme(viewModel.settingThemeViewModel)
	}

	private _renderSettingFont(fontViewModel: SettingFontViewModel) {
		this.elements.fontSizeInput.value = fontViewModel.size.toString()
		this.elements.fontFamilyInput.value = fontViewModel.family.toString()
	}

	private _renderSettingTheme(themeViewModel: SettingThemeViewModel) {
		this.elements.themeSelect.optionIndex = Array.from(this.elements.themeOptions).findIndex(
			(el) => el.value === themeViewModel.theme
		)
	}

	//

	onChangeFontSize(callback: (size: number) => void) {
		this.elements.fontSizeInput.addEventListener("change", () => {
			callback(Number(this.elements.fontSizeInput.value))
		})
	}

	onChangeFontFamily(callback: (family: string) => void) {
		this.elements.fontFamilyInput.addEventListener("change", () => {
			callback(this.elements.fontFamilyInput.value)
		})
	}

	onChangeTheme(callback: (theme: string) => void) {
		this.elements.themeSelect.addEventListener("aero-select-changed", (e) => {
			const option = e.detail.option as AeroOption
			callback(option.value)
		})
	}
}
