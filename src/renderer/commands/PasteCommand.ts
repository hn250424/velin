import ICommand from "./ICommand"
import TreeFacade from "../modules/tree/TreeFacade"
import TabEditorFacade from "../modules/tab_editor/TabEditorFacade"
import TreeViewModel from "../viewmodels/TreeViewModel"
import ClipboardMode from "@shared/types/ClipboardMode"
import Response from "@shared/types/Response"

type UndoInfo = {
    src: string
    dest: string
    mode: ClipboardMode
    isDir: boolean
}

export default class PasteCommand implements ICommand {
    private undoInfos: UndoInfo[] = []

    constructor(
        private treeFacade: TreeFacade,
        private tabEditorFacade: TabEditorFacade,
        private targetViewModel: TreeViewModel,
        private selectedViewModels: TreeViewModel[],
        private clipboardMode: ClipboardMode
    ) { }

    async execute(): Promise<void> {
        const targetDto = this.treeFacade.toTreeDto(this.targetViewModel)
        const selectedDtos = this.selectedViewModels.map(viewModel => {
            return this.treeFacade.toTreeDto(viewModel)
        })

        const response: Response<string[]> = await window.rendererToMain.pasteTree(targetDto, selectedDtos, this.clipboardMode)
        
        if (response.result) {
            const newPaths = response.data

            for (let i = 0; i < selectedDtos.length; i++) {
                const oldPath = selectedDtos[i].path
                const newPath = newPaths[i]

                this.undoInfos.push({
                    src: oldPath,
                    dest: newPath,
                    mode: this.clipboardMode,
                    isDir: selectedDtos[i].directory
                })

                const view = this.tabEditorFacade.getTabEditorViewByPath(oldPath)

                if (view) {
                    view.tabDiv.title = newPath
                    const viewModel = this.tabEditorFacade.getTabEditorViewModelById(view.getId())
                    if (viewModel) {
                        viewModel.filePath = newPath
                    }
                }

                this.tabEditorFacade.deleteTabEditorViewByPath(oldPath)
                this.tabEditorFacade.setTabEditorViewByPath(newPath, view)
            }

            const newTreeSession = await window.rendererToMain.getSyncedTreeSession()
            if (newTreeSession) {
                const viewModel = this.treeFacade.toTreeViewModel(newTreeSession)
                this.treeFacade.renderTreeData(viewModel)
                this.treeFacade.loadFlattenArrayAndMaps(viewModel)
            }
        }
    }

    async undo(): Promise<void> {
        for (let i = this.undoInfos.length - 1; i >= 0; i--) {
            const { src, dest, mode, isDir } = this.undoInfos[i]

            try {
                if (mode === 'cut') {
                    await window.rendererToMain.copyTree(dest, src)
                }

                await window.rendererToMain.deletePermanently(dest)

                const view = this.tabEditorFacade.getTabEditorViewByPath(dest)
                if (view) {
                    view.tabDiv.title = src
                    const viewModel = this.tabEditorFacade.getTabEditorViewModelById(view.getId())
                    if (viewModel) {
                        viewModel.filePath = src
                    }

                    this.tabEditorFacade.deleteTabEditorViewByPath(dest)
                    this.tabEditorFacade.setTabEditorViewByPath(src, view)
                }
            } catch (err) {
                console.error('Undo failed:', err)
            }
        }

        const newTreeSession = await window.rendererToMain.getSyncedTreeSession()
        if (newTreeSession) {
            const viewModel = this.treeFacade.toTreeViewModel(newTreeSession)
            this.treeFacade.renderTreeData(viewModel)
            this.treeFacade.loadFlattenArrayAndMaps(viewModel)
        }
    }
}