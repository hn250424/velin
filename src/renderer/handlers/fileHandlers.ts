import "@milkdown/theme-nord/style.css"

import { electronAPI } from '@shared/constants/electronAPI'
import { TabEditorDto, TabEditorsDto } from "@shared/dto/TabEditorDto"
import Response from "@shared/types/Response"
import performOpenFile from "../actions/pertormOpenFile"
import performOpenDirectory from "../actions/performOpenDirectory"
import shortcutRegistry from "../modules/input/shortcutRegistry"
import TabEditorManager from "../modules/manager/TabEditorManager"
import TreeLayoutManager from "../modules/manager/TreeLayoutManager"
import CommandDispatcher from "../modules/command/CommandDispatcher"

export default function registerFileHandlers(
    commandDispatcher: CommandDispatcher, 
    tabEditorManager: TabEditorManager, 
    treeLayoutManager: TreeLayoutManager) {
    bindMenuFileCommands(tabEditorManager, treeLayoutManager)

    document.getElementById('file_menu_new_tab').addEventListener('click', async () => {
        await commandDispatcher.execute('newTab', 'menu')
    })

    // shortcutRegistry.register('Ctrl+T', async (e: KeyboardEvent) => await performNewTab(tabEditorManager))
    shortcutRegistry.register('Ctrl+T', async (e: KeyboardEvent) => await commandDispatcher.execute('newTab', 'shortcut'))
    shortcutRegistry.register('Ctrl+O', async (e: KeyboardEvent) => await performOpenFile(tabEditorManager))
    shortcutRegistry.register('Ctrl+Shift+O', async (e: KeyboardEvent) => await performOpenDirectory(treeLayoutManager))
    shortcutRegistry.register('Ctrl+S', async (e: KeyboardEvent) => await performSave(tabEditorManager))
    shortcutRegistry.register('Ctrl+Shift+S', async (e: KeyboardEvent) => await performSaveAs(tabEditorManager))
}

function bindMenuFileCommands(tabEditorManager: TabEditorManager, treeLayoutManager: TreeLayoutManager) {
    // document.getElementById('file_menu_new_tab').addEventListener('click', async () => {
    //     await commandDispatcher.execute('newTab', 'shortcut')
    // })

    document.getElementById('file_menu_open_file').addEventListener('click', async () => {
        await performOpenFile(tabEditorManager)
    })

    document.getElementById('file_menu_open_directory').addEventListener('click', async () => {
        await performOpenDirectory(treeLayoutManager)
    })

    document.getElementById('file_menu_save').addEventListener('click', async () => {
        await performSave(tabEditorManager)
    })

    document.getElementById('file_menu_save_as').addEventListener('click', async () => {
        await performSaveAs(tabEditorManager)
    })

    document.getElementById('file_menu_save_all').addEventListener('click', async () => {
        const tabsData: TabEditorsDto = tabEditorManager.getAllTabEditorData()
        const response: Response<TabEditorsDto> = await window[electronAPI.channel].saveAll(tabsData)
        if (response.result) tabEditorManager.applySaveAllResults(response.data)
    })
}

// async function performNewTab(tabEditorManager: TabEditorManager) {
//     const response: Response<number> = await window[electronAPI.channel].newTab()
//     if (response.result) await tabEditorManager.addTab(response.data)
// }

async function performSave(tabEditorManager: TabEditorManager) {
    const data = tabEditorManager.getActiveTabEditorData()
    if (!data.isModified) return
    const response: Response<TabEditorDto> = await window[electronAPI.channel].save(data)
    if (response.result && !response.data.isModified) tabEditorManager.applySaveResult(response.data)
}

async function performSaveAs(tabEditorManager: TabEditorManager) {
    const data: TabEditorDto = tabEditorManager.getActiveTabEditorData()
    const response: Response<TabEditorDto> = await window[electronAPI.channel].saveAs(data)
    if (response.result && response.data) {
        const wasApplied = tabEditorManager.applySaveResult(response.data)
        if (!wasApplied) await tabEditorManager.addTab(response.data.id, response.data.filePath, response.data.fileName, response.data.content, true)
    }
}

