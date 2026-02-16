import "reflect-metadata"
import DI_KEYS from "./constants/di_keys"
import { Container } from "inversify"
import FocusManager from "./core/FocusManager"
import CommandManager from "./modules/CommandManager"
import TabEditorFacade from "./modules/tab_editor/TabEditorFacade"
import TreeFacade from "./modules/tree/TreeFacade"
import ShortcutRegistry from "./core/ShortcutRegistry"
import TabDragManager from "./modules/tab_editor/TabDragManager"
import TreeDragManager from "./modules/tree/TreeDragManager"
import WindowStore from "./modules/window/WindowStore"
import ZoomManager from "./modules/zoom/ZoomManager"
import TabEditorRenderer from "./modules/tab_editor/TabEditorRenderer"
import TabEditorStore from "./modules/tab_editor/TabEditorStore"
import TreeRenderer from "./modules/tree/TreeRenderer"
import TreeStore from "./modules/tree/TreeStore"
import SettingsFacade from "./modules/settings/SettingsFacade"
import SettingsStore from "./modules/settings/SettingsStore"
import SettingsRenderer from "./modules/settings/SettingsRenderer"
import TabEditorElements from "./modules/tab_editor/TabEditorElements"
import TreeElements from "./modules/tree/TreeElements"
import SettingsElements from "./modules/settings/SettingsElements"
import MenuElements from "./modules/menu/MenuElements"
import WindowFacade from "./modules/window/WindowFacade"
import WindowElements from "./modules/window/WindowElements"
import InfoElements from "./modules/info/InfoElements"
import SideFacade from "./modules/side/SideFacade"
import SideElements from "./modules/side/SideElements"
import SideStore from "./modules/side/SideStore"
import InfoFacade from "./modules/info/InfoFacade"
import WindowRenderer from "./modules/window/WindowRenderer"
import Dispatcher from "./dispatch/Dispatcher"

const diContainer = new Container()

diContainer.bind(DI_KEYS.MenuElements).to(MenuElements).inSingletonScope()

diContainer.bind(DI_KEYS.FocusManager).to(FocusManager).inSingletonScope()

diContainer.bind(DI_KEYS.ZoomManager).to(ZoomManager).inSingletonScope()

diContainer.bind(DI_KEYS.ShortcutRegistry).to(ShortcutRegistry).inSingletonScope()

diContainer.bind(DI_KEYS.InfoFacade).to(InfoFacade).inSingletonScope()
diContainer.bind(DI_KEYS.InfoElements).to(InfoElements).inSingletonScope()

diContainer.bind(DI_KEYS.TabEditorFacade).to(TabEditorFacade).inSingletonScope()
diContainer.bind(DI_KEYS.TabEditorStore).to(TabEditorStore).inSingletonScope()
diContainer.bind(DI_KEYS.TabEditorRenderer).to(TabEditorRenderer).inSingletonScope()
diContainer.bind(DI_KEYS.TabEditorElements).to(TabEditorElements).inSingletonScope()
diContainer.bind(DI_KEYS.TabDragManager).to(TabDragManager).inSingletonScope()

diContainer.bind(DI_KEYS.TreeFacade).to(TreeFacade).inSingletonScope()
diContainer.bind(DI_KEYS.TreeStore).to(TreeStore).inSingletonScope()
diContainer.bind(DI_KEYS.TreeRenderer).to(TreeRenderer).inSingletonScope()
diContainer.bind(DI_KEYS.TreeElements).to(TreeElements).inSingletonScope()
diContainer.bind(DI_KEYS.TreeDragManager).to(TreeDragManager).inSingletonScope()

diContainer.bind(DI_KEYS.SideFacade).to(SideFacade).inSingletonScope()
diContainer.bind(DI_KEYS.SideStore).to(SideStore).inSingletonScope()
diContainer.bind(DI_KEYS.SideElements).to(SideElements).inSingletonScope()

diContainer.bind(DI_KEYS.SettingsFacade).to(SettingsFacade).inSingletonScope()
diContainer.bind(DI_KEYS.SettingsStore).to(SettingsStore).inSingletonScope()
diContainer.bind(DI_KEYS.SettingsRenderer).to(SettingsRenderer).inSingletonScope()
diContainer.bind(DI_KEYS.SettingsElements).to(SettingsElements).inSingletonScope()

diContainer.bind(DI_KEYS.WindowFacade).to(WindowFacade).inSingletonScope()
diContainer.bind(DI_KEYS.WindowStore).to(WindowStore).inSingletonScope()
diContainer.bind(DI_KEYS.WindowRenderer).to(WindowRenderer).inSingletonScope()
diContainer.bind(DI_KEYS.WindowElements).to(WindowElements).inSingletonScope()

diContainer.bind(DI_KEYS.CommandManager).to(CommandManager).inSingletonScope()
diContainer.bind(DI_KEYS.Dispatcher).to(Dispatcher).inSingletonScope()

export default diContainer
