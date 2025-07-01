import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '../shared/constants/electronAPI'
import TabEditorDto from '../shared/dto/TabEditorDto'
import TreeDto from '@shared/dto/TreeDto'

contextBridge.exposeInMainWorld(electronAPI.channel, {
    // Main -> Renderer.
    tabSession: (callback: (tabs: TabEditorDto[]) => void) => { ipcRenderer.on(electronAPI.events.tabSession, (e, tabs) => { callback(tabs) }) },
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
    openDirectory: (data?: TreeDto) => { return ipcRenderer.invoke(electronAPI.events.openDirectory, data) },
    save: (data: TabEditorDto) => { return ipcRenderer.invoke(electronAPI.events.save, data) },
    saveAs: (data: TabEditorDto) => { return ipcRenderer.invoke(electronAPI.events.saveAs, data) },
    saveAll: (data: TabEditorDto[]) => { return ipcRenderer.invoke(electronAPI.events.saveAll, data) },

    closeTab: (data: TabEditorDto) => { return ipcRenderer.invoke(electronAPI.events.closeTab, data) },
    closeTabsExcept: (exceptData: TabEditorDto, allData: TabEditorDto[]) => { return ipcRenderer.invoke(electronAPI.events.closeTabsExcept, exceptData, allData) },
    closeTabsToRight: (referenceData: TabEditorDto, allData: TabEditorDto[]) => { return ipcRenderer.invoke(electronAPI.events.closeTabsToRight, referenceData, allData) },
    closeAllTabs: (data: TabEditorDto[]) => { return ipcRenderer.invoke(electronAPI.events.closeAllTabs, data) },

    exit: (data: TabEditorDto[]) => { ipcRenderer.invoke(electronAPI.events.exit, data) },

    paste: () => { return ipcRenderer.invoke(electronAPI.events.paste) }
})