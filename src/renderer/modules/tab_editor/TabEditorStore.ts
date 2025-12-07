import { injectable } from "inversify";
import TabEditorViewModel from "../../viewmodels/TabEditorViewModel";
import { TabEditorDto } from "@shared/dto/TabEditorDto";

@injectable()
export default class TabEditorStore {
	private _idToTabEditorViewModelMap: Map<number, TabEditorViewModel> =
		new Map();

	private _activeTabId = -1;
	private _activeTabIndex = -1;
	private _contextTabId = -1;

	toTabEditorViewModel(dto: TabEditorDto): TabEditorViewModel {
		return {
			id: dto.id,
			isModified: dto.isModified,
			filePath: dto.filePath,
			fileName: dto.fileName,
			isBinary: dto.isBinary,
			initialContent: this._idToTabEditorViewModelMap.get(dto.id)
				.initialContent,
		};
	}

	get activeTabId() {
		return this._activeTabId;
	}

	set activeTabId(id: number) {
		this._activeTabId = id;
	}

	get activeTabIndex() {
		return this._activeTabIndex;
	}

	set activeTabIndex(index: number) {
		this._activeTabIndex = index;
	}

	get contextTabId() {
		return this._contextTabId;
	}

	set contextTabId(id: number) {
		this._contextTabId = id;
	}

	removeContextTabId() {
		this._contextTabId = -1;
	}

	get idToTabEditorViewModelMap(): ReadonlyMap<number, TabEditorViewModel> {
		return this._idToTabEditorViewModelMap;
	}

	getTabEditorViewModelById(id: number) {
		return this._idToTabEditorViewModelMap.get(id);
	}

	setTabEditorViewModelById(id: number, viewModel: TabEditorViewModel) {
		this._idToTabEditorViewModelMap.set(id, viewModel);
	}

	deleteTabEditorViewModelById(id: number) {
		this._idToTabEditorViewModelMap.delete(id);
	}
}
