export default interface SettingsViewModel {
	settingFontViewModel: SettingFontViewModel;
	settingThemeViewModel: SettingThemeViewModel;
}

export interface SettingFontViewModel {
	size: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SettingThemeViewModel {}
