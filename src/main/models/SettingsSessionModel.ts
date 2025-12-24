export default interface SettingsSessionModel {
	settingFontSessionModel: SettingFontSessionModel;
	settingThemeSessionModel: SettingThemeSessionModel;
}

export interface SettingFontSessionModel {
	size: number;
	family: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SettingThemeSessionModel {}
