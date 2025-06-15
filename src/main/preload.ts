import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '../shared/constants/electronAPI'

contextBridge.exposeInMainWorld(electronAPI.channel, {
    // Main -> Renderer.
    noTab: (callback: () => void) => {
        ipcRenderer.on(electronAPI.events.noTab, (_e) => callback())
    },

    //
    onCreate: (callback: () => void) => {
        ipcRenderer.on(electronAPI.events.onCreate, (_e) => callback())
    },
    
    onSave: (callback: (isSaveAs: boolean) => void) => {
        ipcRenderer.on(electronAPI.events.onSave, (_e, isSaveAs) => callback(isSaveAs))
    },

    onOpen: (callback: (content: string) => void) => {
        ipcRenderer.on(electronAPI.events.onOpen, (_e, content) => callback(content))
    },

    // Renderer -> Main.
    loadedRenderer: () => { ipcRenderer.send(electronAPI.events.loadedRenderer) },

    minimize: () => { ipcRenderer.send(electronAPI.events.minimize) },
    maximize: () => { ipcRenderer.send(electronAPI.events.maximize) },
    close: () => { ipcRenderer.send(electronAPI.events.close) },

    open: () => { return ipcRenderer.invoke(electronAPI.events.open) },
    save: (data: { filePath: string; content: string }[]) => { return ipcRenderer.invoke(electronAPI.events.save) },



    //
    sendSave: (content: string, isSaveAs: boolean) => {
        ipcRenderer.send(electronAPI.events.sendSave, content, isSaveAs)
    },
})