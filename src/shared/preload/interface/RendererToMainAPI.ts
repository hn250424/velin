import Response from "@shared/types/Response"
import TreeDto from "@shared/dto/TreeDto"
import { TabEditorDto, TabEditorsDto } from "@shared/dto/TabEditorDto"
import ClipboardMode from "@shared/types/ClipboardMode"
import TrashMap from "@shared/types/TrashMap"

export default interface RendererToMainAPI {
    loadedRenderer: () => void
    showMainWindow: () => void

    requestMinimizeWindow: () => void
    requestMaximizeWindow: () => void
    requestUnmaximizeWindow: () => void

    newTab: () => Promise<Response<number>>
    openFile: (filePath?: string) => Promise<Response<TabEditorDto>>
    openDirectory: (data?: TreeDto) => Promise<Response<TreeDto>>
    save: (data: TabEditorDto) => Promise<Response<TabEditorDto>>
    saveAs: (data: TabEditorDto) => Promise<Response<TabEditorDto>>
    saveAll: (data: TabEditorsDto) => Promise<Response<TabEditorsDto>>

    closeTab: (data: TabEditorDto) => Promise<Response<void>>
    closeTabsExcept: (exceptData: TabEditorDto, allData: TabEditorsDto) => Promise<Response<boolean[]>>
    closeTabsToRight: (referenceData: TabEditorDto, allData: TabEditorsDto) => Promise<Response<boolean[]>>
    closeAllTabs: (data: TabEditorsDto) => Promise<Response<boolean[]>>

    exit: (tabSessionData: TabEditorsDto, treeSessionData: TreeDto) => Promise<void>

    cutEditor: (text: string) => Promise<void>
    copyEditor: (text: string) => Promise<void>
    pasteEditor: () => Promise<string>
    copyTree: (src: string, dest: string) => Promise<void>
    pasteTree: (targetDto: TreeDto, selectedDtos: TreeDto[], clipboardMode: ClipboardMode) => Promise<Response<string[]>>

    rename: (prePath: string, newPath: string) => Promise<Response<string>>
    delete: (arr: string[]) => Promise<Response<TrashMap[] | null>>
    undo_delete: (trashMap: TrashMap[] | null) => Promise<boolean>
    deletePermanently: (path: string) => Promise<void>

    syncTabSessionFromRenderer: (dto: TabEditorsDto) => Promise<boolean>
    syncTreeSessionFromRenderer: (dto: TreeDto) => Promise<boolean>
    getSyncedTreeSession: () => Promise<TreeDto | null>
}