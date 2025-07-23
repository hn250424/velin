import { electronAPI } from "@shared/constants/electronAPI"
import ICommand from "./ICommand"
import TreeLayoutManager from "../modules/managers/TreeLayoutManager"
import TabEditorManager from "../modules/managers/TabEditorManager"
import TrashMap from "@shared/types/TrashMap"
import Response from "@shared/types/Response"

export default class DeleteCommand implements ICommand {
    private trashMap: TrashMap[] | null

    constructor(
        private treeLayoutManager: TreeLayoutManager,
        private tabEditorManager: TabEditorManager,
        private selectedIndices: number[],
    ) {

    }

    async execute(): Promise<void> {
        const pathsToDelete: string[] = []
        const idsToDelete: number[] = []
        for (let i = 0; i < this.selectedIndices.length; i++) {
            const viewModel = this.treeLayoutManager.getTreeViewModelByIndex(this.selectedIndices[i])
            pathsToDelete.push(viewModel.path)
            const tabEditorView = this.tabEditorManager.getTabEditorViewByPath(viewModel.path)
            if (tabEditorView) idsToDelete.push(tabEditorView.getId())
        }

        const response: Response<TrashMap[] | null> = await window[electronAPI.channel].delete(pathsToDelete)
        if (!response.result) return
        this.trashMap = response.data

        for (let i = 0; i < idsToDelete.length; i++) {
            this.tabEditorManager.removeTab(idsToDelete[i])
        }
        this.treeLayoutManager.delete(this.selectedIndices)
        this.treeLayoutManager.clearSelectedIndices()

        const tabEditorDto = this.tabEditorManager.getAllTabEditorData()
        await window[electronAPI.channel].syncTabSessionFromRenderer(tabEditorDto)

        const treeDto = this.treeLayoutManager.toTreeDto(this.treeLayoutManager.extractTreeViewModel())
        await window[electronAPI.channel].syncTreeSessionFromRenderer(treeDto)
    }

    async undo(): Promise<void> {
        const result = await window[electronAPI.channel].undo_delete(this.trashMap)
        if (!result) return

        const newTreeSession = await window[electronAPI.channel].getSyncedTreeSession()
        if (newTreeSession) {
            const viewModel = this.treeLayoutManager.toTreeViewModel(newTreeSession)
            this.treeLayoutManager.renderTreeData(viewModel)
            this.treeLayoutManager.restoreFlattenArrayAndMaps(viewModel)
        }
    }
}