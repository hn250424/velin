import SettingsSessionModel, {
	SettingFontSessionModel,
	SettingThemeSessionModel,
} from "@main/models/SettingsSessionModel";
import IFileManager from "@main/modules/contracts/IFileManager";
import ISettingsUtils from "@main/modules/contracts/ISettingsUtils";
import SettingsDto, { SettingFontDto, SettingThemeDto } from "@shared/dto/SettingsDto";

export default class FakeSettingsUtils implements ISettingsUtils {
	constructor(private fakeFileManager: IFileManager) {}

	toSettingsDto(session: SettingsSessionModel): SettingsDto {
		return {
			settingFontDto: session.settingFontSessionModel as SettingFontDto,
			settingThemeDto: session.settingThemeSessionModel as SettingThemeDto,
		};
	}

	toSettingsSessionModel(dto: SettingsDto): SettingsSessionModel {
		return {
			settingFontSessionModel: dto.settingFontDto as SettingFontSessionModel,
			settingThemeSessionModel: dto.settingThemeDto as SettingThemeSessionModel,
		};
	}
}
