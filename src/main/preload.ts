import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '../shared/constants/electronAPI'
import TabData from '../shared/types/TabData'

contextBridge.exposeInMainWorld(electronAPI.channel, {
    // Main -> Renderer.
    tabSession: (callback: (tabs: TabData[]) => void) => {
        ipcRenderer.on(electronAPI.events.tabSession, (e, tabs) => { callback(tabs) })
    },

    // Renderer -> Main.
    loadedRenderer: () => { ipcRenderer.send(electronAPI.events.loadedRenderer) },
    showMainWindow: () => { ipcRenderer.send(electronAPI.events.showMainWindow) },

    minimizeWindow: () => { ipcRenderer.send(electronAPI.events.minimizeWindow) },
    maximizeWindow: () => { ipcRenderer.send(electronAPI.events.maximizeWindow) },
    unmaximizeWindow: () => { ipcRenderer.send(electronAPI.events.unmaximizeWindow) },
    closeWindow: () => { ipcRenderer.send(electronAPI.events.closeWindow) },

    newTab: () => { return ipcRenderer.invoke(electronAPI.events.newTab) },
    open: () => { return ipcRenderer.invoke(electronAPI.events.open) },
    save: (data: TabData) => { return ipcRenderer.invoke(electronAPI.events.save, data) },
    saveAs: (data: TabData) => { return ipcRenderer.invoke(electronAPI.events.saveAs, data) },
    saveAll: (data: TabData[]) => { return ipcRenderer.invoke(electronAPI.events.saveAll, data) },
    closeTab: (data: TabData) => { return ipcRenderer.invoke(electronAPI.events.closeTab, data) },

    confirm: (message: string) => { return ipcRenderer.invoke(electronAPI.events.confirm, message) },
})