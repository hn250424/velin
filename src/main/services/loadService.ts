import ITreeManager from "src/main/modules/contracts/ITreeManager"
import ITreeRepository from "src/main/modules/contracts/ITreeRepository"
import { electronAPI } from "@shared/constants/electronAPI"
import TreeDto from "@shared/dto/TreeDto"
import { BrowserWindow } from "electron"
import IFileManager from "../modules/contracts/IFileManager"
import ITabRepository from "../modules/contracts/ITabRepository"

export async function loadedRenderer(
    mainWindow: BrowserWindow,
    fileManager: IFileManager,
    tabRepository: ITabRepository,
    treeRepository: ITreeRepository,
    treeManager: ITreeManager
) {
    const newTabSessionArr = await getUpdatedTabSession(fileManager, tabRepository)
    
    const treeSession = await treeRepository.readTreeSession()
    const newTreeSession = treeSession ? await treeManager.syncWithFs(treeSession) : null
    if (newTreeSession) await treeRepository.writeTreeSession(newTreeSession)
    
    mainWindow.webContents.send(electronAPI.events.session, newTabSessionArr, newTreeSession as TreeDto)
    fileManager.cleanTrash()
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

// async function getUpdatedTreeSession(fileManager: IFileManager, treeRepository: ITreeRepository, treeManager: ITreeManager) {
//     async function syncTree(node: TreeDto): Promise<TreeDto | null> {
//         const exists = await fileManager.exists(node.path)
//         if (!exists) return null

//         if (!node.directory) return node

//         if (!node.expanded) {
//             return {
//                 ...node,
//                 children: null
//             }
//         }

//         const current = await treeManager.getDirectoryTree(node.path, node.indent)
//         const sessionChildren = node.children ?? []
//         const sessionMap = new Map(sessionChildren.map((c) => [c.path, c]))

//         const updatedChildren: TreeDto[] = []

//         for (const child of current.children ?? []) {
//             const sessionChild = sessionMap.get(child.path)
//             const merged = await syncTree(sessionChild ?? child)
//             if (merged) updatedChildren.push(merged)
//         }

//         return {
//             ...node,
//             expanded: node.expanded,
//             children: updatedChildren.length > 0 ? updatedChildren : null,
//         }
//     }

//     const treeSession = await treeRepository.readTreeSession()
//     if (!treeSession) return null

//     const newTreeSession = await syncTree(treeSession)
//     await treeRepository.writeTreeSession(newTreeSession)
//     return newTreeSession
// }