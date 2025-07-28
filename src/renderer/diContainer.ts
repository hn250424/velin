import 'reflect-metadata'
import DI_KEYS from './constants/di_keys'
import { Container } from 'inversify'
import FocusManager from './modules/state/FocusManager'
import CommandDispatcher from './modules/command/CommandDispatcher'
import TabEditorManager from './modules/managers/TabEditorManager'
import TreeLayoutManager from './modules/managers/TreeLayoutManager'
import ShortcutRegistry from './modules/input/ShortcutRegistry'
import FindReplaceState from './modules/state/FindReplaceState'

const diContainer = new Container()

diContainer.bind<FocusManager>(DI_KEYS.FocusManager).to(FocusManager).inSingletonScope()
diContainer.bind<FindReplaceState>(DI_KEYS.FindReplaceState).to(FindReplaceState).inRequestScope()

diContainer.bind<ShortcutRegistry>(DI_KEYS.ShortcutRegistry).to(ShortcutRegistry).inSingletonScope()
diContainer.bind<TabEditorManager>(DI_KEYS.TabEditorManager).to(TabEditorManager).inSingletonScope()
diContainer.bind<TreeLayoutManager>(DI_KEYS.TreeLayoutManager).to(TreeLayoutManager).inSingletonScope()

diContainer.bind<CommandDispatcher>(DI_KEYS.CommandDispatcher).to(CommandDispatcher).inSingletonScope()


export default diContainer
