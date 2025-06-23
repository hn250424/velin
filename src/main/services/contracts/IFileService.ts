import { BrowserWindow } from "electron"
import Response from "@shared/types/Response"
import TabData from "@shared/types/TabData"

export default interface IFileService {
    newTab(): Promise<Response<number>>
    open(): Promise<Response<TabData>>
    save(data: TabData, mainWindow: BrowserWindow): Promise<Response<TabData>>
    saveAs(data: TabData, mainWindow: BrowserWindow): Promise<Response<TabData>>
    saveAll(data: TabData[], mainWindow: BrowserWindow): Promise<Response<TabData[]>>
    closeTab(data: TabData, mainWindow: BrowserWindow): Promise<Response<void>>
}