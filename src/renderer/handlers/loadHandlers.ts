import { TabEditorDto, TabEditorsDto } from "@shared/dto/TabEditorDto"
import { electronAPI } from "@shared/constants/electronAPI"
import TabEditorManager from "../modules/manager/TabEditorManager"
import TreeDto from "@shared/dto/TreeDto"
import TreeLayoutManager from "../modules/manager/TreeLayoutManager"
import CommandDispatcher from "../modules/command/CommandDispatcher"

export default function registerLoadHandlers(commandDispatcher: CommandDispatcher, tabEditorManager: TabEditorManager, treeLayoutManager: TreeLayoutManager) {
    window[electronAPI.channel].session(async (tabs: TabEditorsDto, tree: TreeDto) => {
        if (tabs) {
            await tabEditorManager.restoreTabs(tabs)
        }

        if (tree) {
            const viewModel = treeLayoutManager.toTreeViewModel(tree)
            treeLayoutManager.renderTreeData(viewModel)
            treeLayoutManager.restoreFlattenArrayAndMaps(viewModel)
        }

        window[electronAPI.channel].showMainWindow()
    })
}