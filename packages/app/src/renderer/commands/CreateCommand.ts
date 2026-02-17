import type { ICommand } from "./index"
import { TabEditorFacade, TreeFacade } from "../modules"

export class CreateCommand implements ICommand {
	private createdPath = ""
	private openedTabId: number | null = null

	constructor(
		private treeFacade: TreeFacade,
		private tabEditorFacade: TabEditorFacade,
		private parentPath: string,
		private name: string,
		private isDirectory: boolean
	) {}

	async execute() {
		this.createdPath = window.utils.getJoinedPath(this.parentPath, this.name)
		await window.rendererToMain.create(this.createdPath, this.isDirectory)

		const newTreeSession = await window.rendererToMain.getSyncedTreeSession()
		if (newTreeSession) {
			const viewModel = this.treeFacade.toTreeViewModel(newTreeSession)
			this.treeFacade.renderTreeData(viewModel)
			this.treeFacade.loadFlattenArrayAndMaps(viewModel)
		}
	}

	async undo() {
		if (!this.createdPath) return

		await window.rendererToMain.delete([this.createdPath])

		const newTreeSession = await window.rendererToMain.getSyncedTreeSession()
		if (newTreeSession) {
			const viewModel = this.treeFacade.toTreeViewModel(newTreeSession)
			this.treeFacade.renderTreeData(viewModel)
			this.treeFacade.loadFlattenArrayAndMaps(viewModel)
		}

		if (this.openedTabId !== null) {
			const tabEditorViewModel = this.tabEditorFacade.getTabEditorViewModelById(this.openedTabId)!
			const tabEditorView = this.tabEditorFacade.getTabEditorViewByPath(tabEditorViewModel.filePath)!
			this.tabEditorFacade.removeTab(tabEditorView.getId())
		}
	}

	setOpenedTabId(id: number) {
		this.openedTabId = id
	}
}
