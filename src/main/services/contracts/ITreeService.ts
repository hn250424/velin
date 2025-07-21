import TreeDto from "@shared/dto/TreeDto"

export default interface ITreeService {
    rename(prePath: string, newPath: string): Promise<boolean>
    delete(arr: string[]): Promise<boolean>
    syncTreeSession(dto: TreeDto): Promise<boolean>
}