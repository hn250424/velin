import { electronAPI } from "./shared/constants/electronAPI"
import OpenResponse from "./shared/interface/OpenResponse"
import SaveAllResponse from "./shared/interface/SaveAllResponse"
import TabsData from "./shared/interface/TabsData"
import TabSession from "./shared/interface/TabSession"

export { }

declare global {
    interface Window {
        [electronAPI.channel]: {
            // Main -> Renderer.
            tabSession: (callback: (tabs: TabSession[]) => void) => void

            // Renderer -> Main.
            loadedRenderer: () => void

            minimize: () => void
            maximize: () => void
            close: () => void

            open: () => Promise<OpenResponse>
            saveAll: (data: TabsData[]) => Promise<SaveAllResponse[]>

            confirm: (message: string) => Promise<boolean>
        }
    }
}