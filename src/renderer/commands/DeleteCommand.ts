import ICommand from "./ICommand"
import TreeFacade from "../modules/tree/TreeFacade"
import TabEditorFacade from "../modules/tab_editor/TabEditorFacade"
import TrashMap from "@shared/types/TrashMap"
import Response from "@shared/types/Response"

export default class DeleteCommand implements ICommand {
    private trashMap: TrashMap[] | null

    constructor(
        private treeFacade: TreeFacade,
        private tabEditorFacade: TabEditorFacade,
        private selectedIndices: number[],
    ) {

    }

    async execute(): Promise<void> {
        const pathsToDelete: string[] = []
        const idsToDelete: number[] = []
        for (let i = 0; i < this.selectedIndices.length; i++) {
            const viewModel = this.treeFacade.getTreeViewModelByIndex(this.selectedIndices[i])
            pathsToDelete.push(viewModel.path)
            const tabEditorView = this.tabEditorFacade.getTabEditorViewByPath(viewModel.path)
            if (tabEditorView) idsToDelete.push(tabEditorView.getId())
        }

        const response: Response<TrashMap[] | null> = await window.rendererToMain.delete(pathsToDelete)
        if (!response.result) return
        this.trashMap = response.data

        for (let i = 0; i < idsToDelete.length; i++) {
            this.tabEditorFacade.removeTab(idsToDelete[i])
        }
        this.treeFacade.delete(this.selectedIndices)
        this.treeFacade.clearSelectedIndices()

        const tabEditorDto = this.tabEditorFacade.getAllTabEditorData()
        await window.rendererToMain.syncTabSessionFromRenderer(tabEditorDto)

        const treeDto = this.treeFacade.toTreeDto(this.treeFacade.extractTreeViewModel())
        await window.rendererToMain.syncTreeSessionFromRenderer(treeDto)
    }

    async undo(): Promise<void> {
        const result = await window.rendererToMain.undo_delete(this.trashMap)
        if (!result) return

        const newTreeSession = await window.rendererToMain.getSyncedTreeSession()
        if (newTreeSession) {
            const viewModel = this.treeFacade.toTreeViewModel(newTreeSession)
            this.treeFacade.renderTreeData(viewModel)
            this.treeFacade.loadFlattenArrayAndMaps(viewModel)
        }
    }
}