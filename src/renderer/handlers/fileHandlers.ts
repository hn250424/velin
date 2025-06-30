import "@milkdown/theme-nord/style.css"

import { electronAPI } from '@shared/constants/electronAPI'
import Response from "@shared/types/Response"
import TabData from "@shared/types/TabData"
import TabDataManager from "../modules/features/TabAndEditorManager"
import shortcutRegistry from "../modules/features/shortcutRegistry"
import TreeNode from "@shared/types/TreeNode"
import TreeLayoutMaanger from "../modules/features/TreeLayoutManger"

export default function registerFileHandlers() {
    const tabDataManager = TabDataManager.getInstance()
    const treeLayoutManager = TreeLayoutMaanger.getInstance()

    bindMenuFileCommands(tabDataManager, treeLayoutManager)

    shortcutRegistry.register('Ctrl+T', async () => await performNewTab(tabDataManager))
    shortcutRegistry.register('Ctrl+O', async () => await performOpenFile(tabDataManager))
    shortcutRegistry.register('Ctrl+Shift+O', async () => {
        treeLayoutManager.setTarget(null)
        await performOpenDirectory(treeLayoutManager)
    })
    shortcutRegistry.register('Ctrl+S', async () => await performSave(tabDataManager))
    shortcutRegistry.register('Ctrl+Shift+S', async () => await performSaveAs(tabDataManager))
    shortcutRegistry.register('Ctrl+W', async () => await performCloseTab(tabDataManager, tabDataManager.activeTabId))

    ; (async () => {
        await performOpenDirectory(treeLayoutManager)
    })()
}

function bindMenuFileCommands(tabDataManager: TabDataManager, treeLayoutManager: TreeLayoutMaanger) {
    document.getElementById('file_menu_new_tab').addEventListener('click', async () => {
        await performNewTab(tabDataManager)
    })

    document.getElementById('file_menu_open_file').addEventListener('click', async () => {
        await performOpenFile(tabDataManager)
    })

    document.getElementById('file_menu_open_directory').addEventListener('click', async () => {
        treeLayoutManager.setTarget(null)
        await performOpenDirectory(treeLayoutManager)
    })

    document.getElementById('file_menu_save').addEventListener('click', async () => {
        await performSave(tabDataManager)
    })

    document.getElementById('file_menu_save_as').addEventListener('click', async () => {
        await performSaveAs(tabDataManager)
    })

    document.getElementById('file_menu_save_all').addEventListener('click', async () => {
        const tabsData: TabData[] = tabDataManager.getAllTabData()
        const response: Response<TabData[]> = await window[electronAPI.channel].saveAll(tabsData)
        if (response.result) tabDataManager.applySaveAllResults(response.data)
    })

    document.getElementById('tab_context_close').addEventListener('click', async () => {
        await performCloseTab(tabDataManager, tabDataManager.contextTabId)
    })

    document.getElementById('tab_context_close_others').addEventListener('click', async () => {
        const exceptData: TabData = tabDataManager.getTabDataById(tabDataManager.contextTabId)
        const allData: TabData[] = tabDataManager.getAllTabData()
        const response: Response<boolean[]> = await window[electronAPI.channel].closeTabsExcept(exceptData, allData)
        if (response.result) tabDataManager.removeTabsExcept(response.data)
    })

    document.getElementById('tab_context_close_right').addEventListener('click', async () => {
        const referenceData: TabData = tabDataManager.getTabDataById(tabDataManager.contextTabId)
        const allData: TabData[] = tabDataManager.getAllTabData()
        const response: Response<boolean[]> = await window[electronAPI.channel].closeTabsToRight(referenceData, allData)
        if (response.result) tabDataManager.removeTabsToRight(response.data)
    })

    document.getElementById('tab_context_close_all').addEventListener('click', async () => {
        const data: TabData[] = tabDataManager.getAllTabData()
        const response: Response<boolean[]> = await window[electronAPI.channel].closeAllTabs(data)
        if (response.result) tabDataManager.removeAllTabs(response.data)
    })
}

async function performNewTab(tabDataManager: TabDataManager) {
    const response: Response<number> = await window[electronAPI.channel].newTab()
    if (response.result) await tabDataManager.addTab(response.data)
}

async function performOpenFile(tabDataManager: TabDataManager) {
    const response: Response<TabData> = await window[electronAPI.channel].openFile()
    if (response.result) {
        const data = response.data
        await tabDataManager.addTab(data.id, data.filePath, data.fileName, data.content)
    }
}

async function performOpenDirectory(treeLayoutManager: TreeLayoutMaanger) {
    const dirPath = 'D:\\node-workspace\\velin\\test_file'
    const indent = 0

    const response: Response<TreeNode> = await window[electronAPI.channel].openDirectory(dirPath, indent)
    treeLayoutManager.setTreeData(response.data)

    console.log(response)
}

async function performSave(tabDataManager: TabDataManager) {
    const tabData = tabDataManager.getActivatedTabData()
    if (!tabData.isModified) return
    const response: Response<TabData> = await window[electronAPI.channel].save(tabData)
    if (response.result && !response.data.isModified) tabDataManager.applySaveResult(response.data)
}

async function performSaveAs(tabDataManager: TabDataManager) {
    const tabData: TabData = tabDataManager.getActivatedTabData()
    const response: Response<TabData> = await window[electronAPI.channel].saveAs(tabData)
    if (response.result && response.data) {
        const wasApplied = tabDataManager.applySaveResult(response.data)
        if (!wasApplied) await tabDataManager.addTab(response.data.id, response.data.filePath, response.data.fileName, response.data.content, true)
    }
}

async function performCloseTab(tabDataManager: TabDataManager, id: number) {
    const tabData = tabDataManager.getTabDataById(id)
    const response: Response<void> = await window[electronAPI.channel].closeTab(tabData)
    if (response.result) tabDataManager.removeTab(tabData.id)
}