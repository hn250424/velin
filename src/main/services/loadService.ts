import ITreeManager from "src/main/modules/contracts/ITreeManager"
import ITreeRepository from "src/main/modules/contracts/ITreeRepository"
import { electronAPI } from "@shared/constants/electronAPI"
import TreeDto from "@shared/dto/TreeDto"
import { BrowserWindow } from "electron"
import IFileManager from "../modules/contracts/IFileManager"
import ITabRepository from "../modules/contracts/ITabRepository"
import ITabManager from "../modules/contracts/ITabManager"

export async function loadedRenderer(
    mainWindow: BrowserWindow,
    fileManager: IFileManager,
    tabRepository: ITabRepository,
    treeRepository: ITreeRepository,
    tabManager: ITabManager,
    treeManager: ITreeManager
) {
    const tabSession = await tabRepository.readTabSession()
    const newTabSession = tabSession ? await tabManager.syncWithFs(tabSession) : null
    if (newTabSession) await tabRepository.writeTabSession(newTabSession)
    
    const treeSession = await treeRepository.readTreeSession()
    const newTreeSession = treeSession ? await treeManager.syncWithFs(treeSession) : null
    if (newTreeSession) await treeRepository.writeTreeSession(newTreeSession)
    
    mainWindow.webContents.send(electronAPI.events.session, newTabSession, newTreeSession as TreeDto)
    fileManager.cleanTrash()
}

// async function getUpdatedTabSession(fileManager: IFileManager, tabRepository: ITabRepository) {
//     const session = await tabRepository.readTabSession()
//     if (!session) return null
//     const sessionData = session.data

//     let isChanged = false
//     const newTabSessionArr = await Promise.all(
//         sessionData.map(async (data) => {
//             const filePath = data.filePath ?? ''
//             try {
//                 if (!filePath) throw new Error('No file path')

//                 await fileManager.exists(filePath)
//                 const fileName = fileManager.getBasename(filePath)
//                 const content = await fileManager.read(data.filePath)
//                 return {
//                     id: data.id,
//                     isModified: false,
//                     filePath: filePath,
//                     fileName: fileName,
//                     content: content,
//                 }
//             } catch (e) {
//                 if (!isChanged) isChanged = true
//                 return {
//                     id: data.id,
//                     isModified: false,
//                     filePath: '',
//                     fileName: '',
//                     content: '',
//                 }
//             }
//         })
//     )

//     if (isChanged) {
//         const sessionArr = newTabSessionArr.map(({ id, filePath }) => ({ id, filePath }))
//         await tabRepository.writeTabSession({
//             activatedId: session.activatedId,
//             data: sessionArr
//         })
//     }

//     return {
//         activatedId: session.activatedId,
//         data: newTabSessionArr
//     }
// }