import ITreeManager from "@contracts/out/ITreeManager";
import ITreeRepository from "@contracts/out/ITreeRepository";
import { electronAPI } from "@shared/constants/electronAPI";
import TreeDto from "@shared/dto/TreeDto";
import { BrowserWindow } from "electron";
import IFileManager from "../ports/out/IFileManager";
import ITabRepository from "../ports/out/ITabRepository";
import { TabEditorsDto } from "@shared/dto/TabEditorDto";

export async function loadedRenderer(
    mainWindow: BrowserWindow,
    fileManager: IFileManager,
    tabRepository: ITabRepository,
    treeRepository: ITreeRepository,
    treeManager: ITreeManager
) {
    const newTabSessionArr = await getUpdatedTabSession(fileManager, tabRepository)
    const newTreeSession = await getUpdatedTreeSession(fileManager, treeRepository, treeManager)
    mainWindow.webContents.send(electronAPI.events.session, newTabSessionArr, newTreeSession as TreeDto)
}

async function getUpdatedTabSession(fileManager: IFileManager, tabRepository: ITabRepository) {
    const session = await tabRepository.readTabSession()
    if (!session) return null
    const sessionData = session.data

    let isChanged = false
    const newTabSessionArr = await Promise.all(
        sessionData.map(async (data) => {
            const filePath = data.filePath ?? ''
            try {
                if (!filePath) throw new Error('No file path')

                await fileManager.exists(filePath)
                const fileName = fileManager.getBasename(filePath)
                const content = await fileManager.read(data.filePath)
                return {
                    id: data.id,
                    isModified: false,
                    filePath: filePath,
                    fileName: fileName,
                    content: content,
                }
            } catch (e) {
                if (!isChanged) isChanged = true
                return {
                    id: data.id,
                    isModified: false,
                    filePath: '',
                    fileName: '',
                    content: '',
                }
            }
        })
    )

    if (isChanged) {
        const sessionArr = newTabSessionArr.map(({ id, filePath }) => ({ id, filePath }))
        await tabRepository.writeTabSession({
            activatedId: session.activatedId,
            data: sessionArr
        })
    }

    return {
        activatedId: session.activatedId,
        data: newTabSessionArr
    }
}

async function getUpdatedTreeSession(fileManager: IFileManager, treeRepository: ITreeRepository, treeManager: ITreeManager) {
    async function syncTree(node: TreeDto): Promise<TreeDto | null> {
        const exists = await fileManager.exists(node.path)
        if (!exists) return null

        if (!node.directory) return node

        if (!node.expanded) {
            return {
                ...node,
                children: null
            }
        }

        const current = await treeManager.getDirectoryTree(node.path, node.indent)
        const sessionChildren = node.children ?? []
        const sessionMap = new Map(sessionChildren.map((c) => [c.path, c]))

        const updatedChildren: TreeDto[] = []

        for (const child of current.children ?? []) {
            const sessionChild = sessionMap.get(child.path)
            const merged = await syncTree(sessionChild ?? child)
            if (merged) updatedChildren.push(merged)
        }

        return {
            ...node,
            expanded: node.expanded,
            children: updatedChildren.length > 0 ? updatedChildren : null,
        }
    }

    const treeSession = await treeRepository.readTreeSession()
    if (!treeSession) return null

    const newTreeSession = await syncTree(treeSession)
    await treeRepository.writeTreeSession(newTreeSession)
    return newTreeSession
}