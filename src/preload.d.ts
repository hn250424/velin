import { electronAPI } from "./Shared/constants/electronAPI"

export { }

declare global {
    interface Window {
        [electronAPI.channel]: {
            // Main -> Renderer.
            onCreate: (callback: () => void) => void
            onSave: (callback: (isSaveAs: boolean) => void) => void
            onOpen: (callback: (content: string) => void) => void
            onSetMode: (callback: (mode: number) => void) => void

            // Renderer -> Main.
            sendSave: (content: string, isSaveAs: boolean) => void
            test: () => void
        }
    }
}