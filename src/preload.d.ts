import { electronAPI } from "./shared/constants/electronAPI"
import Tab from "./shared/Tab"

export { }

declare global {
    interface Window {
        [electronAPI.channel]: {
            // Main -> Renderer.
            noTab: (callback: () => void) => void


            //
            onCreate: (callback: () => void) => void
            onSave: (callback: (isSaveAs: boolean) => void) => void
            onOpen: (callback: (content: string) => void) => void
            onSetMode: (callback: (mode: number) => void) => void

            // Renderer -> Main.
            loadedRenderer: () => void

            minimize: () => void
            maximize: () => void
            close: () => void

            open:() => Promise<{ filePath: string; fileName: string; content: string }>
            save: (data: { filePath: string; content: string }[]) => Promise<boolean>


            //
            sendSave: (content: string, isSaveAs: boolean) => void
        }
    }
}