import type ICommand from "./ICommand";
import type TrashMap from "@shared/types/TrashMap";
import type Response from "@shared/types/Response";
import type { TreeViewModel} from "../viewmodels/TreeViewModel";

import TreeFacade from "../modules/tree/TreeFacade";
import TabEditorFacade from "../modules/tab_editor/TabEditorFacade";

export default class DeleteCommand implements ICommand {
	private trashMap: TrashMap[] | null = null;

	constructor(
		private treeFacade: TreeFacade,
		private tabEditorFacade: TabEditorFacade,
		private selectedIndices: number[]
	) {}

	async execute(): Promise<void> {
		const pathsToDelete: string[] = [];
		const idsToDelete: number[] = [];
		for (let i = 0; i < this.selectedIndices.length; i++) {
			const viewModel = this.treeFacade.getTreeViewModelByIndex(this.selectedIndices[i]);
			pathsToDelete.push(viewModel.path);
			idsToDelete.push(...this.getIdsFromTreeViewModel(viewModel));
		}

		const response: Response<TrashMap[] | null> = await window.rendererToMain.delete(pathsToDelete);
		if (!response.result) return;
		this.trashMap = response.data;

		for (let i = 0; i < idsToDelete.length; i++) {
			this.tabEditorFacade.removeTab(idsToDelete[i]);
		}
		this.treeFacade.delete(this.selectedIndices);
		this.treeFacade.clearSelectedIndices();

		const tabEditorDto = this.tabEditorFacade.getAllTabEditorData();
		await window.rendererToMain.syncTabSessionFromRenderer(tabEditorDto);

		const vm = this.treeFacade.extractTreeViewModel();
		const treeDto = vm ? this.treeFacade.toTreeDto(vm) : null;
		await window.rendererToMain.syncTreeSessionFromRenderer(treeDto);
	}

	async undo(): Promise<void> {
		const result = await window.rendererToMain.undo_delete(this.trashMap);
		if (!result) return;

		const newTreeSession = await window.rendererToMain.getSyncedTreeSession();
		if (newTreeSession) {
			const viewModel = this.treeFacade.toTreeViewModel(newTreeSession);
			this.treeFacade.renderTreeData(viewModel);
			this.treeFacade.loadFlattenArrayAndMaps(viewModel);
		}
	}

	private getIdsFromTreeViewModel(vm: TreeViewModel, arr: number[] = []) {
		if (vm.directory && vm.children) {
			for (const child of vm.children) {
				this.getIdsFromTreeViewModel(child, arr);
			}
		}

		const tabEditorView = this.tabEditorFacade.getTabEditorViewByPath(vm.path);
		if (tabEditorView) arr.push(tabEditorView.getId());

		return arr;
	}
}
