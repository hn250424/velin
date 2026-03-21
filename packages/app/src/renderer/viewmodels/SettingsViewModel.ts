export interface SettingsViewModel {
	settingFontViewModel: SettingFontViewModel
	settingThemeViewModel: SettingThemeViewModel
}

export interface SettingFontViewModel {
	size: number
	family: string
}

export interface SettingThemeViewModel {
	theme: string
}
