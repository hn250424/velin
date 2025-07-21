import { electronAPI } from "@shared/constants/electronAPI"
import ICommand from "./ICommand"
import TreeLayoutManager from "../modules/manager/TreeLayoutManager"
import TabEditorManager from "../modules/manager/TabEditorManager"
import TrashMap from "@shared/types/TrashMap"
import Response from "@shared/types/Response"

export default class DeleteCommand implements ICommand {
    private pathsToDelete: string[] = []
    private idsToDelete: number[] = []
    private trashMap: TrashMap[] | null

    constructor(
        private treeLayoutManager: TreeLayoutManager,
        private tabEditorManager: TabEditorManager,
        private selectedIndices: number[],
    ) {
        for (let i = 0; i < this.selectedIndices.length; i++) {
            const viewModel = this.treeLayoutManager.getTreeViewModelByIndex(this.selectedIndices[i])
            this.pathsToDelete.push(viewModel.path)
            const tabEditorView = this.tabEditorManager.getTabEditorViewByPath(viewModel.path)
            if (tabEditorView) this.idsToDelete.push(tabEditorView.getId())
        }
    }

    async execute(): Promise<void> {
        const response: Response<TrashMap[] | null> = await window[electronAPI.channel].delete(this.pathsToDelete)
        if (!response.result) return
        this.trashMap = response.data

        for (let i = 0; i < this.idsToDelete.length; i++) {
            this.tabEditorManager.removeTab(this.idsToDelete[i])
        }
        this.treeLayoutManager.delete(this.selectedIndices)
        this.treeLayoutManager.clearMultiSelectedIndex()

        const tabEditorDto = this.tabEditorManager.getAllTabEditorData()
        await window[electronAPI.channel].syncTabSession(tabEditorDto)

        const treeDto = this.treeLayoutManager.toTreeDto(this.treeLayoutManager.extractTreeViewModel())
        await window[electronAPI.channel].syncTreeSession(treeDto)
    }

    async undo(): Promise<void> {
        const result = await window[electronAPI.channel].undo_delete(this.trashMap)
        if (! result) return
        
        const newTreeSession = await window[electronAPI.channel].requestTreeSession()
        if (newTreeSession) {
            const viewModel = this.treeLayoutManager.toTreeViewModel(newTreeSession)
            this.treeLayoutManager.renderTreeData(viewModel)
            this.treeLayoutManager.restoreFlattenArrayAndMaps(viewModel)
        }
    }
}