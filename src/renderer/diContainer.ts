import 'reflect-metadata'
import DI_KEYS from './constants/di_keys'
import { Container } from 'inversify'
import FocusManager from './modules/state/FocusManager'
import CommandDispatcher from './CommandDispatcher'
import TabEditorManager from './modules/domains/TabEditorManager'
import TreeLayoutManager from './modules/domains/TreeLayoutManager'
import ShortcutRegistry from './modules/input/ShortcutRegistry'
import FindReplaceState from './modules/state/FindReplaceState'
import TabDragManager from './modules/drag/TabDragManager'
import TreeDragManager from './modules/drag/TreeDragManager'
import SideState from './modules/state/SideState'
import WindowLayoutManager from './modules/state/WindowLayoutManager'
import ZoomManager from './modules/layout/ZoomManager'

const diContainer = new Container()

diContainer.bind(DI_KEYS.FocusManager).to(FocusManager).inSingletonScope()
diContainer.bind(DI_KEYS.FindReplaceState).to(FindReplaceState).inSingletonScope()
diContainer.bind(DI_KEYS.SideState).to(SideState).inSingletonScope()
diContainer.bind(DI_KEYS.WindowLayoutManager).to(WindowLayoutManager).inSingletonScope()

diContainer.bind(DI_KEYS.ZoomManager).to(ZoomManager).inSingletonScope()

diContainer.bind(DI_KEYS.ShortcutRegistry).to(ShortcutRegistry).inSingletonScope()

diContainer.bind(DI_KEYS.TabDragManager).to(TabDragManager).inSingletonScope()
diContainer.bind(DI_KEYS.TreeDragManager).to(TreeDragManager).inSingletonScope()

diContainer.bind(DI_KEYS.TabEditorManager).to(TabEditorManager).inSingletonScope()
diContainer.bind(DI_KEYS.TreeLayoutManager).to(TreeLayoutManager).inSingletonScope()

diContainer.bind(DI_KEYS.CommandDispatcher).to(CommandDispatcher).inSingletonScope()

export default diContainer
