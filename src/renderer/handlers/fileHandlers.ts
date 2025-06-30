import "@milkdown/theme-nord/style.css"

import { electronAPI } from '@shared/constants/electronAPI'
import Response from "@shared/types/Response"
import TabData from "@shared/types/TabData"
import TabAndEditorManager from "../modules/features/TabAndEditorManager"
import shortcutRegistry from "../modules/features/shortcutRegistry"
import TreeNode from "@shared/types/TreeNode"
import TreeLayoutMaanger from "../modules/features/TreeLayoutManger"
import performOpenDirectory from "../actions/performOpenDirectory"
import { DATASET_ATTR_TREE_PATH } from "../constants/dom"

export default function registerFileHandlers() {
    const tabAndEditorManager = TabAndEditorManager.getInstance()
    const treeLayoutManager = TreeLayoutMaanger.getInstance()

    bindMenuFileCommands(tabAndEditorManager, treeLayoutManager)

    shortcutRegistry.register('Ctrl+T', async () => await performNewTab(tabAndEditorManager))
    shortcutRegistry.register('Ctrl+O', async () => await performOpenFile(tabAndEditorManager))
    shortcutRegistry.register('Ctrl+Shift+O', async () => {
        await performOpenDirectory(treeLayoutManager)
    })
    shortcutRegistry.register('Ctrl+S', async () => await performSave(tabAndEditorManager))
    shortcutRegistry.register('Ctrl+Shift+S', async () => await performSaveAs(tabAndEditorManager))

    // TODO test.
        ; (async () => {
            const rootNode: TreeNode = {
                path: 'D:\\node-workspace\\velin\\test_file',
                indent: 0,
                name: 'test_file',
                directory: true,
                expanded: false,
                children: null
            }
            treeLayoutManager.setTreeNodeByPath(rootNode.path, rootNode)

            const treeDiv = document.createElement('div')
            treeDiv.classList.add('tree_node')
            treeDiv.dataset[DATASET_ATTR_TREE_PATH] = rootNode.path
            treeDiv.title = rootNode.path

            const openStatus = document.createElement('span')
            openStatus.classList.add('tree_node_open_status')
            openStatus.textContent = '▶'
            treeDiv.appendChild(openStatus)

            const treeChildren = document.createElement('div')
            treeChildren.classList.add('tree_children')
            treeChildren.style.display = 'none'

            const treeContainer = document.getElementById('tree_content')!
            treeContainer.appendChild(treeDiv)
            treeContainer.appendChild(treeChildren)

            await performOpenDirectory(treeLayoutManager, treeDiv)
        })()
}

function bindMenuFileCommands(tabAndEditorManager: TabAndEditorManager, treeLayoutManager: TreeLayoutMaanger) {
    document.getElementById('file_menu_new_tab').addEventListener('click', async () => {
        await performNewTab(tabAndEditorManager)
    })

    document.getElementById('file_menu_open_file').addEventListener('click', async () => {
        await performOpenFile(tabAndEditorManager)
    })

    document.getElementById('file_menu_open_directory').addEventListener('click', async () => {
        await performOpenDirectory(treeLayoutManager)
    })

    document.getElementById('file_menu_save').addEventListener('click', async () => {
        await performSave(tabAndEditorManager)
    })

    document.getElementById('file_menu_save_as').addEventListener('click', async () => {
        await performSaveAs(tabAndEditorManager)
    })

    document.getElementById('file_menu_save_all').addEventListener('click', async () => {
        const tabsData: TabData[] = tabAndEditorManager.getAllTabData()
        const response: Response<TabData[]> = await window[electronAPI.channel].saveAll(tabsData)
        if (response.result) tabAndEditorManager.applySaveAllResults(response.data)
    })
}

async function performNewTab(tabAndEditorManager: TabAndEditorManager) {
    const response: Response<number> = await window[electronAPI.channel].newTab()
    if (response.result) await tabAndEditorManager.addTab(response.data)
}

async function performOpenFile(tabAndEditorManager: TabAndEditorManager) {
    const response: Response<TabData> = await window[electronAPI.channel].openFile()
    if (response.result) {
        const data = response.data
        await tabAndEditorManager.addTab(data.id, data.filePath, data.fileName, data.content)
    }
}

async function performSave(tabAndEditorManager: TabAndEditorManager) {
    const tabData = tabAndEditorManager.getActivatedTabData()
    if (!tabData.isModified) return
    const response: Response<TabData> = await window[electronAPI.channel].save(tabData)
    if (response.result && !response.data.isModified) tabAndEditorManager.applySaveResult(response.data)
}

async function performSaveAs(tabAndEditorManager: TabAndEditorManager) {
    const tabData: TabData = tabAndEditorManager.getActivatedTabData()
    const response: Response<TabData> = await window[electronAPI.channel].saveAs(tabData)
    if (response.result && response.data) {
        const wasApplied = tabAndEditorManager.applySaveResult(response.data)
        if (!wasApplied) await tabAndEditorManager.addTab(response.data.id, response.data.filePath, response.data.fileName, response.data.content, true)
    }
}

