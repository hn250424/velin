import type { ICommand } from "./index"
import type TrashMap from "@shared/types/TrashMap"
import type Response from "@shared/types/Response"
import type { TreeViewModel } from "../viewmodels/TreeViewModel"

import { TabEditorFacade, TreeFacade } from "../modules"

type DeletedItemInfo = {
	path: string
	isDirectory: boolean
	parentPath: string
}

export class DeleteCommand implements ICommand {
	private trashMap: TrashMap[] | null = null
	private deletedItems: DeletedItemInfo[] = []

	constructor(
		private treeFacade: TreeFacade,
		private tabEditorFacade: TabEditorFacade,
		private selectedIndices: number[]
	) {}

	async execute(): Promise<void> {
		const pathsToDelete: string[] = []
		const idsToDelete: number[] = []
		for (let i = 0; i < this.selectedIndices.length; i++) {
			const viewModel = this.treeFacade.getTreeViewModelByIndex(this.selectedIndices[i])
			pathsToDelete.push(viewModel.path)
			idsToDelete.push(...this.getIdsFromTreeViewModel(viewModel))

			// Save metadata for undo
			this.deletedItems.push({
				path: viewModel.path,
				isDirectory: viewModel.directory,
				parentPath: window.utils.getDirName(viewModel.path),
			})
		}

		pathsToDelete.sort((a, b) => b.localeCompare(a))

		const response: Response<TrashMap[] | null> = await window.rendererToMain.delete(pathsToDelete)
		if (!response.result) return
		this.trashMap = response.data

		for (let i = 0; i < idsToDelete.length; i++) {
			this.tabEditorFacade.removeTab(idsToDelete[i])
		}
		this.treeFacade.applyDelete(this.selectedIndices)
		this.treeFacade.clearSelectedIndices()

		const tabEditorsDto = this.tabEditorFacade.getTabEditorsDto()
		await window.rendererToMain.syncTabSessionFromRenderer(tabEditorsDto)

		const viewModel = this.treeFacade.getRootTreeViewModel()
		const treeDto = this.treeFacade.toTreeDto(viewModel)
		await window.rendererToMain.syncTreeSessionFromRenderer(treeDto)
	}

	async undo(): Promise<void> {
		const result = await window.rendererToMain.undo_delete(this.trashMap)
		if (!result) return

		for (const item of this.deletedItems) {
			this.treeFacade.applyCreate(item.parentPath, item.path, item.isDirectory)
		}

		const viewModel = this.treeFacade.getRootTreeViewModel()
		const treeDto = this.treeFacade.toTreeDto(viewModel)
		await window.rendererToMain.syncTreeSessionFromRenderer(treeDto)
	}

	private getIdsFromTreeViewModel(vm: TreeViewModel, arr: number[] = []) {
		if (vm.directory && vm.children) {
			for (const child of vm.children) {
				this.getIdsFromTreeViewModel(child, arr)
			}
		}

		const tabEditorView = this.tabEditorFacade.getTabEditorViewByPath(vm.path)
		if (tabEditorView) arr.push(tabEditorView.getId())

		return arr
	}
}
