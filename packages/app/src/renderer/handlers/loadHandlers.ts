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
import { toggleSide } from "@renderer/actions"
import type MenuElements from "@renderer/modules/menu/MenuElements"
import type CommandManager from "@renderer/modules/CommandManager"
import { CLASS_SELECTED } from "@renderer/constants/dom"

export function handleLoad(
	commandManager: CommandManager,
	windowFacade: WindowFacade,
	settingsFacade: SettingsFacade,
	tabEditorFacade: TabEditorFacade,
	treeFacade: TreeFacade,
	sideFacade: SideFacade,
	infoFacade: InfoFacade,
	menuElements: MenuElements
) {
	window.mainToRenderer.session(
		async (
			windowDto: WindowDto,
			settingsDto: SettingsDto,
			sideDto: SideDto,
			tabEditorsDto: TabEditorsDto,
			treeDto: TreeDto,
			version: string
		) => {
			processWindowSession(windowFacade, windowDto)
			processSettingsSession(settingsFacade, settingsDto)
			processSideSession(sideFacade, sideDto)
			processTabEditorSession(tabEditorFacade, tabEditorsDto)
			processTreeSession(treeFacade, treeDto)

			initSettings(commandManager, settingsFacade)
			initSide(sideFacade, menuElements)
			initInfo(infoFacade, version)
			initWindow(windowFacade)

			window.rendererToMain.showMainWindow()
		}
	)
}

//

function processWindowSession(facade: WindowFacade, dto: WindowDto) {
	if (dto) {
		facade.setWindowMaximizeState(dto.maximize)
	}
}

function processSettingsSession(facade: SettingsFacade, dto: SettingsDto) {
	if (dto) {
		const settingsViewModel = facade.toSettingsViewModel(dto)
		facade.setSettingsValue(settingsViewModel)
	}
}

function processSideSession(facade: SideFacade, dto: SideDto) {
	if (dto) {
		facade.setSideOpenState(dto.open)
		facade.setSideWidth(dto.width)
	}
}

async function processTabEditorSession(facade: TabEditorFacade, dto: TabEditorsDto) {
	if (dto) {
		await facade.loadTabs(dto)
	}
}

function processTreeSession(facade: TreeFacade, dto: TreeDto) {
	if (dto) {
		const viewModel = facade.toTreeViewModel(dto)
		facade.renderTreeData(viewModel)
		facade.loadFlattenArrayAndMaps(viewModel)
	}
}

//

function initSettings(commandManager: CommandManager, settingsFacade: SettingsFacade) {
	const { menus, contents } = settingsFacade.renderer.elements
	menus[0].classList.add(CLASS_SELECTED)
	contents[0].style.display = "block"

	settingsFacade.renderSettingsValue(settingsFacade.getSettingsValue())
	// TODO
	commandManager.performApplySettings("programmatic", settingsFacade.getSettingsValue())
}

function initSide(sideFacade: SideFacade, menuElements: MenuElements) {
	toggleSide(menuElements, sideFacade)
}

function initInfo(infoFacade: InfoFacade, version: string) {
	infoFacade.elements.version.textContent = version
}

function initWindow(windowFacade: WindowFacade) {
	if (windowFacade.isWindowMaximize()) windowFacade.renderUnMaximizeButtonSvg()
	else windowFacade.renderMaximizeButtonSvg()
}
