import { electronAPI } from "./shared/constants/electronAPI"
import OpenResponse from "./shared/interface/OpenResponse"
import SaveResponse from "./shared/interface/SaveResponse"
import TabData from "./shared/interface/TabData"
import TabSession from "./shared/interface/TabSession"

export { }

declare global {
    interface Window {
        [electronAPI.channel]: {
            // Main -> Renderer.
            tabSession: (callback: (tabs: TabSession[]) => void) => void

            // Renderer -> Main.
            loadedRenderer: () => void
            showMainWindow: () => void

            minimize: () => void
            maximize: () => void
            unmaximize: () => void
            close: () => void

            open: () => Promise<OpenResponse>
            save: (data: TabData) => promise<SaveResponse>
            saveAll: (data: TabData[]) => Promise<SaveResponse[]>

            confirm: (message: string) => Promise<boolean>
        }
    }
}