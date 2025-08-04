import TreeDto from "@shared/dto/TreeDto"
import TrashMap from "@shared/types/TrashMap"
import ClipboardMode from "@shared/types/ClipboardMode"
import Response from "@shared/types/Response"

export default interface ITreeService {
    rename(prePath: string, newPath: string): Promise<Response<string>>
    copy(to: string, from: string): Promise<void>
    paste(targetDto: TreeDto, selectedDtos: TreeDto[], clipboardMode: ClipboardMode): Promise<Response<string[]>>
    delete(arr: string[]): Promise<TrashMap[] | null>
    deletePermanently(path: string): Promise<void>
    create(path: string, directory: boolean): Promise<void>
    undo_delete(trashMap: TrashMap[] | null): Promise<boolean>
    syncTreeSessionFromRenderer(dto: TreeDto): Promise<boolean>
    getSyncedTreeSession(): Promise<TreeDto | null>
}