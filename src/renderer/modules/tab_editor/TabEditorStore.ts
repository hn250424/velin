import { injectable } from "inversify"
import TabViewModel from "../../viewmodels/TabViewModel"
import { TabEditorDto } from "@shared/dto/TabEditorDto"

@injectable()
export default class TabEditorStore {
    private _idToTabViewModelMap: Map<number, TabViewModel> = new Map()

    private _activeTabId = -1
    private _activeTabIndex = -1
    private _contextTabId = -1

    constructor() { }

    // toTabEditorDto(viewModel: TabViewModel): TabEditorDto {
    // }

    toTabViewModel(dto: TabEditorDto): TabViewModel {
        return {
            id: dto.id,
            isModified: dto.isModified,
            filePath: dto.filePath,
            fileName: dto.fileName,
            isBinary: dto.isBinary,
        }
    }

    get activeTabId() {
        return this._activeTabId
    }

    set activeTabId(id: number) {
        this._activeTabId = id
    }

    get activeTabIndex() {
        return this._activeTabIndex
    }

    set activeTabIndex(index: number) {
        this._activeTabIndex = index
    }

    get contextTabId() {
        return this._contextTabId
    }

    set contextTabId(id: number) {
        this._contextTabId = id
    }

    removeContextTabId() {
        this._contextTabId = -1
    }

    get idToTabViewModelMap(): ReadonlyMap<number, TabViewModel> {
        return this._idToTabViewModelMap
    }

    getTabEditorViewModelById(id: number) {
        return this._idToTabViewModelMap.get(id)
    }

    setTabEditorViewModelById(id: number, viewModel: TabViewModel) {
        this._idToTabViewModelMap.set(id, viewModel)
    }

    deleteTabEditorViewModelById(id: number) {
        this._idToTabViewModelMap.delete(id)
    }
}