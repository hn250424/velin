import { inject, injectable } from "inversify"
import DI_KEYS from "../../constants/di_keys"
import SettingsStore from "./SettingsStore"
import SettingsRenderer from "./SettingsRenderer"
import SettingsDto, { SettingFontDto, SettingThemeDto } from "@shared/dto/SettingsDto"
import SettingsViewModel, { SettingFontViewModel, SettingThemeViewModel } from "src/renderer/viewmodels/SettingsViewModel"

injectable()
export default class SettingsFacade {
    constructor(
        @inject(DI_KEYS.SettingsRenderer) private readonly renderer: SettingsRenderer,
        @inject(DI_KEYS.SettingsStore) private readonly store: SettingsStore,
    ) { 
        this.renderer.onChangeFontSize((size: number) => {
            this.store.setFontSize(size)
        })
    }

    openSettings() {
        this.renderer.openSettings()
    }

    closeSettings() {
        this.renderer.closeSettings()
    }



    renderSettingsValue(viewModel: SettingsViewModel) {
        this.renderer.renderSettingsValue(viewModel)
    }






    toSettingsViewModel(dto: SettingsDto) {
        return this.store.toSettingsViewModel(dto)
    }

    toSettingsDto(viewModel: SettingsViewModel) {
        return this.store.toSettingsDto(viewModel)
    }

    getSettingsValue() {
        return this.store.getSettingsValue()
    }

    setSettingsValue(viewModel: SettingsViewModel) {
        this.store.setSettingsValue(viewModel)
    }



}