import { inject, injectable } from "inversify";
import DI_KEYS from "../../constants/di_keys";
import FocusManager from "../state/FocusManager";
import TabEditorManager from "../manager/TabEditorManager";
import TreeLayoutManager from "../manager/TreeLayoutManager";
import performNewTab from "../../actions/performNewTab";

type CommandSource = 'shortcut' | 'menu' | 'element' | 'context_menu' | 'programmatic'
type CommandName =
    | 'newTab'
    | 'openFile'
    | 'openDirectory'

/**
 * CommandDispatcher centrally handles commands
 * triggered from multiple input sources (keyboard shortcuts, menus, context menus, etc.).
 * 
 * - Commands invoked via multiple UI paths should go through this dispatcher
 *   to ensure consistent handling and side effect management.
 * 
 * - Commands triggered from a single, localized UI event without duplication
 *   can be handled directly in their respective event handlers without dispatching.
 */
@injectable()
export default class CommandDispatcher {

    constructor(
        @inject(DI_KEYS.FocusManager) private readonly focusManager: FocusManager,
        @inject(DI_KEYS.TabEditorManager) private readonly tabEditorManager: TabEditorManager,
        @inject(DI_KEYS.TreeLayoutManager) private readonly treeLayoutManager: TreeLayoutManager
    ) {

    }

    async execute(command: CommandName, source: CommandSource, args?: any) {
        switch (command) {
            case 'newTab':
                console.log(source)
                await performNewTab(this.tabEditorManager)
                break


            default:
                console.warn(`Unknown command: ${command}`)
        }
    }
}