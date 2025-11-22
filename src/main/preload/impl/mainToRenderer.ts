import { ipcRenderer } from "electron"
import { electronAPI } from "@shared/constants/electronAPI/electronAPI"
import { MainToRendererAPI } from "@shared/preload"
import { TabEditorsDto } from "@shared/dto/TabEditorDto"
import TreeDto from "@shared/dto/TreeDto"
import SideDto from "@shared/dto/SideDto"
import WindowDto from "@shared/dto/WindowDto"
import SettingsDto from "@shared/dto/SettingsDto"

const mainToRenderer: MainToRendererAPI = {
    session: (callback: (windowDto: WindowDto, settingsDto: SettingsDto, sideDto: SideDto, tabEditorsDto: TabEditorsDto, treeDto: TreeDto) => void) => {
        ipcRenderer.on(electronAPI.events.mainToRenderer.session, (e, windowDto, settingsDto, sideDto, tabEditorsDto, treeDto) => { callback(windowDto, settingsDto, sideDto, tabEditorsDto, treeDto) })
    },
    info: (callback: (version: string) => void) => { ipcRenderer.on(electronAPI.events.mainToRenderer.info, (e, version) => { callback(version) }) },
    syncFromWatch: (callback: (tabEditorsDto: TabEditorsDto, treeDto: TreeDto) => void) => {
        ipcRenderer.on(electronAPI.events.mainToRenderer.syncFromWatch, (e, tabEditorsDto, treeDto) => { callback(tabEditorsDto, treeDto) })
    },
    onMaximizeWindow: (callback: () => void) => { ipcRenderer.on(electronAPI.events.mainToRenderer.onMaximizeWindow, () => { callback() }) },
    onUnmaximizeWindow: (callback: () => void) => { ipcRenderer.on(electronAPI.events.mainToRenderer.onUnmaximizeWindow, () => { callback() }) },
}

export default mainToRenderer