import TabEditorDto from "@shared/dto/TabEditorDto"
import { BrowserWindow } from "electron"

export default interface ITabService {
    closeTab(data: TabEditorDto, mainWindow: BrowserWindow): Promise<boolean>
    closeTabsExcept(exceptData: TabEditorDto, allData: TabEditorDto[], mainWindow: BrowserWindow): Promise<boolean[]>
    closeTabsToRight(referenceData: TabEditorDto, allData: TabEditorDto[], mainWindow: BrowserWindow): Promise<boolean[]>
    closeAllTabs(data: TabEditorDto[], mainWindow: BrowserWindow): Promise<boolean[]>
}