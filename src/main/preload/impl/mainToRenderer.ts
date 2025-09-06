import { ipcRenderer } from "electron"
import { electronAPI } from "@shared/constants/electronAPI/electronAPI"
import { MainToRendererAPI } from "@shared/preload"
import { TabEditorsDto } from "@shared/dto/TabEditorDto"
import TreeDto from "@shared/dto/TreeDto"
import SideDto from "@shared/dto/SideDto"

const mainToRenderer: MainToRendererAPI = {
    session: (callback: (sideDto: SideDto, tabEditorsDto: TabEditorsDto, treeDto: TreeDto) => void) => {
        ipcRenderer.on(electronAPI.events.mainToRenderer.session, (e, sideDto, tabEditorsDto, treeDto) => { callback(sideDto, tabEditorsDto, treeDto) })
    },
    syncFromWatch: (callback: (tabEditorsDto: TabEditorsDto, treeDto: TreeDto) => void) => {
        ipcRenderer.on(electronAPI.events.mainToRenderer.syncFromWatch, (e, tabEditorsDto, treeDto) => { callback(tabEditorsDto, treeDto) })
    },
    onMaximizeWindow: (callback: () => void) => { ipcRenderer.on(electronAPI.events.mainToRenderer.onMaximizeWindow, () => { callback() }) },
    onUnmaximizeWindow: (callback: () => void) => { ipcRenderer.on(electronAPI.events.mainToRenderer.onUnmaximizeWindow, () => { callback() }) },
}

export default mainToRenderer