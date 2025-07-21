import { contextBridge, ipcRenderer } from 'electron'
import * as path from 'path'
import { electronAPI } from '../shared/constants/electronAPI'
import { TabEditorsDto, TabEditorDto } from '../shared/dto/TabEditorDto'
import TreeDto from '@shared/dto/TreeDto'

contextBridge.exposeInMainWorld(electronAPI.channel, {
    // Expose Renderer.
    getDirName: (fullPath: string): string => path.dirname(fullPath),
    getBaseName: (fullPath: string): string => path.basename(fullPath),
    getJoinedPath: (dir: string, base: string): string => path.join(dir, base),
    getRelativePath: (from: string, to: string): string => path.relative(from, to),
    isAbsolute: (p: string): boolean => path.isAbsolute(p),
    pathSep: path.sep,

    // Main -> Renderer.
    session: (callback: (tabs: TabEditorsDto, tree: TreeDto) => void) => { 
        ipcRenderer.on(electronAPI.events.session, (e, tabs, tree) => { callback(tabs, tree) }) 
    },
    onMaximizeWindow: (callback: () => void) => { ipcRenderer.on(electronAPI.events.onMaximizeWindow, () => { callback() }) },
    onUnmaximizeWindow: (callback: () => void) => { ipcRenderer.on(electronAPI.events.onUnmaximizeWindow, () => { callback() }) },

    // Renderer -> Main.
    loadedRenderer: () => { ipcRenderer.send(electronAPI.events.loadedRenderer) },
    showMainWindow: () => { ipcRenderer.send(electronAPI.events.showMainWindow) },

    requestMinimizeWindow: () => { ipcRenderer.send(electronAPI.events.requestMinimizeWindow) },
    requestMaximizeWindow: () => { ipcRenderer.send(electronAPI.events.requestMaximizeWindow) },
    requestUnmaximizeWindow: () => { ipcRenderer.send(electronAPI.events.requestUnmaximizeWindow) },

    newTab: () => { return ipcRenderer.invoke(electronAPI.events.newTab) },
    openFile: (filePath?: string) => { return ipcRenderer.invoke(electronAPI.events.openFile, filePath) },
    openDirectory: (data?: TreeDto) => { return ipcRenderer.invoke(electronAPI.events.openDirectory, data) },
    save: (data: TabEditorDto) => { return ipcRenderer.invoke(electronAPI.events.save, data) },
    saveAs: (data: TabEditorDto) => { return ipcRenderer.invoke(electronAPI.events.saveAs, data) },
    saveAll: (data: TabEditorsDto) => { return ipcRenderer.invoke(electronAPI.events.saveAll, data) },

    closeTab: (data: TabEditorDto) => { return ipcRenderer.invoke(electronAPI.events.closeTab, data) },
    closeTabsExcept: (exceptData: TabEditorDto, allData: TabEditorsDto) => { return ipcRenderer.invoke(electronAPI.events.closeTabsExcept, exceptData, allData) },
    closeTabsToRight: (referenceData: TabEditorDto, allData: TabEditorsDto) => { return ipcRenderer.invoke(electronAPI.events.closeTabsToRight, referenceData, allData) },
    closeAllTabs: (data: TabEditorsDto) => { return ipcRenderer.invoke(electronAPI.events.closeAllTabs, data) },

    exit: (tabSessionData: TabEditorsDto, treeSessionData: TreeDto) => { ipcRenderer.invoke(electronAPI.events.exit, tabSessionData, treeSessionData) },

    cut: (text: string) => { return ipcRenderer.invoke(electronAPI.events.cut, text) },
    copy: (text: string) => { return ipcRenderer.invoke(electronAPI.events.copy, text) },
    paste: () => { return ipcRenderer.invoke(electronAPI.events.paste) },

    renameTree: (prePath: string, newPath: string) => { return ipcRenderer.invoke(electronAPI.events.renameTree, prePath, newPath) },
    delete: (arr: string[]) => { return ipcRenderer.invoke(electronAPI.events.delete, arr) },

    syncTabSession: (tabEditorsDto: TabEditorsDto) => { return ipcRenderer.invoke(electronAPI.events.syncTabSession, tabEditorsDto) },
    syncTreeSession: (treeDto: TreeDto) => { return ipcRenderer.invoke(electronAPI.events.syncTreeSession, treeDto) },
})