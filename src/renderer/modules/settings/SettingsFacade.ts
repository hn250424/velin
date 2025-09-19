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
        this._bindChangeEvents()
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



    getCurrentSettings() {
        return this.store.getCurrentSettings()
    }

    getDraftSettings() {
        return this.store.getDraftSettings()
    }



    getChangeSet() {
        return this.store.getChangeSet()
    }

    resetChangeSet() {
        this.store.resetChangeSet()
    }

    applyChangeSet() {
        this.store.applyChangeSet()
    }

    private _bindChangeEvents() {
        const bindings = [
            {
                on: this.renderer.onChangeFontSize.bind(this.renderer),
                update: this.store.onChangeFontSize.bind(this.store),
            },
            // {
            //     on: this.renderer.onChangeTheme.bind(this.renderer),
            //     update: this.store.setTheme.bind(this.store),
            // },
        ]

        for (const { on, update } of bindings) {
            on((value: any) => update(value))
        }
    }
}