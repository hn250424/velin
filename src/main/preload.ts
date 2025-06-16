import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '../shared/constants/electronAPI'
import TabData from '../shared/interface/TabData'
import TabSession from '../shared/interface/TabSession'

contextBridge.exposeInMainWorld(electronAPI.channel, {
    // Main -> Renderer.
    tabSession: (callback: (tabs: TabSession[]) => void) => {
        ipcRenderer.on(electronAPI.events.tabSession, (e, tabs) => { callback(tabs) })
    },

    // Renderer -> Main.
    loadedRenderer: () => { ipcRenderer.send(electronAPI.events.loadedRenderer) },
    showMainWindow: () => { ipcRenderer.send(electronAPI.events.showMainWindow) },

    minimize: () => { ipcRenderer.send(electronAPI.events.minimize) },
    maximize: () => { ipcRenderer.send(electronAPI.events.maximize) },
    close: () => { ipcRenderer.send(electronAPI.events.close) },

    open: () => { return ipcRenderer.invoke(electronAPI.events.open) },
    save: (data: TabData) => { return ipcRenderer.invoke(electronAPI.events.save, data)},
    saveAll: (data: TabData[]) => { return ipcRenderer.invoke(electronAPI.events.saveAll, data) },

    confirm: (message: string) => { return ipcRenderer.invoke(electronAPI.events.confirm, message) },
})