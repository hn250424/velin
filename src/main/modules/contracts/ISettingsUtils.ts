import SettingsSessionModel from "@main/models/SettingsSessionModel"
import SettingsDto from "@shared/dto/SettingsDto"

export default interface ISettingsUtils {
    toSettingsDto(session: SettingsSessionModel): SettingsDto
    toSettingsSessionModel(dto: SettingsDto): SettingsSessionModel
}