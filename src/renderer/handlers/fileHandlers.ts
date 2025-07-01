import "@milkdown/theme-nord/style.css"

import { electronAPI } from '@shared/constants/electronAPI'
import Response from "@shared/types/Response"
import TabEditorDto from "@shared/dto/TabEditorDto"
import TabEditorManager from "../modules/features/TabEditorManager"
import shortcutRegistry from "../modules/features/shortcutRegistry"
import TreeNode from "@shared/types/TreeNode"
import TreeLayoutMaanger from "../modules/features/TreeLayoutManger"
import performOpenDirectory from "../actions/performOpenDirectory"
import { DATASET_ATTR_TREE_PATH } from "../constants/dom"

export default function registerFileHandlers() {
    const tabEditorManager = TabEditorManager.getInstance()
    const treeLayoutManager = TreeLayoutMaanger.getInstance()

    bindMenuFileCommands(tabEditorManager, treeLayoutManager)

    shortcutRegistry.register('Ctrl+T', async () => await performNewTab(tabEditorManager))
    shortcutRegistry.register('Ctrl+O', async () => await performOpenFile(tabEditorManager))
    shortcutRegistry.register('Ctrl+Shift+O', async () => {
        await performOpenDirectory(treeLayoutManager)
    })
    shortcutRegistry.register('Ctrl+S', async () => await performSave(tabEditorManager))
    shortcutRegistry.register('Ctrl+Shift+S', async () => await performSaveAs(tabEditorManager))

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

function bindMenuFileCommands(tabEditorManager: TabEditorManager, treeLayoutManager: TreeLayoutMaanger) {
    document.getElementById('file_menu_new_tab').addEventListener('click', async () => {
        await performNewTab(tabEditorManager)
    })

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
        const tabsData: TabEditorDto[] = tabEditorManager.getAllTabEditorData()
        const response: Response<TabEditorDto[]> = await window[electronAPI.channel].saveAll(tabsData)
        if (response.result) tabEditorManager.applySaveAllResults(response.data)
    })
}

async function performNewTab(tabEditorManager: TabEditorManager) {
    const response: Response<number> = await window[electronAPI.channel].newTab()
    if (response.result) await tabEditorManager.addTab(response.data)
}

async function performOpenFile(tabEditorManager: TabEditorManager) {
    const response: Response<TabEditorDto> = await window[electronAPI.channel].openFile()
    if (response.result) {
        const data = response.data
        await tabEditorManager.addTab(data.id, data.filePath, data.fileName, data.content)
    }
}

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

