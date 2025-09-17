import { inject, injectable } from 'inversify'
import DI_KEYS from '../../constants/di_keys'
import IFileManager from '../contracts/IFileManager'
import ISettingsUtils from '../contracts/ISettingsUtils'
import SettingsSessionModel, { SettingFontSessionModel, SettingThemeSessionModel } from '@main/models/SettingsSessionModel'
import SettingsDto, { SettingFontDto, SettingThemeDto } from '@shared/dto/SettingsDto'

@injectable()
export default class SettingsUtils implements ISettingsUtils {
    constructor(
        @inject(DI_KEYS.FileManager) private readonly fileManager: IFileManager,
    ) { }

    toSettingsDto(session: SettingsSessionModel): SettingsDto {
        return {
            settingFontDto: session.settingFontSessionModel as SettingFontDto,
            settingThemeDto: session.settingThemeSessionModel as SettingThemeDto
        }
    }

    toSettingsSessionModel(dto: SettingsDto): SettingsSessionModel {
        return {
            settingFontSessionModel: dto.settingFontDto as SettingFontSessionModel,
            settingThemeSessionModel: dto.settingThemeDto as SettingThemeSessionModel
        }   
    }
}