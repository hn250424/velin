import TabData from "@shared/types/TabData"
import { BrowserWindow } from "electron"

export default interface IFileService {
    newTab(): Promise<number>
    openFile(): Promise<TabData>
    save(data: TabData, mainWindow: BrowserWindow): Promise<TabData>
    saveAs(data: TabData, mainWindow: BrowserWindow): Promise<TabData>
    saveAll(data: TabData[], mainWindow: BrowserWindow): Promise<TabData[]>
    closeTab(data: TabData, mainWindow: BrowserWindow): Promise<boolean>
    closeTabsExcept(exceptData: TabData, allData: TabData[], mainWindow: BrowserWindow): Promise<boolean[]>
    closeTabsToRight(referenceData: TabData, allData: TabData[], mainWindow: BrowserWindow): Promise<boolean[]>
    closeAllTabs(data: TabData[], mainWindow: BrowserWindow): Promise<boolean[]>
}