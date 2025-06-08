import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '../Shared/constants/electronAPI'

contextBridge.exposeInMainWorld(electronAPI.channel, {
    // Main -> Renderer.
    onCreate: (callback: () => void) => {
        ipcRenderer.on(electronAPI.events.onCreate, (_e) => callback())
    },
    
    onSave: (callback: (isSaveAs: Boolean) => void) => {
        ipcRenderer.on(electronAPI.events.onSave, (_e, isSaveAs) => callback(isSaveAs))
    },

    onSetMode: (callback: (mode: number) => void) => {
        ipcRenderer.on(electronAPI.events.onSetMode, (_e, mode) => callback(mode))
    },

    onOpen: (callback: (content: string) => void) => {
        ipcRenderer.on(electronAPI.events.onOpen, (_e, content) => callback(content))
    },

    // Renderer -> Main.
    sendSave: (content: string, isSaveAs: boolean) => {
        ipcRenderer.send(electronAPI.events.sendSave, content, isSaveAs)
    },
})