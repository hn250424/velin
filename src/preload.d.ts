import TreeDto from "@shared/dto/TreeDto"
import { electronAPI } from "./shared/constants/electronAPI"
import Response from "./shared/interface/Response"
import { TabEditorDto, TabEditorsDto } from "./shared/interface/TabEditorDto"

export { }

declare global {
    interface Window {
        [electronAPI.channel]: {
            // Expose Renderer.
            getBaseName: (fullPath: string) => string

            // Main -> Renderer.
            session: (callback: (tabs: TabEditorsDto, tree: TreeDto) => void) => void
            onMaximizeWindow: (callback: () => void) => void
            onUnmaximizeWindow: (callback: () => void) => void

            // Renderer -> Main.
            loadedRenderer: () => void
            showMainWindow: () => void

            requestMinimizeWindow: () => void
            requestMaximizeWindow: () => void
            requestUnmaximizeWindow: () => void

            newTab: () => Promise<Response<number>>
            openFile: (filePath?: string) => Promise<Response<TabEditorDto>>
            openDirectory: (data?: TreeDto) => Promise<Response<void>>
            save: (data: TabEditorDto) => Promise<Response<TabEditorDto>>
            saveAs: (data: TabEditorDto) => Promise<Response<TabEditorDto>>
            saveAll: (data: TabEditorsDto) => Promise<Response<TabEditorsDto>>

            closeTab: (data: TabEditorDto) => Promise<Response<void>>
            closeTabsExcept: (exceptData: TabEditorDto, allData: TabEditorsDto) => Promise<Response<boolean[]>>
            closeTabsToRight: (referenceData: TabEditorDto, allData: TabEditorsDto) => Promise<Response<boolean[]>>
            closeAllTabs: (data: TabEditorsDto) => Promise<Response<boolean[]>>
            
            exit: (tabSessionData: TabEditorsDto, treeSessionData: TreeDto) => Promise<void>

            cut: (text: string) => Promise<void>
            copy: (text: string) => Promise<void>
            paste: () => Promise<string>

            renameTree: (prePath: string, newName: string) => Promise<Response<string | null>>
            renameTab: (dto: TabEditorDto, newPath: string) => Promise<Response<TabEditorDto>>
        }
    }
}