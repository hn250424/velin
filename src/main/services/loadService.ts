import ITreeUtils from "@main/modules/contracts/ITreeUtils"
import ITreeRepository from "src/main/modules/contracts/ITreeRepository"
import { electronAPI } from "@shared/constants/electronAPI/electronAPI"
import TreeDto from "@shared/dto/TreeDto"
import { BrowserWindow } from "electron"
import IFileManager from "../modules/contracts/IFileManager"
import ITabRepository from "../modules/contracts/ITabRepository"
import ITabUtils from "../modules/contracts/ITabUtils"
import IFileWatcher from "@main/modules/contracts/IFileWatcher"
import ISideRepository from "@main/modules/contracts/ISideRepository"
import SideDto from "@shared/dto/SideDto"

export async function loadedRenderer(
    mainWindow: BrowserWindow,
    fileManager: IFileManager,
    fileWatcher: IFileWatcher,
    sideRepository: ISideRepository,
    tabRepository: ITabRepository,
    treeRepository: ITreeRepository,
    tabUtils: ITabUtils,
    treeUtils: ITreeUtils
) {
    const sideSession = await sideRepository.readSideSession()

    const tabSession = await tabRepository.readTabSession()
    const newTabSession = tabSession ? await tabUtils.syncSessionWithFs(tabSession) : null
    if (newTabSession) await tabRepository.writeTabSession(newTabSession)
    
    const treeSession = await treeRepository.readTreeSession()
    const newTreeSession = treeSession ? await treeUtils.syncWithFs(treeSession) : null
    if (newTreeSession) await treeRepository.writeTreeSession(newTreeSession)

    const sideDto = sideSession ? sideSession as SideDto : null
    const tabDto = newTabSession ? await tabUtils.toTabEditorsDto(newTabSession) : null
    const treeDto = newTreeSession ? newTreeSession as TreeDto : null

    mainWindow.webContents.send(electronAPI.events.mainToRenderer.session, sideDto, tabDto, treeDto)
    fileManager.cleanTrash()

    if (newTreeSession) fileWatcher.watch(newTreeSession.path)
}