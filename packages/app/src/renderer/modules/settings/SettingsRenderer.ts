import DI_KEYS from "@renderer/constants/di_keys"
import type {
	SettingsViewModel,
	SettingFontViewModel,
	SettingThemeViewModel,
} from "@renderer/viewmodels/SettingsViewModel"
import { inject, injectable } from "inversify"
import type { SettingsElements } from "./SettingsElements"

@injectable()
export class SettingsRenderer {
	constructor(@inject(DI_KEYS.SettingsElements) readonly elements: SettingsElements) {}

	openSettings() {
		this.elements.overlay.style.display = "flex"
	}

	closeSettings() {
		this.elements.overlay.style.display = "none"
	}

	renderSettingsValue(viewModel: SettingsViewModel) {
		this._renderSettingFont(viewModel.settingFontViewModel)
		this._renderSettingTheme(viewModel.settingThemeViewModel)
	}

	private _renderSettingFont(fontViewModel: SettingFontViewModel) {
		this.elements.fontSizeInput.value = fontViewModel.size.toString()
		this.elements.fontFamilyInput.value = fontViewModel.family.toString()
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	private _renderSettingTheme(themeViewModel: SettingThemeViewModel) {}

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
}
