import { TabEditorDto, TabEditorsDto } from "@shared/dto/TabEditorDto"
import { BrowserWindow } from "electron"

export default interface ITabService {
    closeTab(data: TabEditorDto, mainWindow: BrowserWindow): Promise<boolean>
    closeTabsExcept(exceptData: TabEditorDto, allData: TabEditorsDto, mainWindow: BrowserWindow): Promise<boolean[]>
    closeTabsToRight(referenceData: TabEditorDto, allData: TabEditorsDto, mainWindow: BrowserWindow): Promise<boolean[]>
    closeAllTabs(data: TabEditorsDto, mainWindow: BrowserWindow): Promise<boolean[]>
    rename(dto: TabEditorDto, newPath: string): Promise<TabEditorDto>
}