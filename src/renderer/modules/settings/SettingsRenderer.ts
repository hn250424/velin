import { injectable } from "inversify";
import SettingsViewModel, {
	SettingFontViewModel,
	SettingThemeViewModel,
} from "src/renderer/viewmodels/SettingsViewModel";

@injectable()
export default class SettingsRenderer {
	private _settingsOverlay: HTMLElement;

	private _fontSizeDiv: HTMLElement;
	private _fontSizeInput: HTMLInputElement;

	private _fontFamilyDiv: HTMLElement;
	private _fontFamilyInput: HTMLInputElement;

	constructor() {
		this._settingsOverlay = document.getElementById("settings-overlay");

		this._fontSizeDiv = document.getElementById("setting-node-font-size");
		this._fontSizeInput = this._fontSizeDiv.querySelector("input");

		this._fontFamilyDiv = document.getElementById("setting-node-font-family");
		this._fontFamilyInput = this._fontFamilyDiv.querySelector("input");
	}

	openSettings() {
		this._settingsOverlay.style.display = "flex";
	}

	closeSettings() {
		this._settingsOverlay.style.display = "none";
	}

	renderSettingsValue(viewModel: SettingsViewModel) {
		this._renderSettingFont(viewModel.settingFontViewModel);
		this._renderSettingTheme(viewModel.settingThemeViewModel);
	}

	private _renderSettingFont(fontViewModel: SettingFontViewModel) {
		this._fontSizeInput.value = fontViewModel.size.toString();
		this._fontFamilyInput.value = fontViewModel.family.toString();
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	private _renderSettingTheme(themeViewModel: SettingThemeViewModel) {}

	onChangeFontSize(callback: (size: number) => void) {
		this._fontSizeInput.addEventListener("change", () => {
			callback(Number(this._fontSizeInput.value));
		});
	}

	onChangeFontFamily(callback: (family: string) => void) {
		this._fontFamilyInput.addEventListener("change", () => {
			callback(this._fontFamilyInput.value)
		})
	}
}
