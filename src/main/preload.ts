import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '../shared/constants/electronAPI'
import TabData from '../shared/types/TabData'
import TreeNode from '@shared/types/TreeNode'

contextBridge.exposeInMainWorld(electronAPI.channel, {
    // Main -> Renderer.
    tabSession: (callback: (tabs: TabData[]) => void) => { ipcRenderer.on(electronAPI.events.tabSession, (e, tabs) => { callback(tabs) }) },
    onMaximizeWindow: (callback: () => void) => { ipcRenderer.on(electronAPI.events.onMaximizeWindow, () => { callback() }) },
    onUnmaximizeWindow: (callback: () => void) => { ipcRenderer.on(electronAPI.events.onUnmaximizeWindow, () => { callback() }) },

    // Renderer -> Main.
    loadedRenderer: () => { ipcRenderer.send(electronAPI.events.loadedRenderer) },
    showMainWindow: () => { ipcRenderer.send(electronAPI.events.showMainWindow) },

    requestMinimizeWindow: () => { ipcRenderer.send(electronAPI.events.requestMinimizeWindow) },
    requestMaximizeWindow: () => { ipcRenderer.send(electronAPI.events.requestMaximizeWindow) },
    requestUnmaximizeWindow: () => { ipcRenderer.send(electronAPI.events.requestUnmaximizeWindow) },

    newTab: () => { return ipcRenderer.invoke(electronAPI.events.newTab) },
    openFile: () => { return ipcRenderer.invoke(electronAPI.events.openFile) },
    openDirectory: (treeNode?: TreeNode) => { return ipcRenderer.invoke(electronAPI.events.openDirectory, treeNode) },
    save: (data: TabData) => { return ipcRenderer.invoke(electronAPI.events.save, data) },
    saveAs: (data: TabData) => { return ipcRenderer.invoke(electronAPI.events.saveAs, data) },
    saveAll: (data: TabData[]) => { return ipcRenderer.invoke(electronAPI.events.saveAll, data) },

    closeTab: (data: TabData) => { return ipcRenderer.invoke(electronAPI.events.closeTab, data) },
    closeTabsExcept: (exceptData: TabData, allData: TabData[]) => { return ipcRenderer.invoke(electronAPI.events.closeTabsExcept, exceptData, allData) },
    closeTabsToRight: (referenceData: TabData, allData: TabData[]) => { return ipcRenderer.invoke(electronAPI.events.closeTabsToRight, referenceData, allData) },
    closeAllTabs: (data: TabData[]) => { return ipcRenderer.invoke(electronAPI.events.closeAllTabs, data) },

    exit: (data: TabData[]) => { ipcRenderer.invoke(electronAPI.events.exit, data) },

    paste: () => { return ipcRenderer.invoke(electronAPI.events.paste) }
})