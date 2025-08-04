import TreeLayoutManager from "../modules/domains/TreeLayoutManager"
import ICommand from "./ICommand"

export default class CreateCommand implements ICommand {
    private createdPath: string = ""

    constructor(
        private treeLayoutManager: TreeLayoutManager,
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
            const viewModel = this.treeLayoutManager.toTreeViewModel(newTreeSession)
            this.treeLayoutManager.renderTreeData(viewModel)
            this.treeLayoutManager.loadFlattenArrayAndMaps(viewModel)
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
                const viewModel = this.treeLayoutManager.toTreeViewModel(newTreeSession)
                this.treeLayoutManager.renderTreeData(viewModel)
                this.treeLayoutManager.loadFlattenArrayAndMaps(viewModel)
            }
        } catch (error) {
            console.error('Undo create failed:', error)
        }
    }
}