import TreeDto from "@shared/dto/TreeDto"
import TrashMap from "@shared/types/TrashMap"

export default interface ITreeService {
    rename(prePath: string, newPath: string): Promise<boolean>
    delete(arr: string[]): Promise<TrashMap[] | null>
    undo_delete(trashMap: TrashMap[] | null): Promise<boolean>
    syncTreeSession(dto: TreeDto): Promise<boolean>
    requestTreeSession(): Promise<TreeDto | null>
}