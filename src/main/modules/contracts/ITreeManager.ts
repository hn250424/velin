import TreeDto from "@shared/dto/TreeDto"

export default interface ITreeManager {
    getDirectoryTree(dirPath: string, indent?: number): Promise<TreeDto>
}