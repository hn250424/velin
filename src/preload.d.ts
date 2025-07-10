import TreeDto from "@shared/dto/TreeDto"
import { electronAPI } from "./shared/constants/electronAPI"
import Response from "./shared/interface/Response"
import TabEditorDto from "./shared/interface/TabEditorDto"

export { }

declare global {
    interface Window {
        [electronAPI.channel]: {
            // Main -> Renderer.
            session: (callback: (tabs: TabEditorDto[], tree: TreeDto) => void) => void
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
            saveAll: (data: TabEditorDto[]) => Promise<Response<TabEditorDto[]>>

            closeTab: (data: TabEditorDto) => Promise<Response<void>>
            closeTabsExcept: (exceptData: TabEditorDto, allData: TabEditorDto[]) => Promise<Response<boolean[]>>
            closeTabsToRight: (referenceData: TabEditorDto, allData: TabEditorDto[]) => Promise<Response<boolean[]>>
            closeAllTabs: (data: TabEditorDto[]) => Promise<Response<boolean[]>>
            
            exit: (tabSessionData: TabEditorDto[], treeSessionData: TreeDto) => Promise<void>

            paste: () => Promise<string>
        }
    }
}