import type { SettingsDto, SettingFontDto, SettingThemeDto } from "@shared/dto/SettingsDto"
import type {
	SettingsViewModel,
	SettingFontViewModel,
	SettingThemeViewModel,
} from "@renderer/viewmodels/SettingsViewModel"

import { injectable } from "inversify"

@injectable()
export class SettingsStore {
	private _currentSettings: SettingsViewModel
	private _draftSettings: SettingsViewModel

	constructor() {
		this._currentSettings = {
			settingFontViewModel: {
				size: 12,
				family: "sans-serif",
			},

			settingThemeViewModel: {
				theme: "light",
			},
		}

		this._draftSettings = JSON.parse(JSON.stringify(this._currentSettings))
	}

	//

	toSettingsViewModel(dto: SettingsDto): SettingsViewModel {
		return {
			settingFontViewModel: dto.settingFontDto as SettingFontViewModel,
			settingThemeViewModel: dto.settingThemeDto as SettingThemeViewModel,
		}
	}

	toSettingsDto(viewModel: SettingsViewModel): SettingsDto {
		return {
			settingFontDto: viewModel.settingFontViewModel as SettingFontDto,
			settingThemeDto: viewModel.settingThemeViewModel as SettingThemeDto,
		}
	}

	//

	getSettingsValue() {
		return JSON.parse(JSON.stringify(this._currentSettings))
	}

	setSettingsValue(viewModel: SettingsViewModel) {
		this._setSettingFont(viewModel.settingFontViewModel)
		this._setSettingTheme(viewModel.settingThemeViewModel)
	}

	private _setSettingFont(fontViewModel: SettingFontViewModel) {
		this._currentSettings.settingFontViewModel.size =
			fontViewModel?.size ?? this._currentSettings.settingFontViewModel.size

		this._currentSettings.settingFontViewModel.family =
			fontViewModel.family ?? this._currentSettings.settingFontViewModel.family
	}

	private _setSettingTheme(themeViewModel: SettingThemeViewModel) {
		this._currentSettings.settingThemeViewModel.theme =
			themeViewModel?.theme ?? this._currentSettings.settingThemeViewModel.theme
	}

	//

	getCurrentSettings() {
		return JSON.parse(JSON.stringify(this._currentSettings))
	}

	getDraftSettings() {
		return JSON.parse(JSON.stringify(this._draftSettings))
	}

	//

	getChangeSet(): SettingsViewModel {
		return {
			settingFontViewModel: {
				size:
					this._currentSettings.settingFontViewModel.size !== this._draftSettings.settingFontViewModel.size
						? this._draftSettings.settingFontViewModel.size
						: 12,

				family:
					this._currentSettings.settingFontViewModel.family !== this._draftSettings.settingFontViewModel.family
						? this._draftSettings.settingFontViewModel.family
						: "sans-serif",
			},

			settingThemeViewModel: {
				theme:
					this._currentSettings.settingThemeViewModel.theme !== this._draftSettings.settingThemeViewModel.theme
						? this._draftSettings.settingThemeViewModel.theme
						: this._currentSettings.settingThemeViewModel.theme,
			},
		}
	}

	resetChangeSet() {
		this._draftSettings = JSON.parse(JSON.stringify(this._currentSettings))
	}

	applyChangeSet() {
		this._currentSettings = JSON.parse(JSON.stringify(this._draftSettings))
	}

	//

	onChangeFontSize(size: number) {
		this._draftSettings.settingFontViewModel.size = size
	}

	onChangeFontFamily(family: string) {
		this._draftSettings.settingFontViewModel.family = family
	}

	onChangeTheme(theme: string) {
		this._draftSettings.settingThemeViewModel.theme = theme
	}
}
