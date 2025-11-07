import TreeFacade from "../modules/tree/TreeFacade"
import TabEditorFacade from "../modules/tab_editor/TabEditorFacade"
import ICommand from "./ICommand"

export default class CreateCommand implements ICommand {
    private createdPath: string = ""
    private openedTabId: number | null = null

    constructor(
        private treeFacade: TreeFacade,
        private tabEditorFacade: TabEditorFacade,
        private parentPath: string,
        private name: string,
        private isDirectory: boolean,
    ) { }

    async execute() {
        const newPath = window.utils.getJoinedPath(this.parentPath, this.name)
        this.createdPath = newPath
        await window.rendererToMain.create(newPath, this.isDirectory)
        const newTreeSession = await window.rendererToMain.getSyncedTreeSession()
        if (newTreeSession) {
            const viewModel = this.treeFacade.toTreeViewModel(newTreeSession)
            this.treeFacade.renderTreeData(viewModel)
            this.treeFacade.loadFlattenArrayAndMaps(viewModel)
        }
    }

    async undo() {
        if (!this.createdPath) {
            console.warn('Cannot undo: no created path stored')
            return
        }

        try {
            await window.rendererToMain.delete([this.createdPath])
            
            const newTreeSession = await window.rendererToMain.getSyncedTreeSession()
            if (newTreeSession) {
                const viewModel = this.treeFacade.toTreeViewModel(newTreeSession)
                this.treeFacade.renderTreeData(viewModel)
                this.treeFacade.loadFlattenArrayAndMaps(viewModel)
            }

            if (this.openedTabId !== null) {
                const tabEditorViewModel = this.tabEditorFacade.getTabEditorViewModelById(this.openedTabId)
                const tabEditorView = this.tabEditorFacade.getTabEditorViewByPath(tabEditorViewModel.filePath)
                this.tabEditorFacade.removeTab(tabEditorView.getId())
            }

        } catch (error) {
            console.error('Undo create failed:', error)
        }
    }

    setOpenedTabId(id: number) {
        this.openedTabId = id
    }
}