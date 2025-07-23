import TreeDto from "@shared/dto/TreeDto"
import TreeSessionModel from "@main/models/TreeSessionModel"

export default interface ITreeManager {
    getDirectoryTree(dirPath: string, indent?: number): Promise<TreeDto>
    updateSessionWithFsData(dirPath: string, indent: number, fsChildren: TreeDto[], preTree: TreeSessionModel): Promise<TreeSessionModel | null>
    syncWithFs(node: TreeDto): Promise<TreeSessionModel | null>
}