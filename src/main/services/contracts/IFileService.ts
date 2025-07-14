import { TabEditorDto, TabEditorsDto } from "@shared/dto/TabEditorDto"
import { BrowserWindow } from "electron"
import TreeDto from "@shared/dto/TreeDto"

export default interface IFileService {
    newTab(): Promise<number>
    openFile(filePath?: string): Promise<TabEditorDto>
    openDirectory(dto?: TreeDto): Promise<TreeDto>
    save(data: TabEditorDto, mainWindow: BrowserWindow): Promise<TabEditorDto>
    saveAs(data: TabEditorDto, mainWindow: BrowserWindow): Promise<TabEditorDto>
    saveAll(data: TabEditorsDto, mainWindow: BrowserWindow): Promise<TabEditorsDto>
}