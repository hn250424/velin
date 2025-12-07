import SettingsDto, {
	SettingFontDto,
	SettingThemeDto,
} from "@shared/dto/SettingsDto";
import SettingsViewModel, {
	SettingFontViewModel,
	SettingThemeViewModel,
} from "src/renderer/viewmodels/SettingsViewModel";
import { injectable } from "inversify";

@injectable()
export default class SettingsStore {
	private _currentSettings: SettingsViewModel;
	private _draftSettings: SettingsViewModel;

	constructor() {
		this._currentSettings = {
			settingFontViewModel: {
				size: 16,
			},

			settingThemeViewModel: {},
		};

		this.resetChangeSet();
	}

	toSettingsViewModel(dto: SettingsDto): SettingsViewModel {
		return {
			settingFontViewModel: dto.settingFontDto as SettingFontViewModel,
			settingThemeViewModel: dto.settingThemeDto as SettingThemeViewModel,
		};
	}

	toSettingsDto(viewModel: SettingsViewModel): SettingsDto {
		return {
			settingFontDto: viewModel.settingFontViewModel as SettingFontDto,
			settingThemeDto: viewModel.settingThemeViewModel as SettingThemeDto,
		};
	}

	getSettingsValue() {
		return JSON.parse(JSON.stringify(this._currentSettings));
	}

	setSettingsValue(viewModel: SettingsViewModel) {
		this._setSettingFont(viewModel.settingFontViewModel);
		this._setSettingTheme(viewModel.settingThemeViewModel);
	}

	private _setSettingFont(fontViewModel: SettingFontViewModel) {
		this._currentSettings.settingFontViewModel.size =
			fontViewModel?.size ?? this._currentSettings.settingFontViewModel.size;
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	private _setSettingTheme(themeViewModel: SettingThemeViewModel) {}

	getCurrentSettings() {
		return JSON.parse(JSON.stringify(this._currentSettings));
	}

	getDraftSettings() {
		return JSON.parse(JSON.stringify(this._draftSettings));
	}

	getChangeSet(): SettingsViewModel {
		return {
			settingFontViewModel: {
				size:
					this._currentSettings.settingFontViewModel.size !==
					this._draftSettings.settingFontViewModel.size
						? this._draftSettings.settingFontViewModel.size
						: null,
			},

			settingThemeViewModel: {},
		};
	}

	resetChangeSet() {
		this._draftSettings = JSON.parse(JSON.stringify(this._currentSettings));
	}

	applyChangeSet() {
		this._currentSettings = JSON.parse(JSON.stringify(this._draftSettings));
	}

	onChangeFontSize(size: number) {
		this._draftSettings.settingFontViewModel.size = size;
	}
}
