import SettingsDto, { SettingFontDto, SettingThemeDto } from "@shared/dto/SettingsDto"
import SettingsViewModel, { SettingFontViewModel, SettingThemeViewModel } from "src/renderer/viewmodels/SettingsViewModel"
import { injectable } from "inversify"

@injectable()
export default class SettingsStore {
    private _viewModel: SettingsViewModel

    constructor() {
        this._viewModel = {
            settingFontViewModel: {
                size: 16
            },

            settingThemeViewModel: {

            }
        }
    }

    

    toSettingsViewModel(dto: SettingsDto): SettingsViewModel {
        return {
            settingFontViewModel: dto.settingFontDto as SettingFontViewModel,
            settingThemeViewModel: dto.settingThemeDto as SettingThemeViewModel
        }
    }

    toSettingsDto(viewModel: SettingsViewModel): SettingsDto {
        return {
            settingFontDto: viewModel.settingFontViewModel as SettingFontDto,
            settingThemeDto: viewModel.settingThemeViewModel as SettingThemeDto
        }
    }



    getSettingsValue() {
        return JSON.parse(JSON.stringify(this._viewModel))
    }

    setSettingsValue(viewModel: SettingsViewModel) {
        this._setSettingFont(viewModel.settingFontViewModel)
        this._setSettingTheme(viewModel.settingThemeViewModel)
    }

    private _setSettingFont(fontViewModel: SettingFontViewModel) {
        this._viewModel.settingFontViewModel.size = fontViewModel?.size ?? this._viewModel.settingFontViewModel.size
    }

    private _setSettingTheme(themeViewModel: SettingThemeViewModel) {

    }



    setFontSize(size: number) {
        this._viewModel.settingFontViewModel.size = size
    }
}