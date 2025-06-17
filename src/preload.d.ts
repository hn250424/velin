import { electronAPI } from "./shared/constants/electronAPI"
import OpenResponse from "./shared/interface/OpenResponse"
import SaveResponse from "./shared/interface/SaveResponse"
import Response from "./shared/interface/Response"
import TabData from "./shared/interface/TabData"
import TabSession from "./shared/interface/TabSession"

export { }

declare global {
    interface Window {
        [electronAPI.channel]: {
            // Main -> Renderer.
            tabSession: (callback: (tabs: TabData[]) => void) => void

            // Renderer -> Main.
            loadedRenderer: () => void
            showMainWindow: () => void

            minimize: () => void
            maximize: () => void
            unmaximize: () => void
            close: () => void

            newTab: () => Promise<Response<number>>
            open: () => Promise<Response<TabData>>
            save: (data: TabData) => promise<Response<TabData>>
            saveAs: (data: TabData) => promise<Response<TabData>>
            saveAll: (data: TabData[]) => Promise<Response<TabData[]>>

            confirm: (message: string) => Promise<boolean>
        }
    }
}