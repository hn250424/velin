export interface SettingsDto {
	settingFontDto: SettingFontDto
	settingThemeDto: SettingThemeDto
}

export interface SettingFontDto {
	size: number
	family: string
}

export interface SettingThemeDto {
	theme: string
}
