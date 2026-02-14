import type { TabEditorsDto } from "@shared/dto/TabEditorDto"
import type { TreeDto } from "@shared/dto/TreeDto"
import type { WindowDto } from "@shared/dto/WindowDto"
import type { SettingsDto } from "@shared/dto/SettingsDto"
import type { SideDto } from "@shared/dto/SideDto"

import TabEditorFacade from "../modules/tab_editor/TabEditorFacade"
import TreeFacade from "../modules/tree/TreeFacade"
import SettingsFacade from "../modules/settings/SettingsFacade"
import type WindowFacade from "@renderer/modules/window/WindowFacade"
import type SideFacade from "@renderer/modules/side/SideFacade"
import type InfoFacade from "@renderer/modules/info/InfoFacade"

export default function registerLoadHandlers(
	windowFacade: WindowFacade,
	settingsFacade: SettingsFacade,
	tabEditorFacade: TabEditorFacade,
	treeFacade: TreeFacade,
	sideFacade: SideFacade,
	infoFacade: InfoFacade,
	callback: () => void
) {
	let sessionDone = false
	let infoDone = false

	function finish() {
		if (sessionDone && infoDone) {
			callback()
			window.rendererToMain.showMainWindow()
		}
	}

	window.mainToRenderer.session(
		async (windowDto: WindowDto, settingsDto: SettingsDto, sideDto: SideDto, tabs: TabEditorsDto, tree: TreeDto) => {
			if (windowDto) {
				windowFacade.setWindowMaximizeState(windowDto.maximize)
			}

			if (settingsDto) {
				const settingsViewModel = settingsFacade.toSettingsViewModel(settingsDto)
				settingsFacade.setSettingsValue(settingsViewModel)
			}

			if (sideDto) {
				sideFacade.setSideOpenState(sideDto.open)
				sideFacade.setSideWidth(sideDto.width)
			}

			if (tabs) {
				await tabEditorFacade.loadTabs(tabs)
			}

			if (tree) {
				const viewModel = treeFacade.toTreeViewModel(tree)
				treeFacade.renderTreeData(viewModel)
				treeFacade.loadFlattenArrayAndMaps(viewModel)
			}

			sessionDone = true
			finish()
		}
	)

	window.mainToRenderer.info((version: string) => {
		infoFacade.elements.version.textContent = version

		infoDone = true
		finish()
	})
}
