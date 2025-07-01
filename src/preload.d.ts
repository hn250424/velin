import { electronAPI } from "./shared/constants/electronAPI"
import OpenResponse from "./shared/interface/OpenResponse"
import SaveResponse from "./shared/interface/SaveResponse"
import Response from "./shared/interface/Response"
import TabEditorDto from "./shared/interface/TabEditorDto"
import TabSession from "./shared/interface/TabSession"
import TreeNode from "@shared/types/TreeNode"

export { }

declare global {
    interface Window {
        [electronAPI.channel]: {
            // Main -> Renderer.
            tabSession: (callback: (tabs: TabEditorDto[]) => void) => void
            onMaximizeWindow: (callback: () => void) => void
            onUnmaximizeWindow: (callback: () => void) => void

            // Renderer -> Main.
            loadedRenderer: () => void
            showMainWindow: () => void

            requestMinimizeWindow: () => void
            requestMaximizeWindow: () => void
            requestUnmaximizeWindow: () => void

            newTab: () => Promise<Response<number>>
            openFile: () => Promise<Response<TabEditorDto>>
            openDirectory: (treeNode?: TreeNode) => Promise<Response<void>>
            save: (data: TabEditorDto) => Promise<Response<TabEditorDto>>
            saveAs: (data: TabEditorDto) => Promise<Response<TabEditorDto>>
            saveAll: (data: TabEditorDto[]) => Promise<Response<TabEditorDto[]>>

            closeTab: (data: TabEditorDto) => Promise<Response<void>>
            closeTabsExcept: (exceptData: TabEditorDto, allData: TabEditorDto[]) => Promise<Response<boolean[]>>
            closeTabsToRight: (referenceData: TabEditorDto, allData: TabEditorDto[]) => Promise<Response<boolean[]>>
            closeAllTabs: (data: TabEditorDto[]) => Promise<Response<boolean[]>>
            
            exit: (data: TabEditorDto[]) => Promise<void>

            paste: () => Promise<string>
        }
    }
}