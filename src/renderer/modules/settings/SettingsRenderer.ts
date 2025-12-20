import { injectable } from "inversify";
import SettingsViewModel, {
	SettingFontViewModel,
	SettingThemeViewModel,
} from "src/renderer/viewmodels/SettingsViewModel";

@injectable()
export default class SettingsRenderer {
	private _settingsOverlay: HTMLElement;

	private _fontSizeDiv: HTMLElement;
	private _fontSizeInput: HTMLElement;

	constructor() {
		this._settingsOverlay = document.getElementById("settings-overlay");

		this._fontSizeDiv = document.getElementById("setting-node-font-size");
		this._fontSizeInput = this._fontSizeDiv.querySelector("input");
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
		this._fontSizeDiv.querySelector("input").value = fontViewModel.size.toString();
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	private _renderSettingTheme(themeViewModel: SettingThemeViewModel) {}

	onChangeFontSize(callback: (size: number) => void) {
		this._fontSizeInput.addEventListener("change", () => {
			callback(Number((this._fontSizeInput as HTMLInputElement).value));
		});
	}
}
