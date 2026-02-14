import type { SettingsDto, SettingFontDto, SettingThemeDto } from "@shared/dto/SettingsDto"
import type {
	SettingsViewModel,
	SettingFontViewModel,
	SettingThemeViewModel,
} from "@renderer/viewmodels/SettingsViewModel"

import { inject, injectable } from "inversify"
import DI_KEYS from "../../constants/di_keys"
import SettingsStore from "./SettingsStore"
import SettingsRenderer from "./SettingsRenderer"

type Binding<T> = {
	on: (callback: (value: T) => void) => void
	update: (value: T) => void
}

injectable()
export default class SettingsFacade {
	constructor(
		@inject(DI_KEYS.SettingsRenderer) public readonly renderer: SettingsRenderer,
		@inject(DI_KEYS.SettingsStore) public readonly store: SettingsStore
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
		const bindings: Binding<any>[] = [
			{
				on: this.renderer.onChangeFontSize.bind(this.renderer),
				update: this.store.onChangeFontSize.bind(this.store),
			},
			{
				on: this.renderer.onChangeFontFamily.bind(this.renderer),
				update: this.store.onChangeFontFamily.bind(this.store),
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
