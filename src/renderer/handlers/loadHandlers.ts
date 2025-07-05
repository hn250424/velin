import TabEditorDto from "@shared/dto/TabEditorDto"
import { electronAPI } from "@shared/constants/electronAPI"
import TabEditorManager from "../modules/features/TabEditorManager"
import TreeDto from "@shared/dto/TreeDto"
import TreeLayoutMaanger from "../modules/features/TreeLayoutManger"

export default function registerLoadHandlers() {
    window[electronAPI.channel].session(async (tabs: TabEditorDto[], tree: TreeDto) => {
        if (tabs.length > 0) {
            const tabEditorManager = TabEditorManager.getInstance()
            await tabEditorManager.restoreTabs(tabs)
        }

        if (tree) {
            const treeLayoutManager = TreeLayoutMaanger.getInstance()
            treeLayoutManager.renderTreeData(tree)
            treeLayoutManager.restoreFlattenTree(tree)
        }

        window[electronAPI.channel].showMainWindow()
    })
}