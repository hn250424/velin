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

    newTab: () => { return ipcRenderer.invoke(electronAPI.events.newTab) },
    openFile: () => { return ipcRenderer.invoke(electronAPI.events.openFile) },
    save: (data: TabData) => { return ipcRenderer.invoke(electronAPI.events.save, data) },
    saveAs: (data: TabData) => { return ipcRenderer.invoke(electronAPI.events.saveAs, data) },
    saveAll: (data: TabData[]) => { return ipcRenderer.invoke(electronAPI.events.saveAll, data) },

    closeTab: (data: TabData) => { return ipcRenderer.invoke(electronAPI.events.closeTab, data) },
    closeTabsExcept: (exceptData: TabData, allData: TabData[]) => { return ipcRenderer.invoke(electronAPI.events.closeTabsExcept, exceptData, allData) },
    closeTabsToRight: (referenceData: TabData, allData: TabData[]) => { return ipcRenderer.invoke(electronAPI.events.closeTabsToRight, referenceData, allData) },
    closeAllTabs: (data: TabData[]) => { return ipcRenderer.invoke(electronAPI.events.closeAllTabs, data) },
    
    exit: (data: TabData[]) => { ipcRenderer.invoke(electronAPI.events.exit, data) }
})