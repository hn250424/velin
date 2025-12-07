export default interface SettingsDto {
	settingFontDto: SettingFontDto;
	settingThemeDto: SettingThemeDto;
}

export interface SettingFontDto {
	size: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SettingThemeDto {}
