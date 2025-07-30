import ITreeManager from "src/main/modules/contracts/ITreeManager"
import ITreeRepository from "src/main/modules/contracts/ITreeRepository"
import { electronAPI } from "@shared/constants/electronAPI/electronAPI"
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
    
    mainWindow.webContents.send(electronAPI.events.mainToRenderer.session, newTabSession, newTreeSession as TreeDto)
    fileManager.cleanTrash()
}