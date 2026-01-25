import "reflect-metadata";
import DI_KEYS from "./constants/di_keys";
import { Container } from "inversify";
import FocusManager from "./modules/state/FocusManager";
import CommandManager from "./CommandManager";
import TabEditorFacade from "./modules/tab_editor/TabEditorFacade";
import TreeFacade from "./modules/tree/TreeFacade";
import ShortcutRegistry from "./modules/input/ShortcutRegistry";
import TabDragManager from "./modules/tab_editor/TabDragManager";
import TreeDragManager from "./modules/tree/TreeDragManager";
import SideState from "./modules/state/SideState";
import WindowState from "./modules/state/WindowState";
import ZoomManager from "./modules/layout/ZoomManager";
import TabEditorRenderer from "./modules/tab_editor/TabEditorRenderer";
import TabEditorStore from "./modules/tab_editor/TabEditorStore";
import TreeRenderer from "./modules/tree/TreeRenderer";
import TreeStore from "./modules/tree/TreeStore";
import SettingsFacade from "./modules/settings/SettingsFacade";
import SettingsStore from "./modules/settings/SettingsStore";
import SettingsRenderer from "./modules/settings/SettingsRenderer";

const diContainer = new Container();

diContainer.bind(DI_KEYS.FocusManager).to(FocusManager).inSingletonScope();
diContainer.bind(DI_KEYS.SideState).to(SideState).inSingletonScope();
diContainer.bind(DI_KEYS.WindowState).to(WindowState).inSingletonScope();

diContainer.bind(DI_KEYS.ZoomManager).to(ZoomManager).inSingletonScope();

diContainer.bind(DI_KEYS.ShortcutRegistry).to(ShortcutRegistry).inSingletonScope();

diContainer.bind(DI_KEYS.TabEditorFacade).to(TabEditorFacade).inSingletonScope();
diContainer.bind(DI_KEYS.TabEditorRenderer).to(TabEditorRenderer).inSingletonScope();
diContainer.bind(DI_KEYS.TabEditorStore).to(TabEditorStore).inSingletonScope();
diContainer.bind(DI_KEYS.TabDragManager).to(TabDragManager).inSingletonScope();

diContainer.bind(DI_KEYS.TreeFacade).to(TreeFacade).inSingletonScope();
diContainer.bind(DI_KEYS.TreeRenderer).to(TreeRenderer).inSingletonScope();
diContainer.bind(DI_KEYS.TreeStore).to(TreeStore).inSingletonScope();
diContainer.bind(DI_KEYS.TreeDragManager).to(TreeDragManager).inSingletonScope();

diContainer.bind(DI_KEYS.SettingsFacade).to(SettingsFacade).inSingletonScope();
diContainer.bind(DI_KEYS.SettingsRenderer).to(SettingsRenderer).inSingletonScope();
diContainer.bind(DI_KEYS.SettingsStore).to(SettingsStore).inSingletonScope();

diContainer.bind(DI_KEYS.CommandManager).to(CommandManager).inSingletonScope();

export default diContainer;
