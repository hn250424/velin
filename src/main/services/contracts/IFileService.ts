import TreeNode from "@shared/types/TreeNode"
import TabEditorDto from "@shared/dto/TabEditorDto"
import { BrowserWindow } from "electron"

export default interface IFileService {
    newTab(): Promise<number>
    openFile(): Promise<TabEditorDto>
    openDirectory(treeNode?: TreeNode): Promise<TreeNode>
    save(data: TabEditorDto, mainWindow: BrowserWindow): Promise<TabEditorDto>
    saveAs(data: TabEditorDto, mainWindow: BrowserWindow): Promise<TabEditorDto>
    saveAll(data: TabEditorDto[], mainWindow: BrowserWindow): Promise<TabEditorDto[]>
}