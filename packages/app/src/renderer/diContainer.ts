import "reflect-metadata"
import DI_KEYS from "./constants/di_keys"
import { Container } from "inversify"

import { FocusManager } from "./core/FocusManager"
import { ShortcutRegistry } from "./core/ShortcutRegistry"

import { MenuElements } from "./modules/menu/MenuElements"

import { TabEditorFacade } from "./modules/tab_editor/TabEditorFacade"
import { TabEditorStore } from "./modules/tab_editor/TabEditorStore"
import { TabEditorRenderer } from "./modules/tab_editor/TabEditorRenderer"
import { TabEditorElements } from "./modules/tab_editor/TabEditorElements"
import { TabDragManager } from "./modules/tab_editor/TabDragManager"

import { SideFacade } from "./modules/side/SideFacade"
import { SideStore } from "./modules/side/SideStore"
import { SideRenderer } from "./modules/side/SideRenderer"
import { SideElements } from "./modules/side/SideElements"
import { SideDragManager } from "./modules/side/SideDragManager"

import { TreeFacade } from "./modules/tree/TreeFacade"
import { TreeStore } from "./modules/tree/TreeStore"
import { TreeRenderer } from "./modules/tree/TreeRenderer"
import { TreeElements } from "./modules/tree/TreeElements"
import { TreeDragManager } from "./modules/tree/TreeDragManager"

import { SettingsFacade } from "./modules/settings/SettingsFacade"
import { SettingsStore } from "./modules/settings/SettingsStore"
import { SettingsRenderer } from "./modules/settings/SettingsRenderer"
import { SettingsElements } from "./modules/settings/SettingsElements"

import { WindowFacade } from "./modules/window/WindowFacade"
import { WindowStore } from "./modules/window/WindowStore"
import { WindowRenderer } from "./modules/window/WindowRenderer"
import { WindowElements } from "./modules/window/WindowElements"

import { InfoFacade } from "./modules/info/InfoFacade"
import { InfoElements } from "./modules/info/InfoElements"

import { ZoomManager } from "./modules/zoom/ZoomManager"

import { CommandManager } from "./modules/CommandManager"

import { Dispatcher } from "./dispatch"

const diContainer = new Container()

diContainer.bind(DI_KEYS.FocusManager).to(FocusManager).inSingletonScope()
diContainer.bind(DI_KEYS.ShortcutRegistry).to(ShortcutRegistry).inSingletonScope()

diContainer.bind(DI_KEYS.MenuElements).to(MenuElements).inSingletonScope()

diContainer.bind(DI_KEYS.TabEditorFacade).to(TabEditorFacade).inSingletonScope()
diContainer.bind(DI_KEYS.TabEditorStore).to(TabEditorStore).inSingletonScope()
diContainer.bind(DI_KEYS.TabEditorRenderer).to(TabEditorRenderer).inSingletonScope()
diContainer.bind(DI_KEYS.TabEditorElements).to(TabEditorElements).inSingletonScope()
diContainer.bind(DI_KEYS.TabDragManager).to(TabDragManager).inSingletonScope()

diContainer.bind(DI_KEYS.SideFacade).to(SideFacade).inSingletonScope()
diContainer.bind(DI_KEYS.SideStore).to(SideStore).inSingletonScope()
diContainer.bind(DI_KEYS.SideRenderer).to(SideRenderer).inSingletonScope()
diContainer.bind(DI_KEYS.SideElements).to(SideElements).inSingletonScope()
diContainer.bind(DI_KEYS.SideDragManager).to(SideDragManager).inSingletonScope()

diContainer.bind(DI_KEYS.TreeFacade).to(TreeFacade).inSingletonScope()
diContainer.bind(DI_KEYS.TreeStore).to(TreeStore).inSingletonScope()
diContainer.bind(DI_KEYS.TreeRenderer).to(TreeRenderer).inSingletonScope()
diContainer.bind(DI_KEYS.TreeElements).to(TreeElements).inSingletonScope()
diContainer.bind(DI_KEYS.TreeDragManager).to(TreeDragManager).inSingletonScope()

diContainer.bind(DI_KEYS.SettingsFacade).to(SettingsFacade).inSingletonScope()
diContainer.bind(DI_KEYS.SettingsStore).to(SettingsStore).inSingletonScope()
diContainer.bind(DI_KEYS.SettingsRenderer).to(SettingsRenderer).inSingletonScope()
diContainer.bind(DI_KEYS.SettingsElements).to(SettingsElements).inSingletonScope()

diContainer.bind(DI_KEYS.WindowFacade).to(WindowFacade).inSingletonScope()
diContainer.bind(DI_KEYS.WindowStore).to(WindowStore).inSingletonScope()
diContainer.bind(DI_KEYS.WindowRenderer).to(WindowRenderer).inSingletonScope()
diContainer.bind(DI_KEYS.WindowElements).to(WindowElements).inSingletonScope()

diContainer.bind(DI_KEYS.InfoFacade).to(InfoFacade).inSingletonScope()
diContainer.bind(DI_KEYS.InfoElements).to(InfoElements).inSingletonScope()

diContainer.bind(DI_KEYS.ZoomManager).to(ZoomManager).inSingletonScope()

diContainer.bind(DI_KEYS.CommandManager).to(CommandManager).inSingletonScope()

diContainer.bind(DI_KEYS.Dispatcher).to(Dispatcher).inSingletonScope()

export default diContainer
