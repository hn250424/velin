export interface SettingsDto {
	settingFontDto: SettingFontDto;
	settingThemeDto: SettingThemeDto;
}

export interface SettingFontDto {
	size: number;
	family: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SettingThemeDto {}
