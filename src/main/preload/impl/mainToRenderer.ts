import { ipcRenderer } from "electron"
import { electronAPI } from "@shared/constants/electronAPI/electronAPI"
import { MainToRendererAPI } from "@shared/preload"
import { TabEditorsDto } from "@shared/dto/TabEditorDto"
import TreeDto from "@shared/dto/TreeDto"

const mainToRenderer: MainToRendererAPI = {
    session: (callback: (tabs: TabEditorsDto, tree: TreeDto) => void) => {
        ipcRenderer.on(electronAPI.events.mainToRenderer.session, (e, tabs, tree) => { callback(tabs, tree) })
    },
    onMaximizeWindow: (callback: () => void) => { ipcRenderer.on(electronAPI.events.mainToRenderer.onMaximizeWindow, () => { callback() }) },
    onUnmaximizeWindow: (callback: () => void) => { ipcRenderer.on(electronAPI.events.mainToRenderer.onUnmaximizeWindow, () => { callback() }) },
}

export default mainToRenderer