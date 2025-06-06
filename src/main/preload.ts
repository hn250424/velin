import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
    // Main -> Renderer.
    onSetMode: (callback: (mode: number) => void) => {
        ipcRenderer.on('setMode', (_event, mode) => callback(mode))
    }

    // Renderer -> Main.
})