import { electronAPI } from "@shared/constants/electronAPI"
import ICommand from "./ICommand"
import TreeLayoutManager from "../modules/managers/TreeLayoutManager"
import TabEditorManager from "../modules/managers/TabEditorManager"
import TreeViewModel from "../viewmodels/TreeViewModel"
import ClipboardMode from "@shared/types/ClipboardMode"

type UndoInfo = {
    src: string
    dest: string
    mode: ClipboardMode
    isDir: boolean
}

export default class PasteCommand implements ICommand {
    private undoInfos: UndoInfo[] = []

    constructor(
        private treeLayoutManager: TreeLayoutManager,
        private tabEditorManager: TabEditorManager,
        private targetViewModel: TreeViewModel,
        private selectedViewModels: TreeViewModel[],
        private clipboardMode: ClipboardMode
    ) { }

    async execute(): Promise<void> {
        const targetDto = this.treeLayoutManager.toTreeDto(this.targetViewModel)
        const selectedDtos = this.selectedViewModels.map(viewModel => {
            return this.treeLayoutManager.toTreeDto(viewModel)
        })

        const result = await window[electronAPI.channel].pasteTree(targetDto, selectedDtos, this.clipboardMode)

        if (result) {
            for (const preDto of selectedDtos) {
                const oldPath = preDto.path
                const newPath = window[electronAPI.channel].getJoinedPath(targetDto.path, preDto.name) // Target must be directory.

                this.undoInfos.push({
                    src: oldPath,
                    dest: newPath,
                    mode: this.clipboardMode,
                    isDir: preDto.directory
                })

                const view = this.tabEditorManager.getTabEditorViewByPath(oldPath)

                if (view) {
                    view.tabDiv.title = newPath
                    const viewModel = this.tabEditorManager.getTabEditorViewModelById(view.getId())
                    if (viewModel) {
                        viewModel.filePath = newPath
                    }
                }

                this.tabEditorManager.deleteTabEditorViewByPath(oldPath)
                this.tabEditorManager.setTabEditorViewByPath(newPath, view)
            }

            const newTreeSession = await window[electronAPI.channel].getSyncedTreeSession()
            if (newTreeSession) {
                const viewModel = this.treeLayoutManager.toTreeViewModel(newTreeSession)
                this.treeLayoutManager.renderTreeData(viewModel)
                this.treeLayoutManager.restoreFlattenArrayAndMaps(viewModel)
            }
        }
    }

    async undo(): Promise<void> {
        for (let i = this.undoInfos.length - 1; i >= 0; i--) {
            const { src, dest, mode, isDir } = this.undoInfos[i]

            try {
                if (mode === 'cut') {
                    await window[electronAPI.channel].copyTree(dest, src)
                }

                await window[electronAPI.channel].deletePermanently(dest)

                const view = this.tabEditorManager.getTabEditorViewByPath(dest)
                if (view) {
                    view.tabDiv.title = src
                    const viewModel = this.tabEditorManager.getTabEditorViewModelById(view.getId())
                    if (viewModel) {
                        viewModel.filePath = src
                    }

                    this.tabEditorManager.deleteTabEditorViewByPath(dest)
                    this.tabEditorManager.setTabEditorViewByPath(src, view)
                }
            } catch (err) {
                console.error('Undo failed:', err)
            }
        }

        const newTreeSession = await window[electronAPI.channel].getSyncedTreeSession()
        if (newTreeSession) {
            const viewModel = this.treeLayoutManager.toTreeViewModel(newTreeSession)
            this.treeLayoutManager.renderTreeData(viewModel)
            this.treeLayoutManager.restoreFlattenArrayAndMaps(viewModel)
        }
    }
}