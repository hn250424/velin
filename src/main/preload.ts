import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '../shared/constants/electronAPI'
import TabData from '../shared/interface/TabData'

contextBridge.exposeInMainWorld(electronAPI.channel, {
    // Main -> Renderer.
    tabSession: (callback: (tabs: TabData[]) => void) => {
        ipcRenderer.on(electronAPI.events.tabSession, (e, tabs) => { callback(tabs) })
    },

    // Renderer -> Main.
    loadedRenderer: () => { ipcRenderer.send(electronAPI.events.loadedRenderer) },
    showMainWindow: () => { ipcRenderer.send(electronAPI.events.showMainWindow) },

    minimize: () => { ipcRenderer.send(electronAPI.events.minimize) },
    maximize: () => { ipcRenderer.send(electronAPI.events.maximize) },
    unmaximize: () => { ipcRenderer.send(electronAPI.events.unmaximize) },
    close: () => { ipcRenderer.send(electronAPI.events.close) },

    open: () => { return ipcRenderer.invoke(electronAPI.events.open) },
    save: (data: TabData) => { return ipcRenderer.invoke(electronAPI.events.save, data) },
    saveAs: (data: TabData) => { return ipcRenderer.invoke(electronAPI.events.saveAs, data) },
    saveAll: (data: TabData[]) => { return ipcRenderer.invoke(electronAPI.events.saveAll, data) },

    confirm: (message: string) => { return ipcRenderer.invoke(electronAPI.events.confirm, message) },
})